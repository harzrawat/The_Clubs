// Top Navigation Bar

import { Link, useNavigate } from 'react-router';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../lib/auth-context';
import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Notification } from '../../lib/types';

interface TopNavProps {
  onMenuClick?: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications().then(setNotifications);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleRead = (e: CustomEvent) => {
      setNotifications(prev => prev.map(n => n.id === e.detail ? { ...n, read: true } : n));
    };
    const handleReadAll = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };
    
    window.addEventListener('notification-read', handleRead as EventListener);
    window.addEventListener('notification-read-all', handleReadAll as EventListener);
    
    return () => {
      window.removeEventListener('notification-read', handleRead as EventListener);
      window.removeEventListener('notification-read-all', handleReadAll as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!showNotifications && !showUserMenu) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (showNotifications && notificationsRef.current?.contains(target)) return;
      if (showUserMenu && userMenuRef.current?.contains(target)) return;

      setShowNotifications(false);
      setShowUserMenu(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [showNotifications, showUserMenu]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id: string) => {
    api.markNotificationRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    window.dispatchEvent(new CustomEvent('notification-read', { detail: id }));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold">SC</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              Student Club Management
            </span>
            <span className="font-bold sm:hidden">SCM</span>
          </Link>
        </div>

        
        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Notifications"
                  type="button"
                  onClick={() => {
                    setShowNotifications(prev => !prev);
                    setShowUserMenu(false);
                  }}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover text-popover-foreground shadow-md z-50">
                    <div className="flex items-center justify-between border-b px-2 py-1.5 text-sm font-medium">
                      <span>Notifications</span>
                      {notifications.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifications([]);
                          }}
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notification => (
                          <button
                            key={notification.id}
                            className="flex w-full flex-col items-start gap-1 p-3 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() => handleNotificationClick(notification.id)}
                            type="button"
                          >
                            <div className="flex w-full items-center justify-between">
                              <span className="font-medium">{notification.title}</span>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {notification.message}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="User menu"
                  type="button"
                  onClick={() => {
                    setShowUserMenu(prev => !prev);
                    setShowNotifications(false);
                  }}
                >
                  <User className="h-5 w-5" />
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover text-popover-foreground shadow-md z-50">
                    <div className="border-b px-2 py-1.5 text-sm font-medium">
                      <div className="flex flex-col">
                        <span>{user?.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {user?.email}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground capitalize">
                          Role: {user?.role?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        type="button"
                        className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          setShowUserMenu(false);
                        }}
                      >
                        <Link 
                          to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'club_head' ? '/my-events' : '/dashboard'} 
                          className="w-full text-left"
                        >
                          Dashboard
                        </Link>
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          setShowUserMenu(false);
                        }}
                      >
                        <Link to="/notifications" className="w-full text-left">
                          All Notifications
                        </Link>
                      </button>
                      <div className="my-1 h-px bg-border" />
                      <button
                        type="button"
                        className="flex w-full items-center px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                          navigate('/');
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
