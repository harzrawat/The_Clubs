// Edit Event Page
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { Club, Event as ClubEvent } from '../lib/types';
import { ArrowLeft } from 'lucide-react';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    clubId: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;

    Promise.all([
      api.getEventById(id),
      api.getClubs(),
    ]).then(([event, clubsData]) => {
      setClubs(clubsData);
      if (event) {
        setFormData({
          title: event.title,
          description: event.description || '',
          date: event.date,
          time: event.time,
          location: event.location,
          clubId: event.clubId,
          status: event.status,
        });
        
        // Check permissions
        const isAdmin = user?.role === 'admin';
        const isHeadOfClub = user?.role === 'club_head' && user?.clubId === event.clubId;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isUpcoming = new Date(event.date) >= today;

        if (!isAdmin && !isHeadOfClub) {
            toast.error('You do not have permission to edit this event');
            navigate('/events');
            return;
        }

        if (!isUpcoming) {
            toast.error('Past events cannot be edited');
            navigate('/events');
            return;
        }

        if (user?.role === 'club_head' && event.status === 'approved') {
            toast.error('Approved events cannot be edited by Club Heads');
            // We allow viewing the form but it should be disabled
        }
      } else {
        toast.error('Event not found');
        navigate('/events');
      }
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load event details');
      navigate('/events');
    });
  }, [id, user, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Event title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const eventToEdit = await api.getEventById(id);
      if (user?.role === 'club_head' && eventToEdit?.status === 'approved') {
          toast.error('This event has already been approved and cannot be edited by the Club Head.');
          setSaving(false);
          return;
      }

      await api.updateEvent(id, formData);
      toast.success('Event updated successfully!');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to update event.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="mb-2">Edit Event</h1>
        <p className="text-muted-foreground">Update event details below</p>
      </div>

      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Modify the fields you wish to update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.role === 'club_head' && formData.status === 'approved' && (
            <div className="mb-6 rounded-lg bg-yellow-50 p-4 border border-yellow-200 text-yellow-800 text-sm">
              <p className="font-semibold">View Only Mode</p>
              <p>This event has been approved by the Admin and can no longer be modified by the Club Head.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={e => handleChange('date', e.target.value)}
                  aria-invalid={!!errors.date}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Event Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={e => handleChange('time', e.target.value)}
                  aria-invalid={!!errors.time}
                />
                {errors.time && (
                  <p className="text-sm text-destructive">{errors.time}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
                aria-invalid={!!errors.location}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clubId">Club</Label>
              <Select
                value={formData.clubId}
                onValueChange={value => handleChange('clubId', value)}
                disabled
              >
                <SelectTrigger id="clubId">
                  <SelectValue placeholder="Select a club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map(club => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {user?.role === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={value => handleChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={saving || (user?.role === 'club_head' && formData.status === 'approved')}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
