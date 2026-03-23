// API client for Student Club Management System (Flask backend)

import { Club, Event, GalleryImage, Notification, User } from './types';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const AUTH_TOKEN_KEY = 'auth_token';

function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

async function parseJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text) as T;
}

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const headers: Record<string, string> = {
    ...((init?.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body: BodyInit | undefined = init?.body as BodyInit | undefined;
  if (init?.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(init.json);
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    headers,
    body,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await parseJson<{ message?: string } & Record<string, unknown>>(res);
  if (!res.ok) {
    const msg =
      (data && typeof data.message === 'string' && data.message) ||
      res.statusText ||
      'Request failed';
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      json: { email, password },
    });
    setAuthToken(data.token);
    return data;
  },

  async signup(
    name: string,
    email: string,
    password: string,
    clubId?: string
  ): Promise<{ user: User }> {
    const data = await request<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      json: { name, email, password, clubId: clubId || undefined },
    });
    setAuthToken(data.token);
    return { user: data.user };
  },

  async getClubs(): Promise<Club[]> {
    return request<Club[]>('/clubs', { method: 'GET' });
  },

  async getMyClubs(): Promise<Club[]> {
    return request<Club[]>('/clubs/my', { method: 'GET' });
  },

  async getClubById(id: string): Promise<Club | undefined> {
    try {
      return await request<Club>(`/clubs/${encodeURIComponent(id)}`, { method: 'GET' });
    } catch {
      return undefined;
    }
  },

  async joinClub(id: string): Promise<void> {
    await request<void>(`/clubs/${encodeURIComponent(id)}/join`, { method: 'POST' });
  },

  async createClub(clubData: Partial<Club>): Promise<Club> {

    return request<Club>('/clubs', {
      method: 'POST',
      json: {
        name: clubData.name,
        description: clubData.description,
        category: clubData.category,
        headId: clubData.headId,
        logo: clubData.logo,
      },
    });
  },

  async updateClub(id: string, clubData: Partial<Club>): Promise<Club> {
    return request<Club>(`/clubs/${encodeURIComponent(id)}`, {
      method: 'PUT',
      json: {
        name: clubData.name,
        description: clubData.description,
        category: clubData.category,
        points: clubData.points,
        headId: clubData.headId,
        logo: clubData.logo,
      },
    });
  },

  async deleteClub(id: string): Promise<void> {
    await request<void>(`/clubs/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async getEvents(): Promise<Event[]> {
    return request<Event[]>('/events', { method: 'GET' });
  },

  async getEventById(id: string): Promise<Event | undefined> {
    try {
      return await request<Event>(`/events/${encodeURIComponent(id)}`, { method: 'GET' });
    } catch {
      return undefined;
    }
  },

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    return request<Event>('/events', {
      method: 'POST',
      json: {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        clubId: eventData.clubId,
        createdBy: eventData.createdBy,
        attendanceCount: eventData.attendanceCount,
      },
    });
  },

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    return request<Event>(`/events/${encodeURIComponent(id)}`, {
      method: 'PUT',
      json: {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        status: eventData.status,
        attendanceCount: eventData.attendanceCount,
      },
    });
  },

  async approveEvent(id: string): Promise<Event> {
    return request<Event>(`/events/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
    });
  },

  async rejectEvent(id: string): Promise<Event> {
    return request<Event>(`/events/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
    });
  },

  async deleteEvent(id: string): Promise<void> {
    await request<void>(`/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async getNotifications(): Promise<Notification[]> {

    return request<Notification[]>('/notifications', { method: 'GET' });
  },

  async markNotificationRead(id: string): Promise<void> {
    await request<void>(`/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PUT',
    });
  },

  async getGalleryImages(): Promise<GalleryImage[]> {
    return request<GalleryImage[]>('/gallery', { method: 'GET' });
  },

  async uploadGalleryImage(eventId: string, imageFile: File): Promise<GalleryImage> {
    const token = getToken();
    const fd = new FormData();
    fd.append('file', imageFile);
    fd.append('eventId', eventId);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/api/gallery/upload`, {
      method: 'POST',
      headers,
      body: fd,
    });
    const data = await parseJson<GalleryImage & { message?: string }>(res);
    if (!res.ok) {
      throw new Error((data && (data as { message?: string }).message) || res.statusText);
    }
    return data as GalleryImage;
  },

  async deleteGalleryImage(id: string): Promise<void> {
    await request<void>(`/gallery/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async getUsers(): Promise<User[]> {
    return request<User[]>('/users', { method: 'GET' });
  },

  async updateUserRole(userId: string, role: string): Promise<User> {
    return request<User>(`/users/${encodeURIComponent(userId)}/role`, {
      method: 'PUT',
      json: { role },
    });
  },

  async getYearlyReport(year: number): Promise<unknown> {
    return request(`/reports/yearly?year=${encodeURIComponent(String(year))}`, {
      method: 'GET',
    });
  },
};
