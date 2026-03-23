// Club Details Page

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users, Trophy, Calendar, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { Club, Event } from '../lib/types';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';

export default function ClubDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [clubEvents, setClubEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getClubById(id),
        api.getEvents(),
      ]).then(([clubData, eventsData]) => {
        setClub(clubData || null);
        setClubEvents(eventsData.filter(e => e.clubId === id));
        setLoading(false);
      });
    }
  }, [id]);

  const isMember = user?.joinedClubIds?.includes(id || '');

  const handleJoinClub = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to join clubs');
      return;
    }
    if (!id) return;

    try {
      await api.joinClub(id);
      toast.success('Successfully joined ' + club?.name);
      // Refresh club data to update member count
      const updatedClub = await api.getClubById(id);
      if (updatedClub) setClub(updatedClub);
      // Note: In a real app, we'd also update the user context's joinedClubIds here
      // For now, refreshing or re-navigating will pick up the change from serializers
    } catch (err: any) {
      toast.error(err.message || 'Failed to join club');
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Club not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/clubs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clubs
        </Link>
      </Button>

      {/* Club Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">
                {club.category}
              </Badge>
              <h1 className="mb-2">{club.name}</h1>
              <p className="text-muted-foreground">{club.description}</p>
            </div>
            <Button 
                size="lg" 
                onClick={handleJoinClub}
                disabled={isMember || user?.role === 'admin' || user?.role === 'club_head'}
            >
              {isMember ? 'Member' : 'Join Club'}
            </Button>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="font-semibold">{club.memberCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="font-semibold">{club.points}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Events</p>
                <p className="font-semibold">{clubEvents.length}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Club Events */}
      <div>
        <h2 className="mb-6">Events by {club.name}</h2>
        {clubEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No events organized yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {clubEvents.map(event => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge
                      variant={
                        event.status === 'approved'
                          ? 'default'
                          : event.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {event.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
