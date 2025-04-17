import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminSettings() {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      
      toast({
        title: 'Banner Updated',
        description: 'Hero banner has been successfully updated.',
      });
      
      // Reset the form
      setPreviewImage(null);
      setSelectedFile(null);
      
      // Reload the page to show the new banner
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">Site Settings</h2>
      
      <div className="border-b pb-5 mb-5">
        <Label className="text-lg font-medium mb-3 block">Hero Banner</Label>
        <p className="text-gray-500 mb-4 text-sm">
          Upload a hero banner image for the dashboard page. For best results, use a landscape image with dimensions of 1920×600 pixels.
        </p>
        
        <div className="space-y-4">
          {/* File upload area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              selectedFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
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
                  className="max-h-48 mx-auto rounded-md object-cover"
                />
                <p className="text-sm text-gray-600">
                  {selectedFile?.name} ({Math.round(selectedFile?.size / 1024)} KB)
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
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
              className="mr-2"
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
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
        <Label className="text-lg font-medium mb-3 block">Other Settings</Label>
        <p className="text-gray-500 mb-4 text-sm">
          Additional site settings will be available in future updates.
        </p>
      </div>
    </div>
  );
}