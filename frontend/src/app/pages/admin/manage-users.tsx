// Manage Users Page - Admin

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { api } from '../../lib/api';
import { User } from '../../lib/types';
import { toast } from 'sonner';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.getUsers().then(setUsers);
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="destructive" className="w-[110px]">
            Admin
          </Badge>
        );
      case 'club_head':
        return (
          <Badge className="bg-blue-500 w-[110px]">Club Head</Badge>
        );
      case 'student':
        return (
          <Badge variant="secondary" className="w-[110px]">
            Student
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="w-[110px]">
            {role}
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Manage Users</h1>
        <p className="text-muted-foreground">
          View and manage user roles and permissions
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">Name</TableHead>
                <TableHead className="w-[20%]">Email</TableHead>
                <TableHead className="w-[20%]">Current Role</TableHead>
                <TableHead className="w-[20%]">Club</TableHead>
                <TableHead className="w-[20%]">Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="w-[20%] font-medium">
                    {user.name}
                  </TableCell>
                  <TableCell className="w-[20%]">{user.email}</TableCell>
                  <TableCell className="w-[20%]">
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell className="w-[20%]">
                    {user.clubId ? `Club ${user.clubId}` : '—'}
                  </TableCell>
                  <TableCell className="w-[20%]">
                    <Select
                      value={user.role}
                      onValueChange={role => handleRoleChange(user.id, role)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="club_head">Club Head</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
