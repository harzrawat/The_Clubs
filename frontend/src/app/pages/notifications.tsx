// Notifications Page

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { api } from '../lib/api';
import { Notification } from '../lib/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    api.getNotifications().then(setNotifications);

    const handleRead = (e: CustomEvent) => {
      setNotifications(prev => prev.map(n => n.id === e.detail ? { ...n, read: true } : n));
    };
    window.addEventListener('notification-read', handleRead as EventListener);
    
    return () => {
      window.removeEventListener('notification-read', handleRead as EventListener);
    };
  }, []);

  const handleMarkAsRead = (id: string) => {
    api.markNotificationRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    window.dispatchEvent(new CustomEvent('notification-read', { detail: id }));
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        api.markNotificationRead(n.id);
      }
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    window.dispatchEvent(new CustomEvent('notification-read-all'));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_approval':
        return '📋';
      case 'announcement':
        return '📢';
      case 'event_reminder':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest announcements and event updates
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-sm text-muted-foreground">
              You'll see notifications here when you get them
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors hover:bg-accent ${
                !notification.read ? 'border-l-4 border-l-primary' : ''
              }`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <CardContent className="flex items-start gap-4 p-6">
                <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3>{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="default" className="mt-1">
                          New
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{notification.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
