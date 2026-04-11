// Manage Clubs Page - Admin

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Club, User } from '../../lib/types';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export default function ManageClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    headId: '',
  });

  useEffect(() => {
    loadClubs();
    api.getUsers().then(setUsers);
  }, []);

  const loadClubs = async () => {
    const allClubs = await api.getClubs();
    if (user?.role === 'admin') {
      setClubs(allClubs);
    } else if (user?.role === 'club_head' && user.clubId) {
      setClubs(allClubs.filter(c => c.id === user.clubId));
    } else {
        setClubs([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClub) {
        await api.updateClub(editingClub.id, formData);
        toast.success('Club updated successfully');
      } else {
        await api.createClub({ ...formData, headId: formData.headId || 'admin' });
        toast.success('Club created successfully');
      }
      loadClubs();
      handleCloseDialog();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (club: Club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      description: club.description,
      category: club.category,
      headId: club.headId,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this club?')) {
      try {
        await api.deleteClub(id);
        toast.success('Club deleted successfully');
        loadClubs();
      } catch (error) {
        toast.error('Failed to delete club');
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingClub(null);
    setFormData({ name: '', description: '', category: '', headId: '' });
  };

  // Eligibility logic:
  // 1. Not a head of other club
  // 2. If editing, must be a member of this club (or currently the head)
  const eligibleStudents = users.filter(u => {
    if (u.role === 'admin') return false;
    
    const isHeadOfOther = clubs.some(c => c.headId === u.id && c.id !== editingClub?.id);
    if (isHeadOfOther) return false;

    if (editingClub) {
        // Must be member or current head
        const isMember = u.joinedClubIds?.includes(editingClub.id);
        const isCurrentHead = editingClub.headId === u.id;
        return isMember || isCurrentHead;
    }
    
    return true; // For new club creation, any student not head elsewhere is fine (they'll be assigned)
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">
            {user?.role === 'admin' ? 'Manage Clubs' : 'Manage My Club'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' 
              ? 'Create, edit, and delete student clubs'
              : 'Update your club details information'}
          </p>
        </div>
        {user?.role === 'admin' && (
            <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Club
            </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Club Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map(club => (
                <TableRow key={club.id}>
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell>{club.category}</TableCell>
                  <TableCell>{club.memberCount}</TableCell>
                  <TableCell>{club.points}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(club)}
                      >
                        <Edit className="h-4 w-4" />
                        {user?.role !== 'admin' && <span className="ml-2">Edit Details</span>}
                      </Button>
                      {user?.role === 'admin' && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(club.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClub ? 'Edit Club' : 'Create New Club'}</DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingClub ? 'update' : 'create'} the club
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Club Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={user?.role !== 'admin'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                  disabled={user?.role !== 'admin'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              {user?.role === 'admin' && (
                <div className="space-y-2">
                    <Label htmlFor="headId">Club Head</Label>
                    <Select
                    value={formData.headId}
                    onValueChange={value => setFormData(prev => ({ ...prev, headId: value }))}
                    >
                    <SelectTrigger id="headId">
                        <SelectValue placeholder="Select Club Head" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        {eligibleStudents.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.email.split('@')[0]})
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                    {editingClub 
                        ? "Only members who are not heads of other clubs are shown."
                        : "Students who are not heads of other clubs can be selected."}
                    </p>
                </div>
              )}
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingClub ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
