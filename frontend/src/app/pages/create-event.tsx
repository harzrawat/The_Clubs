// Create Event Page - For Club Heads

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
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
import { Club } from '../lib/types';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    clubId: user?.clubId || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getClubs().then(setClubs);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = 'Event title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.clubId) newErrors.clubId = 'Please select a club';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.createEvent({
        ...formData,
        createdBy: user?.id || '',
      });
      if (user?.role === 'admin') {
        toast.success('Event created successfully!');
      } else {
        toast.success('Event submitted for approval!');
      }
      navigate('/my-events');
    } catch (error) {
      toast.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="relative container mx-auto overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
      <div className="pointer-events-none absolute -top-24 -left-24 hidden h-72 w-72 rounded-full bg-primary/20 blur-3xl md:block auth-orb-animate" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 hidden h-72 w-72 rounded-full bg-accent/20 blur-3xl md:block auth-orb-animate-2" />

      <div className="mb-8">
        <h1 className="mb-2">Create New Event</h1>
        <p className="text-muted-foreground">
          {user?.role === 'admin' 
            ? 'Fill in the details below to create a new event'
            : 'Fill in the details below to submit your event for approval'}
        </p>
      </div>

      <Card className="auth-card-animate mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            All fields are required. {user?.role !== 'admin' && 'Your event will be reviewed by administrators before approval.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your event..."
                rows={4}
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
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
                  min={new Date().toISOString().split('T')[0]}
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
                placeholder="e.g., Main Auditorium, Room 301"
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
                aria-invalid={!!errors.location}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="club">Club *</Label>
              <Select
                value={formData.clubId}
                onValueChange={value => handleChange('clubId', value)}
                disabled={user?.role === 'club_head' && !!user.clubId}
              >
                <SelectTrigger id="club" aria-invalid={!!errors.clubId}>
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
              {errors.clubId && (
                <p className="text-sm text-destructive">{errors.clubId}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading 
                  ? (user?.role === 'admin' ? 'Creating...' : 'Submitting...') 
                  : (user?.role === 'admin' ? 'Create Event' : 'Submit for Approval')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
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
