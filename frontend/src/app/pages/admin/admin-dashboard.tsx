// Admin Dashboard

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Calendar, Trophy, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { Event } from '../../lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export default function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalClubs, setTotalClubs] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [yearlyData, setYearlyData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      api.getUsers(),
      api.getClubs(),
      api.getEvents(),
      api.getYearlyReport(2026),
    ]).then(([users, clubs, events, report]) => {
      setTotalUsers(users.length);
      setTotalClubs(clubs.length);
      setTotalEvents(events.length);
      setPendingApprovals(events.filter(e => e.status === 'pending').length);
      setYearlyData(report);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and monitor the student club management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClubs}</div>
            <p className="text-xs text-muted-foreground">Active clubs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">All time events</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500 bg-amber-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingApprovals}</div>
            <p className="text-xs text-amber-700">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" className="h-auto flex-col items-start p-6">
          <Link to="/admin/event-approval">
            <AlertCircle className="mb-2 h-8 w-8" />
            <span className="font-semibold">Event Approval</span>
            <span className="text-xs text-muted-foreground">Review pending events</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto flex-col items-start p-6">
          <Link to="/admin/manage-clubs">
            <Trophy className="mb-2 h-8 w-8" />
            <span className="font-semibold">Manage Clubs</span>
            <span className="text-xs text-muted-foreground">Add or edit clubs</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto flex-col items-start p-6">
          <Link to="/admin/manage-users">
            <Users className="mb-2 h-8 w-8" />
            <span className="font-semibold">Manage Users</span>
            <span className="text-xs text-muted-foreground">View and edit users</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto flex-col items-start p-6">
          <Link to="/admin/reports">
            <Calendar className="mb-2 h-8 w-8" />
            <span className="font-semibold">Reports</span>
            <span className="text-xs text-muted-foreground">View analytics</span>
          </Link>
        </Button>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Events Per Month (2026)</CardTitle>
            <CardDescription>Monthly event activity throughout the year</CardDescription>
          </CardHeader>
          <CardContent>
            {yearlyData && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearlyData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="events" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Club Activity</CardTitle>
            <CardDescription>Event distribution by month</CardDescription>
          </CardHeader>
          <CardContent>
            {yearlyData && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearlyData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="events" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
