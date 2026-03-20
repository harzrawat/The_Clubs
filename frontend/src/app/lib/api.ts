// Mock API service for Student Club Management System
// In production, these would call the Flask backend REST APIs

import { Club, Event, Notification, GalleryImage, User } from './types';
import { mockClubs, mockEvents, mockNotifications, mockGalleryImages, mockUsers } from './mock-data';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication
export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(500);
    // Mock login - in production, would call POST /auth/login
    const user = mockUsers.find(u => u.email === email) || mockUsers[3];
    return { user, token: 'mock-token-' + Math.random() };
  },

  async signup(name: string, email: string, password: string, clubId?: string): Promise<{ user: User }> {
    await delay(500);
    // Mock signup - in production, would call POST /auth/signup
    const newUser: User = {
      id: 'user-' + Date.now(),
      name,
      email,
      role: 'student',
      clubId,
    };
    return { user: newUser };
  },

  // Clubs
  async getClubs(): Promise<Club[]> {
    await delay(300);
    // In production: GET /clubs
    return mockClubs;
  },

  async getClubById(id: string): Promise<Club | undefined> {
    await delay(300);
    // In production: GET /clubs/:id
    return mockClubs.find(c => c.id === id);
  },

  async createClub(clubData: Partial<Club>): Promise<Club> {
    await delay(500);
    // In production: POST /clubs
    const newClub: Club = {
      id: 'club-' + Date.now(),
      name: clubData.name || '',
      description: clubData.description || '',
      category: clubData.category || '',
      memberCount: 0,
      points: 0,
      headId: clubData.headId || '',
      createdAt: new Date().toISOString(),
    };
    return newClub;
  },

  async updateClub(id: string, clubData: Partial<Club>): Promise<Club> {
    await delay(500);
    // In production: PUT /clubs/:id
    const club = mockClubs.find(c => c.id === id);
    return { ...club!, ...clubData };
  },

  async deleteClub(id: string): Promise<void> {
    await delay(500);
    // In production: DELETE /clubs/:id
  },

  // Events
  async getEvents(): Promise<Event[]> {
    await delay(300);
    // In production: GET /events
    return mockEvents;
  },

  async getEventById(id: string): Promise<Event | undefined> {
    await delay(300);
    // In production: GET /events/:id
    return mockEvents.find(e => e.id === id);
  },

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    await delay(500);
    // In production: POST /events/create
    const club = mockClubs.find(c => c.id === eventData.clubId);
    const newEvent: Event = {
      id: 'event-' + Date.now(),
      title: eventData.title || '',
      description: eventData.description || '',
      date: eventData.date || '',
      time: eventData.time || '',
      location: eventData.location || '',
      clubId: eventData.clubId || '',
      clubName: club?.name || '',
      status: 'pending',
      createdBy: eventData.createdBy || '',
    };
    return newEvent;
  },

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    await delay(500);
    // In production: PUT /events/:id
    const event = mockEvents.find(e => e.id === id);
    return { ...event!, ...eventData };
  },

  async approveEvent(id: string): Promise<Event> {
    await delay(500);
    // In production: POST /approve/event
    const event = mockEvents.find(e => e.id === id);
    return { ...event!, status: 'approved' };
  },

  async rejectEvent(id: string): Promise<Event> {
    await delay(500);
    // In production: POST /reject/event
    const event = mockEvents.find(e => e.id === id);
    return { ...event!, status: 'rejected' };
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    await delay(300);
    // In production: GET /notifications
    // Role-based filtering (so admins don't see student reminders, etc.)
    // We read the current logged-in user from localStorage (AuthProvider already stores it).
    let role: string | null = null;
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser) as Partial<User>;
        role = (parsed.role as string) || null;
      }
    } catch {
      role = null;
    }

    if (!role) return [];

    const allowedTypes = new Set<Notification['type']>();
    if (role === 'admin') {
      allowedTypes.add('event_approval');
      allowedTypes.add('announcement');
    } else if (role === 'club_head') {
      allowedTypes.add('event_approval');
      allowedTypes.add('event_reminder');
      allowedTypes.add('announcement');
    } else if (role === 'student') {
      allowedTypes.add('event_reminder');
      allowedTypes.add('announcement');
    }

    return mockNotifications.filter(n => allowedTypes.has(n.type));
  },

  async markNotificationRead(id: string): Promise<void> {
    await delay(200);
    // In production: PUT /notifications/:id/read
  },

  // Gallery
  async getGalleryImages(): Promise<GalleryImage[]> {
    await delay(300);
    // In production: GET /gallery
    return mockGalleryImages;
  },

  async uploadGalleryImage(eventId: string, imageFile: File): Promise<GalleryImage> {
    await delay(1000);
    // In production: POST /gallery/upload
    const event = mockEvents.find(e => e.id === eventId);
    return {
      id: 'img-' + Date.now(),
      eventId,
      eventName: event?.title || '',
      url: URL.createObjectURL(imageFile),
      uploadedAt: new Date().toISOString(),
    };
  },

  // Users
  async getUsers(): Promise<User[]> {
    await delay(300);
    // In production: GET /users
    return mockUsers;
  },

  async updateUserRole(userId: string, role: string): Promise<User> {
    await delay(500);
    // In production: PUT /users/:id/role
    const user = mockUsers.find(u => u.id === userId);
    return { ...user!, role: role as any };
  },

  // Reports
  async getYearlyReport(year: number): Promise<any> {
    await delay(500);
    // In production: GET /yearly-report?year=:year
    return {
      year,
      totalEvents: 45,
      totalClubs: 12,
      totalParticipants: 890,
      monthlyData: [
        { month: 'Jan', events: 3 },
        { month: 'Feb', events: 5 },
        { month: 'Mar', events: 7 },
        { month: 'Apr', events: 8 },
        { month: 'May', events: 6 },
        { month: 'Jun', events: 4 },
        { month: 'Jul', events: 2 },
        { month: 'Aug', events: 3 },
        { month: 'Sep', events: 5 },
        { month: 'Oct', events: 7 },
        { month: 'Nov', events: 8 },
        { month: 'Dec', events: 4 },
      ],
    };
  },
};
