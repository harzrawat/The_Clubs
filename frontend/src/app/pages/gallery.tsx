// Gallery Page — Role-based: admin sees all, club_head sees their club,
// student sees enrolled clubs. Upload/delete for admin+club_head only.
// Students can like and download images.

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { Club, Event, GalleryImage } from '../lib/types';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Likes stored in localStorage (no backend needed)
// ---------------------------------------------------------------------------
const LIKES_KEY = 'gallery_likes';

function getLikes(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY) || '{}');
  } catch {
    return {};
  }
}


function toggleLike(id: string): { count: number; liked: boolean } {
  const likes = getLikes();
  const myLikes: string[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('gallery_my_likes') || '[]');
    } catch {
      return [];
    }
  })();

  const alreadyLiked = myLikes.includes(id);
  if (alreadyLiked) {
    likes[id] = Math.max(0, (likes[id] ?? 1) - 1);
    const updated = myLikes.filter((x) => x !== id);
    localStorage.setItem('gallery_my_likes', JSON.stringify(updated));
  } else {
    likes[id] = (likes[id] ?? 0) + 1;
    myLikes.push(id);
    localStorage.setItem('gallery_my_likes', JSON.stringify(myLikes));
  }
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
  return { count: likes[id], liked: !alreadyLiked };
}

// ---------------------------------------------------------------------------
// Upload Modal
// ---------------------------------------------------------------------------
interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: (img: GalleryImage) => void;
  role: string;
  userClubId?: string;
}

