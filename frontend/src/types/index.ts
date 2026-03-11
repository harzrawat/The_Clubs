export type Role = 'STUDENT' | 'CLUB_HEAD' | 'ADMIN';

export interface User {
    id: string;
    name: string;
    role: Role;
    email: string;
    clubIDs?: string[];
}

export interface ClubEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    clubID: string;
    status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

export interface Club {
    id: string;
    name: string;
    description: string;
    member_count: number;
    clubHeadID: string;
    events: ClubEvent[];
}
