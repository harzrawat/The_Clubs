// Dashboard Page - For authenticated users

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Users, Trophy, Bell, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { Event, Notification, Club } from '../lib/types';
import { useAuth } from '../lib/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userClub, setUserClub] = useState<Club | null>(null);
  const [myClubs, setMyClubs] = useState<Club[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
      return;
    }

    api.getEvents().then(events => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const upcoming = events
        .filter(e => e.status === 'approved' && new Date(e.date) >= today)
        .slice(0, 5);
      setUpcomingEvents(upcoming);
    });

    api.getNotifications().then(data => {
      setNotifications(data.slice(0, 5));
    });

    if (user?.clubId) {
      api.getClubById(user.clubId).then(club => {
        if (club) setUserClub(club);
      });
    }
    
    if (user?.role === 'student') {
      api.getMyClubs().then(clubs => {
        setMyClubs(clubs);
      });
    }
  }, [user, navigate]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your clubs and events
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Events this month</p>
          </CardContent>
        </Card>

        {user?.role === 'student' ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Joined Clubs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myClubs.length}</div>
              <p className="text-xs text-muted-foreground">
                Total clubs joined
              </p>
            </CardContent>
          </Card>
        ) : userClub ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Club</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userClub.name}</div>
              <p className="text-xs text-muted-foreground">
                {userClub.memberCount} members
              </p>
            </CardContent>
          </Card>
        ) : null}

        {userClub && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Club Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userClub.points}</div>
              <p className="text-xs text-muted-foreground">Leaderboard ranking</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Events */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Events</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/events">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No upcoming events
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <span className="text-xs">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4>{event.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {event.clubName}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>🕐 {event.time}</span>
                        <span>📍 {event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {(user?.role === 'club_head' || user?.role === 'admin') && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/create-event">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/my-events">View My Events</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Notifications</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/notifications">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No notifications
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="mb-1 flex items-start justify-between">
                        <span className="font-medium">{notification.title}</span>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
