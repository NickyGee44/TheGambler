import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Camera, Upload, Calendar, ImageIcon, X } from "lucide-react";
import { Photo } from "@shared/schema";

export default function Photos() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['/api/photos'],
    refetchInterval: 15000,
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      toast({
        title: "Photo Uploaded",
        description: "Your photo has been successfully uploaded",
      });
      setIsDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl("");
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type and size
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a photo to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('caption', caption || "");

    uploadPhotoMutation.mutate(formData);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };



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
                <Label htmlFor="photo">Select Photo</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="photo"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-dashed border-2 border-golf-green-300 hover:border-golf-green-500 text-golf-green-600"
                  >
                    {selectedFile ? (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">{selectedFile.name}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-8 h-8 mx-auto mb-2" />
                        <p>Tap to select photo</p>
                        <p className="text-xs text-gray-500 mt-1">From camera roll or take new</p>
                      </div>
                    )}
                  </Button>
                </div>
                
                {previewUrl && (
                  <div className="mt-4 relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={clearSelectedFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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
                  disabled={uploadPhotoMutation.isPending || !selectedFile}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadPhotoMutation.isPending ? 'Uploading...' : 'Upload Photo'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    clearSelectedFile();
                    setCaption("");
                  }}
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
        {/* Show uploaded photos */}
        {photos.map((photo: Photo) => (
          <Card key={photo.id} className="golf-card shadow-lg overflow-hidden">
            <div className="aspect-w-4 aspect-h-3">
              {photo.imageUrl ? (
                <img 
                  src={photo.imageUrl} 
                  alt={photo.caption || photo.filename}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
              )}
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
        {photos.length === 0 && (
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
