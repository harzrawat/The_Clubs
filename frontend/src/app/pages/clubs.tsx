// Clubs List Page

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, Users } from 'lucide-react';
import { api } from '../lib/api';
import { Club } from '../lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    api.getClubs().then(data => {
      setClubs(data);
      setFilteredClubs(data);
    });
  }, []);

  useEffect(() => {
    let filtered = clubs;

    if (searchQuery) {
      filtered = filtered.filter(
        club =>
          club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          club.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(club => club.category === categoryFilter);
    }

    setFilteredClubs(filtered);
  }, [searchQuery, categoryFilter, clubs]);

  const categories = Array.from(new Set(clubs.map(c => c.category)));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Student Clubs</h1>
        <p className="text-muted-foreground">
          Discover and join clubs that match your interests
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No clubs found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map(club => (
            <Card
              key={club.id}
              className="flex h-full flex-col hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex-1">
                <div className="mb-3 flex items-start justify-between">
                  <Badge variant="secondary">{club.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {club.memberCount}
                  </div>
                </div>
                <CardTitle>{club.name}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {club.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Leaderboard Points</span>
                  <span className="font-semibold text-primary">{club.points}</span>
                </div>
                <Button asChild className="w-full">
                  <Link to={`/clubs/${club.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
