// My Events Page - For Club Heads to manage their events

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {Plus, Calendar, Clock, MapPin, Edit} from 'lucide-react';
import { api } from '../lib/api';
import { Event as ClubEvent } from '../lib/types';
import { useAuth } from '../lib/auth-context';

export default function MyEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ClubEvent[]>([]);

  useEffect(() => {
    api.getEvents().then(data => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let filteredEvents = [];
      if (user?.role === 'admin') {
        // Admin sees all unconducted events
        filteredEvents = data.filter(e => new Date(e.date) >= today);
      } else if (user?.role === 'club_head' && user.clubId) {
        // Club Head sees all unconducted events for their club
        filteredEvents = data.filter(e => e.clubId === user.clubId && new Date(e.date) >= today);
      } else {
        // Students or others see events they created (standard fallback)
        filteredEvents = data.filter(e => e.createdBy === user?.id && new Date(e.date) >= today);
      }
      
      setEvents(filteredEvents);
    });
  }, [user]);

  const canEditEvent = (event: ClubEvent) => {
    return user?.role === 'admin' || (user?.role === 'club_head' && event.status !== 'approved');
  };

  const hasEditableEvent = events.some(canEditEvent);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">
            {user?.role === 'admin' ? 'Manage System Events' : 'Manage Club Events'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' 
              ? 'View and manage all upcoming events across campus'
              : 'Track and manage upcoming events for your club'}
          </p>
        </div>
        <Button asChild>
          <Link to="/create-event">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">No events yet</p>
            <p className="mb-6 text-sm text-muted-foreground">
              Create your first event to get started
            </p>
            <Button asChild>
              <Link to="/create-event">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="space-y-4 md:hidden">
            {events.map(event => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.clubName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(event.status)}
                      {(user?.role === 'admin' || (user?.role === 'club_head' && event.status !== 'approved')) && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/edit-event/${event.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    {hasEditableEvent && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map(event => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.clubName}</TableCell>
                      <TableCell>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{event.time}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      {hasEditableEvent && (
                        <TableCell className="text-right">
                          {canEditEvent(event) && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/edit-event/${event.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
