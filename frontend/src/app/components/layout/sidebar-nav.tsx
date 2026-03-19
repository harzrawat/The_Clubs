// Sidebar Navigation for authenticated users

import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Image,
  Trophy,
  Bell,
  Settings,
  UserCog,
  CheckSquare,
  BarChart3,
  Plus,
  List,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useAuth } from '../../lib/auth-context';

interface SidebarNavProps {
  onLinkClick?: () => void;
}

export function SidebarNav({ onLinkClick }: SidebarNavProps) {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/clubs', label: 'Clubs', icon: Users },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const clubHeadItems = [
    { path: '/my-events', label: 'My Events', icon: List },
    { path: '/create-event', label: 'Create Event', icon: Plus },
  ];

  const adminItems = [
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { path: '/admin/event-approval', label: 'Event Approval', icon: CheckSquare },
    { path: '/admin/manage-clubs', label: 'Manage Clubs', icon: Users },
    { path: '/admin/manage-users', label: 'Manage Users', icon: UserCog },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 border-r bg-card h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="space-y-1 p-4">
        {/* Admin Specific - shown at top for admins */}
        {user?.role === 'admin' && (
          <div className="my-4 border-b pb-4">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Administration
            </h3>
            <div className="space-y-1">
              {adminItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Club Head Specific - shown at top for club_head (and below admin section for admins) */}
        {(user?.role === 'club_head' || user?.role === 'admin') && (
          <div className="my-4 border-b pb-4">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Club Management
            </h3>
            <div className="space-y-1">
              {clubHeadItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Common Navigation - shown after role-specific sections */}
        <div className="space-y-1 pt-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
