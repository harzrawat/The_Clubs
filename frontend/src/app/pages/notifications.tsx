// Notifications Page

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { Notification } from '../lib/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'single' | 'selected' | 'all' | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

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

  const handleDelete = async (ids: string[] | 'all') => {
    try {
      await api.deleteNotifications(ids);
      if (ids === 'all') {
        setNotifications([]);
        setSelectedIds([]);
      } else {
        setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
        setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
      }
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const confirmDelete = (type: 'single' | 'selected' | 'all', id?: string) => {
    let hasUnread = false;
    if (type === 'single' && id) {
      hasUnread = !notifications.find(n => n.id === id)?.read;
    } else if (type === 'selected') {
      hasUnread = notifications.some(n => selectedIds.includes(n.id) && !n.read);
    } else if (type === 'all') {
      hasUnread = notifications.some(n => !n.read);
    }

    if (hasUnread) {
      setConfirmType(type);
      setTargetId(id || null);
      setShowConfirm(true);
    } else {
      // Execute delete immediately
      if (type === 'single' && id) handleDelete([id]);
      else if (type === 'selected') handleDelete(selectedIds);
      else if (type === 'all') handleDelete('all');
    }
  };

  const executeConfirmedDelete = () => {
    if (confirmType === 'single' && targetId) handleDelete([targetId]);
    else if (confirmType === 'selected') handleDelete(selectedIds);
    else if (confirmType === 'all') handleDelete('all');
    
    setShowConfirm(false);
    setConfirmType(null);
    setTargetId(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest announcements and event updates
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {notifications.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="h-9"
              >
                {selectedIds.length === notifications.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              {selectedIds.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => confirmDelete('selected')}
                  className="h-9"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedIds.length})
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => confirmDelete('all')}
                className="h-9 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All
              </Button>
            </>
          )}
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="h-9">
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
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
            <div key={notification.id} className="flex gap-3">
              <div className="pt-6">
                <Checkbox
                  checked={selectedIds.includes(notification.id)}
                  onCheckedChange={() => toggleSelect(notification.id)}
                  aria-label={`Select notification: ${notification.title}`}
                />
              </div>
              <Card
                className={`flex-1 cursor-pointer transition-colors hover:bg-accent relative group ${
                  !notification.read ? 'border-l-4 border-l-primary' : ''
                }`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="default" className="mt-1">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete('single', notification.id);
                          }}
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{notification.message}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete unread notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              Some of the notifications you are about to delete are still unread. 
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeConfirmedDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
