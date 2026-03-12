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
import { Club } from '../../lib/types';
import { toast } from 'sonner';

export default function ManageClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = () => {
    api.getClubs().then(setClubs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClub) {
        await api.updateClub(editingClub.id, formData);
        toast.success('Club updated successfully');
      } else {
        await api.createClub({ ...formData, headId: 'admin' });
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
    setFormData({ name: '', description: '', category: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">Manage Clubs</h1>
          <p className="text-muted-foreground">
            Create, edit, and delete student clubs
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Club
        </Button>
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
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(club.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
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
