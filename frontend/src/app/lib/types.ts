// Types for Student Club Management System

export type UserRole = 'admin' | 'club_head' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clubId?: string;
  joinedClubIds?: string[];
}


export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  points: number;
  logo?: string;
  headId: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  clubId: string;
  clubName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  attendanceCount?: number;
  images?: string[];
}

export interface Notification {
  id: string;
  type: 'event_approval' | 'event_reminder' | 'announcement';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  eventId: string;
  eventName: string;
  clubId: string;
  clubName: string;
  url: string;
  uploadedAt: string;
}

export interface Report {
  id: string;
  type: 'yearly' | 'club_performance';
  title: string;
  year: number;
  data: any;
  generatedAt: string;
}
