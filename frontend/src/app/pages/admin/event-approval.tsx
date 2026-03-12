// Event Approval Page - Admin

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Check, X, Calendar, Clock, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { Event } from '../../lib/types';
import { toast } from 'sonner';

export default function EventApprovalPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    api.getEvents().then(data => {
      const pending = data.filter(e => e.status === 'pending');
      setEvents(pending);
    });
  };

  const handleApprove = async () => {
    if (!selectedEvent) return;

    try {
      await api.approveEvent(selectedEvent.id);
      toast.success(`Event "${selectedEvent.title}" approved successfully`);
      loadEvents();
      setSelectedEvent(null);
      setActionType(null);
    } catch (error) {
      toast.error('Failed to approve event');
    }
  };

  const handleReject = async () => {
    if (!selectedEvent) return;

    try {
      await api.rejectEvent(selectedEvent.id);
      toast.success(`Event "${selectedEvent.title}" rejected`);
      loadEvents();
      setSelectedEvent(null);
      setActionType(null);
    } catch (error) {
      toast.error('Failed to reject event');
    }
  };

  const openApproveDialog = (event: Event) => {
    setSelectedEvent(event);
    setActionType('approve');
  };

  const openRejectDialog = (event: Event) => {
    setSelectedEvent(event);
    setActionType('reject');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Event Approval</h1>
        <p className="text-muted-foreground">
          Review and approve or reject submitted events
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Check className="mb-4 h-12 w-12 text-green-500" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No pending events to review
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map(event => (
            <Card key={event.id}>
              <CardHeader>
                <div className="mb-2 flex items-start justify-between">
                  <Badge variant="secondary">{event.clubName}</Badge>
                  <Badge>Pending</Badge>
                </div>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription className="mt-2">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
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
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => openApproveDialog(event)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => openRejectDialog(event)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Confirmation Dialog */}
      <AlertDialog open={actionType === 'approve'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve "{selectedEvent?.title}"? This event will be
              published and visible to all users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-green-500 hover:bg-green-600"
            >
              Approve Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rejection Confirmation Dialog */}
      <AlertDialog open={actionType === 'reject'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject "{selectedEvent?.title}"? The event creator will be
              notified of this decision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-destructive hover:bg-destructive/90">
              Reject Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
