// Routes configuration

import { createBrowserRouter } from 'react-router';
import { MainLayout } from './components/layout/main-layout';

// Public pages
import Home from './pages/home';
import ClubsPage from './pages/clubs';
import ClubDetailsPage from './pages/club-details';
import EventsPage from './pages/events';
import CalendarPage from './pages/calendar';
import GalleryPage from './pages/gallery';
import LeaderboardPage from './pages/leaderboard';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';

// Authenticated user pages
import DashboardPage from './pages/dashboard';
import NotificationsPage from './pages/notifications';
import CreateEventPage from './pages/create-event';
import MyEventsPage from './pages/my-events';

// Admin pages
import AdminDashboardPage from './pages/admin/admin-dashboard';
import EventApprovalPage from './pages/admin/event-approval';
import ManageClubsPage from './pages/admin/manage-clubs';
import ManageUsersPage from './pages/admin/manage-users';
import ReportsPage from './pages/admin/reports';

// 404 Page
function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MainLayout,
    children: [
      // Public routes
      { index: true, Component: Home },
      { path: 'clubs', Component: ClubsPage },
      { path: 'clubs/:id', Component: ClubDetailsPage },
      { path: 'events', Component: EventsPage },
      { path: 'calendar', Component: CalendarPage },
      { path: 'gallery', Component: GalleryPage },
      { path: 'leaderboard', Component: LeaderboardPage },
      { path: 'login', Component: LoginPage },
      { path: 'signup', Component: SignupPage },

      // Authenticated user routes
      { path: 'dashboard', Component: DashboardPage },
      { path: 'notifications', Component: NotificationsPage },
      { path: 'create-event', Component: CreateEventPage },
      { path: 'my-events', Component: MyEventsPage },

      // Admin routes
      { path: 'admin/dashboard', Component: AdminDashboardPage },
      { path: 'admin/event-approval', Component: EventApprovalPage },
      { path: 'admin/manage-clubs', Component: ManageClubsPage },
      { path: 'admin/manage-users', Component: ManageUsersPage },
      { path: 'admin/reports', Component: ReportsPage },

      // 404
      { path: '*', Component: NotFound },
    ],
  },
]);
