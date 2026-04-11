// Club Details Page

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users, Trophy, Calendar, ArrowLeft, Edit } from 'lucide-react';
import { api } from '../lib/api';
import { Club, Event, User as UserType } from '../lib/types';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

export default function ClubDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [clubEvents, setClubEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<UserType[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [headUser, setHeadUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getClubById(id),
        api.getEvents(),
      ]).then(([clubData, eventsData]) => {
        setClub(clubData || null);
        setClubEvents(eventsData.filter(e => e.clubId === id));
        if (clubData?.headId) {
            api.getUsers().then(users => {
                const head = users.find(u => u.id === clubData.headId);
                setHeadUser(head || null);
            });
        }
        setLoading(false);
      });
    }
  }, [id]);

  const canEdit = user?.role === 'admin' || (user?.role === 'club_head' && user?.id === club?.headId);

  const fetchMembers = async () => {
    if (!id) return;
    setLoadingMembers(true);
    try {
      const data = await api.getClubMembers(id);
      setMembers(data);
    } catch (err) {
      toast.error('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleMembersClick = () => {
    if (!isAuthenticated) {
        toast.error('Please login to view members');
        return;
    }
    // Only student in that club, admin or club head of that club
    const isAdmin = user?.role === 'admin';
    const isHead = user?.role === 'club_head' && user?.id === club?.headId;
    if (isAdmin || isHead || isMember) {
        setShowMembers(true);
        fetchMembers();
    } else {
        toast.error('Only club members can view the member list');
    }
  };

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
    <div className="container mx-auto px-4 py-8 pb-32">
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
            <div className="flex flex-col gap-2">
                <Button 
                    size="lg" 
                    onClick={handleJoinClub}
                    disabled={isMember || user?.role === 'admin' || user?.role === 'club_head'}
                >
                  {isMember ? 'Member' : 'Join Club'}
                </Button>
                {canEdit && (
                    <Button variant="outline" asChild>
                        <Link to={`/admin/manage-clubs`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Manage Club
                        </Link>
                    </Button>
                )}
            </div>

          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div 
              className="flex cursor-pointer items-center gap-3 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/80"
              onClick={handleMembersClick}
            >
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
        </CardContent>
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

      <Dialog open={showMembers} onOpenChange={setShowMembers}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex flex-col gap-1">
              <span>{club.name} - Members</span>
              <span className="text-sm font-normal text-muted-foreground">
                Club Head: {headUser?.name || 'Assigned Admin'}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {loadingMembers ? (
              <p className="text-center py-4">Loading members...</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member, index) => (
                      <TableRow key={member.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                      </TableRow>
                    ))}
                    {members.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                No members found
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