function UploadModal({ open, onClose, onUploaded, role, userClubId }: UploadModalProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Load clubs for admin; club_head uses their fixed club
  useEffect(() => {
    if (!open) return;
    setError('');
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedEventId('');

    if (role === 'admin') {
      api.getClubs().then(setClubs).catch(() => setClubs([]));
      setSelectedClubId('');
    } else {
      // club_head: set club automatically
      setSelectedClubId(userClubId || '');
    }
  }, [open, role, userClubId]);

  // Load events when club changes
  useEffect(() => {
    if (!selectedClubId) { setEvents([]); return; }
    api.getEvents().then((all) => {
      setEvents(all.filter((e) => e.clubId === selectedClubId));
      setSelectedEventId('');
    }).catch(() => setEvents([]));
  }, [selectedClubId]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  async function handleUpload() {
    if (!selectedEventId || !file) { setError('Please select an event and a file.'); return; }
    setUploading(true);
    setError('');
    try {
      const img = await api.uploadGalleryImage(selectedEventId, file);
      onUploaded(img);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Club selector — admin only */}
          {role === 'admin' && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Club</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
              >
                <option value="">— Select a club —</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Event selector */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Event</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              disabled={!selectedClubId && role === 'admin'}
            >
              <option value="">— Select an event —</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          {/* File picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Image File</label>
            
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="mb-1 text-sm text-muted-foreground group-hover:text-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    SVG, PNG, JPG or GIF (max. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </label>
            ) : (
              <div className="relative group rounded-lg overflow-hidden border bg-muted/30">
                <div className="aspect-video relative overflow-hidden flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="rounded-full"
                      onClick={removeFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="px-3 py-2 flex items-center gap-2 border-t bg-background">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium truncate flex-1">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={uploading}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading || !selectedEventId || !file}>
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Gallery Page
// ---------------------------------------------------------------------------
export default function GalleryPage() {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const canUpload = role === 'admin' || role === 'club_head';
  const canDelete = role === 'admin' || role === 'club_head';
  const isStudent = role === 'student';

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // Like counts + my likes (localStorage)
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(getLikes);
  const [myLikes, setMyLikes] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('gallery_my_likes') || '[]'));
    } catch { return new Set(); }
  });

  const [deleting, setDeleting] = useState<string | null>(null);

  const loadImages = useCallback(() => {
    api.getGalleryImages().then(setImages).catch(() => setImages([]));
  }, []);

  useEffect(() => { loadImages(); }, [loadImages]);

  // Group by club, then by event inside each club
  const byClub: Record<string, { clubName: string; events: Record<string, GalleryImage[]> }> = {};
  for (const img of images) {
    if (!byClub[img.clubId]) {
      byClub[img.clubId] = { clubName: img.clubName, events: {} };
    }
    if (!byClub[img.clubId].events[img.eventId]) {
      byClub[img.clubId].events[img.eventId] = [];
    }
    byClub[img.clubId].events[img.eventId].push(img);
  }

  function handleLike(img: GalleryImage) {
    const { count, liked } = toggleLike(img.id);
    setLikeCounts((prev) => ({ ...prev, [img.id]: count }));
    setMyLikes((prev) => {
      const next = new Set(prev);
      if (liked) next.add(img.id); else next.delete(img.id);
      return next;
    });
  }

  async function handleDownload(img: GalleryImage) {
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${img.eventName.replace(/\s+/g, '_')}_${img.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: try opening in new tab if fetch fails
      window.open(img.url, '_blank');
    }
  }

  async function handleDelete(imgId: string) {
    if (!window.confirm('Delete this image?')) return;
    setDeleting(imgId);
    try {
      await api.deleteGalleryImage(imgId);
      setImages((prev) => prev.filter((i) => i.id !== imgId));
      if (selectedImage?.id === imgId) setSelectedImage(null);
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  }

  const isEmpty = images.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-2">Gallery</h1>
          <p className="text-muted-foreground">
            {role === 'admin'
              ? 'All club events gallery'
              : role === 'club_head'
              ? 'Your club events gallery'
              : role === 'student'
              ? 'Gallery from your enrolled clubs'
              : 'Please log in to view the gallery'}
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setShowUpload(true)}>
            ↑ Upload Image
          </Button>
        )}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex min-h-[30vh] flex-col items-center justify-center text-center text-muted-foreground">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="font-medium">No images yet</p>
          {!user && <p className="text-sm mt-1">Log in to see club gallery images.</p>}
        </div>
      )}

      {/* Images grouped by club → event */}
      <div className="space-y-14">
        {Object.entries(byClub).map(([clubId, { clubName, events }]) => (
          <section key={clubId}>
            {/* Club header — shown for admin (seeing multiple clubs) */}
            {role === 'admin' && (
              <div className="mb-4 flex items-center gap-3 border-b pb-2">
                <h2 className="text-xl font-semibold">{clubName}</h2>
                <Badge>{Object.values(events).flat().length} photos</Badge>
              </div>
            )}

            {/* Events within the club */}
            <div className="space-y-10">
              {Object.entries(events).map(([eventId, eventImages]) => (
                <div key={eventId}>
                  <div className="mb-4 flex items-center gap-3">
                    <h3 className="text-lg font-medium">{eventImages[0].eventName}</h3>
                    <Badge variant="outline">{eventImages.length} photos</Badge>
                    {role !== 'admin' && (
                      <Badge variant="secondary">{clubName}</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {eventImages.map((image) => (
                      <Card
                        key={image.id}
                        className="group relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <CardContent className="p-0">
                          <div
                            className="aspect-square overflow-hidden"
                            onClick={() => setSelectedImage(image)}
                          >
                            <img
                              src={image.url}
                              alt={image.eventName}
                              className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            />
                          </div>

                          {/* Action bar (below image) */}
                          <div className="flex items-center justify-between px-2 py-1.5 bg-background/90 border-t">
                            {/* Student: like + download */}
                            {isStudent && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleLike(image)}
                                  className={`flex items-center gap-1 text-xs transition-colors ${
                                    myLikes.has(image.id)
                                      ? 'text-rose-500'
                                      : 'text-muted-foreground hover:text-rose-400'
                                  }`}
                                  title="Like"
                                >
                                  {myLikes.has(image.id) ? '❤️' : '🤍'}{' '}
                                  {likeCounts[image.id] ?? 0}
                                </button>
                                <button
                                  onClick={() => handleDownload(image)}
                                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                  title="Download"
                                >
                                  ⬇
                                </button>
                              </div>
                            )}

                            {/* Admin / Club Head: delete */}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(image.id)}
                                disabled={deleting === image.id}
                                className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                title="Delete image"
                              >
                                {deleting === image.id ? '…' : '🗑'}
                              </button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.eventName}
                className="w-full rounded-lg max-h-[70vh] object-contain"
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{selectedImage.eventName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedImage.clubName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploaded on {new Date(selectedImage.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {isStudent && (
                    <>
                      <button
                        onClick={() => handleLike(selectedImage)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          myLikes.has(selectedImage.id)
                            ? 'text-rose-500'
                            : 'text-muted-foreground hover:text-rose-400'
                        }`}
                      >
                        {myLikes.has(selectedImage.id) ? '❤️' : '🤍'}{' '}
                        {likeCounts[selectedImage.id] ?? 0}
                      </button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(selectedImage)}>
                        ⬇ Download
                      </Button>
                    </>
                  )}
                  {canDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(selectedImage.id)}
                      disabled={deleting === selectedImage.id}
                    >
                      {deleting === selectedImage.id ? 'Deleting…' : '🗑 Delete'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUploaded={(img) => setImages((prev) => [img, ...prev])}
        role={role ?? ''}
        userClubId={user?.clubId}
      />
    </div>
  );
}
