// My Clubs Page

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router';
import { Users, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { Club } from '../lib/types';

export default function MyClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyClubs()
      .then(setClubs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex animate-pulse flex-col space-y-4">
          <div className="h-12 w-48 rounded bg-muted"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-xl bg-muted"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">My Clubs</h1>
        <p className="text-muted-foreground">
          Clubs you are currently a member of
        </p>
      </div>

      {clubs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center shadow-md">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mb-2">No Clubs Joined Yet</CardTitle>
          <CardDescription className="mb-6 max-w-sm px-4">
            You haven't joined any clubs. Browse our student organizations to find your community!
          </CardDescription>
          <Button asChild>
            <Link to="/clubs">Browse All Clubs</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map(club => (
            <Card key={club.id} className="group overflow-hidden transition-all hover:shadow-lg">
              <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                {club.logo ? (
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    <Users className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="mb-2">
                    {club.category || 'General'}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{club.memberCount} members</span>
                  </div>
                </div>
                <CardTitle className="line-clamp-1">{club.name}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">
                  {club.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" className="w-full group/btn">
                  <Link to={`/clubs/${club.id}`} className="flex items-center justify-center gap-2">
                    View Club Details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
