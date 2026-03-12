// Events Page

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { api } from '../lib/api';
import { Event } from '../lib/types';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    api.getEvents().then(data => {
      const approved = data.filter(e => e.status === 'approved');
      setEvents(approved);
    });
  }, []);

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.date) < new Date());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Events</h1>
        <p className="text-muted-foreground">
          Discover and participate in exciting campus events
        </p>
      </div>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="mb-6">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No upcoming events</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-2">
                    <Badge>{event.clubName}</Badge>
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
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
        )}
      </section>

      {/* Past Events */}
      <section>
        <h2 className="mb-6">Past Events</h2>
        {pastEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No past events</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map(event => (
              <Card key={event.id} className="opacity-75">
                <CardHeader>
                  <div className="mb-2">
                    <Badge variant="outline">{event.clubName}</Badge>
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  {event.attendanceCount && (
                    <div className="text-muted-foreground">
                      👥 {event.attendanceCount} attendees
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
