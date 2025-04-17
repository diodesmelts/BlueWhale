import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function AdminSettings() {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Fetch current banner image
  const { data: bannerSettings } = useQuery<{ imageUrl: string | null }>({
    queryKey: ["/api/settings/banner"],
  });
  
  // Set current banner when data is loaded
  useEffect(() => {
    if (bannerSettings?.imageUrl) {
      setCurrentBannerUrl(bannerSettings.imageUrl);
    }
  }, [bannerSettings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('type', 'banner');
    
    setIsUploading(true);
    
    try {
      const res = await apiRequest('POST', '/api/uploads/banner', formData, { isFormData: true });
      if (!res.ok) throw new Error('Failed to upload banner image');
      
      const data = await res.json();
      
      // Update current banner URL from the response
      if (data.imageUrl) {
        setCurrentBannerUrl(data.imageUrl);
      }

      // Invalidate both the admin settings and dashboard banner queries
      queryClient.invalidateQueries({ queryKey: ["/api/settings/banner"] });
      
      toast({
        title: 'Banner Updated',
        description: 'Hero banner has been successfully updated.',
      });
      
      // Reset the form
      setPreviewImage(null);
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white text-gray-800 rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Site Settings</h2>
      
      <div className="border-b border-gray-200 pb-5 mb-5">
        <Label className="text-lg font-medium text-cyan-600 mb-3 block">Hero Banner</Label>
        <p className="text-gray-500 mb-4 text-sm">
          Upload a hero banner image for the dashboard page. For best results, use a landscape image with dimensions of 1920×600 pixels.
        </p>
        
        {/* Display current banner if available */}
        {currentBannerUrl && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Banner:</h3>
            <div className="flex justify-center">
              <img 
                src={currentBannerUrl} 
                alt="Current Banner" 
                className="max-h-40 rounded-md object-cover shadow-sm border border-gray-200" 
              />
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {/* File upload area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              selectedFile ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300 hover:border-cyan-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {previewImage ? (
              <div className="space-y-4">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="max-h-48 mx-auto rounded-md object-cover shadow-sm"
                />
                <p className="text-sm text-gray-600">
                  {selectedFile?.name} ({selectedFile ? Math.round((selectedFile.size || 0) / 1024) : 0} KB)
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-cyan-500 mx-auto mb-2" />
                <p className="text-sm text-gray-700 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG or WebP (max 5MB)</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          {/* Upload button */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="mr-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={() => {
                setPreviewImage(null);
                setSelectedFile(null);
              }}
              disabled={!selectedFile || isUploading}
            >
              Clear
            </Button>
            <Button
              type="button"
              disabled={!selectedFile || isUploading}
              onClick={handleUpload}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white border-0"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Uploading...
                </>
              ) : (
                'Upload Banner'
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Additional settings could be added here */}
      <div>
        <Label className="text-lg font-medium text-purple-400 mb-3 block">Other Settings</Label>
        <p className="text-gray-400 mb-4 text-sm">
          Additional site settings will be available in future updates.
        </p>
      </div>
    </div>
  );
}