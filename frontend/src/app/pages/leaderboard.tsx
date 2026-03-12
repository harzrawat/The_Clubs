// Leaderboard Page

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { api } from '../lib/api';
import { Club } from '../lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function LeaderboardPage() {
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    api.getClubs().then(data => {
      const sorted = [...data].sort((a, b) => b.points - a.points);
      setClubs(sorted);
    });
  }, []);

  const chartData = clubs.slice(0, 10).map(club => ({
    name: club.name,
    points: club.points,
  }));

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Badge className="bg-yellow-500">1st Place</Badge>;
      case 1:
        return <Badge className="bg-gray-400">2nd Place</Badge>;
      case 2:
        return <Badge className="bg-amber-600">3rd Place</Badge>;
      default:
        return <Badge variant="outline">#{index + 1}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Club Leaderboard</h1>
        <p className="text-muted-foreground">
          Rankings based on club performance and event participation
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Leaderboard Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Clubs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clubs.map((club, index) => (
                  <div
                    key={club.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center">
                        {getRankIcon(index) || (
                          <span className="text-lg font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="text-lg">{club.name}</h3>
                          {getRankBadge(index)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {club.memberCount} members • {club.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{club.points}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top 3 Cards */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8" />
                <div>
                  <CardTitle className="text-white">1st Place</CardTitle>
                  <p className="text-sm text-white/90">{clubs[0]?.name}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{clubs[0]?.points} pts</div>
            </CardContent>
          </Card>

          {clubs[1] && (
            <Card className="bg-gradient-to-br from-gray-400 to-gray-500 text-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Medal className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-white">2nd Place</CardTitle>
                    <p className="text-sm text-white/90">{clubs[1].name}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{clubs[1].points} pts</div>
              </CardContent>
            </Card>
          )}

          {clubs[2] && (
            <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-white">3rd Place</CardTitle>
                    <p className="text-sm text-white/90">{clubs[2].name}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{clubs[2].points} pts</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Points Chart */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Points Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="points" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
