// Gallery Page

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { api } from '../lib/api';
import { GalleryImage } from '../lib/types';

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    api.getGalleryImages().then(setImages);
  }, []);

  // Group images by event
  const imagesByEvent = images.reduce((acc, img) => {
    if (!acc[img.eventId]) {
      acc[img.eventId] = [];
    }
    acc[img.eventId].push(img);
    return acc;
  }, {} as Record<string, GalleryImage[]>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Gallery</h1>
        <p className="text-muted-foreground">
          Browse photos from our club events and activities
        </p>
      </div>

      <div className="space-y-12">
        {Object.entries(imagesByEvent).map(([eventId, eventImages]) => (
          <section key={eventId}>
            <div className="mb-6 flex items-center gap-3">
              <h2>{eventImages[0].eventName}</h2>
              <Badge variant="outline">{eventImages.length} photos</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {eventImages.map(image => (
                <Card
                  key={image.id}
                  className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedImage(image)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.eventName}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                  </CardContent>
                </Card>
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
                className="w-full rounded-lg"
              />
              <div>
                <h3>{selectedImage.eventName}</h3>
                <p className="text-sm text-muted-foreground">
                  Uploaded on {new Date(selectedImage.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
