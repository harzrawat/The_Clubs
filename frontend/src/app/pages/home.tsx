// Home Page - Public landing page

import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowRight, Users, Calendar, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Club, Event } from '../lib/types';
import { Badge } from '../components/ui/badge';

export default function Home() {
  const [featuredClubs, setFeaturedClubs] = useState<Club[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    api.getClubs().then(clubs => setFeaturedClubs(clubs.slice(0, 3)));
    api.getEvents().then(events => {
      const upcoming = events
        .filter(e => e.status === 'approved' && new Date(e.date) >= new Date())
        .slice(0, 3);
      setUpcomingEvents(upcoming);
    });
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-secondary py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8 lg:flex-row">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl">
                Welcome to Student Club Management
              </h1>
              <p className="text-lg md:text-xl text-white/90">
                Discover, join, and engage with student clubs and activities on campus.
                Build connections, develop skills, and create lasting memories.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row lg:justify-start justify-center">
                <Button size="lg" asChild variant="secondary">
                  <Link to="/clubs">
                    Explore Clubs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" asChild variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20">
                  <Link to="/signup">Join Now</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <img
                src="https://images.unsplash.com/photo-1763890498955-13f109b2fbd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwY2FtcHVzJTIwYWN0aXZpdGllc3xlbnwxfHx8fDE3NzMyMDg1MTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Student activities"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center">Why Join Our Platform?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Join Clubs</CardTitle>
                <CardDescription>
                  Connect with like-minded students and be part of vibrant communities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Calendar className="h-6 w-6" />
                </div>
                <CardTitle>Attend Events</CardTitle>
                <CardDescription>
                  Participate in exciting events, workshops, and competitions throughout the year
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Trophy className="h-6 w-6" />
                </div>
                <CardTitle>Earn Recognition</CardTitle>
                <CardDescription>
                  Gain points for your club and climb the leaderboard to achieve top rankings
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Clubs Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2>Featured Clubs</h2>
            <Button variant="outline" asChild>
              <Link to="/clubs">View All Clubs</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredClubs.map(club => (
              <Card key={club.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="secondary">{club.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {club.memberCount} members
                    </span>
                  </div>
                  <CardTitle>{club.name}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {club.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/clubs/${club.id}`}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2>Upcoming Events</h2>
            <Button variant="outline" asChild>
              <Link to="/events">View All Events</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {upcomingEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>{event.time}</span>
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    <span className="text-primary">{event.clubName}</span>
                  </CardDescription>
                  <CardDescription className="line-clamp-2 mt-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    📍 {event.location}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-white">Ready to Get Started?</h2>
          <p className="mb-8 text-lg text-white/90">
            Join our community today and start your journey with student clubs
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/signup">Sign Up Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
