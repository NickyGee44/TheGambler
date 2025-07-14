import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Camera, Upload, Calendar } from "lucide-react";
import { Photo } from "@shared/schema";

export default function Photos() {
  const [filename, setFilename] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['/api/photos'],
    refetchInterval: 30000,
  });

  // WebSocket for real-time updates
  useWebSocket('/ws', {
    onMessage: (data) => {
      if (data.type === 'PHOTO_UPLOADED') {
        queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
        toast({
          title: "Photo Uploaded",
          description: "A new photo has been added to the gallery",
        });
      }
    }
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/photos', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      toast({
        title: "Photo Uploaded",
        description: "Your photo has been successfully uploaded",
      });
      setIsDialogOpen(false);
      setFilename("");
      setCaption("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename) {
      toast({
        title: "Error",
        description: "Please provide a filename",
        variant: "destructive",
      });
      return;
    }

    uploadPhotoMutation.mutate({
      filename,
      caption: caption || "",
    });
  };

  // Placeholder images for demonstration
  const placeholderImages = [
    {
      url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      caption: "Tournament Winners 2024"
    },
    {
      url: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      caption: "Course Overview"
    },
    {
      url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      caption: "Equipment Setup"
    },
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-golf-green-600 mb-2">Tournament Photos</h2>
          <p className="text-gray-600 dark:text-gray-400">Capture the memories from the championship</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0 bg-golf-green-600 hover:bg-golf-green-700 text-white">
              <Camera className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-golf-green-600">Upload Photo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="tournament-photo-1.jpg"
                  className="focus:ring-golf-green-500 focus:border-golf-green-500"
                />
              </div>
              
              <div>
                <Label htmlFor="caption">Caption (optional)</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe this photo..."
                  className="focus:ring-golf-green-500 focus:border-golf-green-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-golf-green-600 hover:bg-golf-green-700 text-white"
                  disabled={uploadPhotoMutation.isPending}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadPhotoMutation.isPending ? 'Uploading...' : 'Upload Photo'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Show placeholder images for demonstration */}
        {placeholderImages.map((image, index) => (
          <Card key={index} className="golf-card shadow-lg overflow-hidden">
            <div className="aspect-w-4 aspect-h-3">
              <img 
                src={image.url} 
                alt={image.caption}
                className="w-full h-48 object-cover"
              />
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {image.caption}
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Show uploaded photos */}
        {photos.map((photo: Photo) => (
          <Card key={photo.id} className="golf-card shadow-lg overflow-hidden">
            <div className="aspect-w-4 aspect-h-3">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-1">{photo.filename}</p>
              {photo.caption && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{photo.caption}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : 'Unknown'}
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Empty state when no photos */}
        {photos.length === 0 && placeholderImages.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No photos uploaded yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Upload your first photo to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
