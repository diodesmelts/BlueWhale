import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSettings() {
  // Banner state
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [previewBannerImage, setPreviewBannerImage] = useState<string | null>(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  
  // Logo state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [previewLogoImage, setPreviewLogoImage] = useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  
  // Fetch current banner image
  const { data: bannerSettings } = useQuery<{ imageUrl: string | null }>({
    queryKey: ["/api/settings/banner"],
  });
  
  // Fetch current logo image
  const { data: logoSettings } = useQuery<{ imageUrl: string | null }>({
    queryKey: ["/api/settings/logo"],
  });
  
  // Set current banner when data is loaded
  useEffect(() => {
    if (bannerSettings?.imageUrl) {
      setCurrentBannerUrl(bannerSettings.imageUrl);
    }
  }, [bannerSettings]);
  
  // Set current logo when data is loaded
  useEffect(() => {
    if (logoSettings?.imageUrl) {
      setCurrentLogoUrl(logoSettings.imageUrl);
    }
  }, [logoSettings]);

  // Banner handlers
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedBannerFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewBannerImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBannerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedBannerFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewBannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = async () => {
    if (!selectedBannerFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedBannerFile);
    
    setIsUploadingBanner(true);
    
    try {
      const res = await apiRequest('POST', '/api/uploads/banner', formData, { isFormData: true });
      if (!res.ok) throw new Error('Failed to upload banner image');
      
      const data = await res.json();
      
      // Update current banner URL from the response
      if (data.imageUrl) {
        setCurrentBannerUrl(data.imageUrl);
      }

      // Invalidate banner query
      queryClient.invalidateQueries({ queryKey: ["/api/settings/banner"] });
      
      toast({
        title: 'Banner Updated',
        description: 'Hero banner has been successfully updated.',
      });
      
      // Reset the form
      setPreviewBannerImage(null);
      setSelectedBannerFile(null);
      
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingBanner(false);
    }
  };
  
  // Logo handlers
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedLogoFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewLogoImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewLogoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedLogoFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedLogoFile);
    
    setIsUploadingLogo(true);
    
    try {
      const res = await apiRequest('POST', '/api/uploads/logo', formData, { isFormData: true });
      if (!res.ok) throw new Error('Failed to upload logo image');
      
      const data = await res.json();
      
      // Update current logo URL from the response
      if (data.imageUrl) {
        setCurrentLogoUrl(data.imageUrl);
      }

      // Invalidate logo query
      queryClient.invalidateQueries({ queryKey: ["/api/settings/logo"] });
      
      toast({
        title: 'Logo Updated',
        description: 'Site logo has been successfully updated.',
      });
      
      // Reset the form
      setPreviewLogoImage(null);
      setSelectedLogoFile(null);
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="bg-white text-gray-800 rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Site Settings</h2>
      
      <Tabs defaultValue="logo" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 gap-1">
          <TabsTrigger value="logo">Site Logo</TabsTrigger>
          <TabsTrigger value="banner">Hero Banner</TabsTrigger>
        </TabsList>
        
        {/* Logo Tab Content */}
        <TabsContent value="logo" className="py-4">
          <Label className="text-lg font-medium text-cyan-600 mb-3 block">Site Logo</Label>
          <p className="text-gray-500 mb-4 text-sm">
            Upload your site logo that will appear in the header and footer. For best results, use a transparent PNG image.
          </p>
          
          {/* Display current logo if available */}
          {currentLogoUrl && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Logo:</h3>
              <div className="flex justify-center bg-gray-800 p-4 rounded-md">
                <img 
                  src={currentLogoUrl} 
                  alt="Current Logo" 
                  className="h-16 object-contain" 
                />
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Logo file upload area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                selectedLogoFile ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300 hover:border-cyan-400'
              }`}
              onClick={() => logoFileInputRef.current?.click()}
              onDragOver={handleLogoDragOver}
              onDrop={handleLogoDrop}
            >
              {previewLogoImage ? (
                <div className="space-y-4">
                  <img 
                    src={previewLogoImage} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-md object-contain"
                  />
                  <p className="text-sm text-gray-600">
                    {selectedLogoFile?.name} ({selectedLogoFile ? Math.round((selectedLogoFile.size || 0) / 1024) : 0} KB)
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-cyan-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG with transparency recommended (max 2MB)</p>
                </>
              )}
              <input 
                type="file" 
                ref={logoFileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleLogoFileChange}
              />
            </div>
            
            {/* Logo upload button */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => {
                  setPreviewLogoImage(null);
                  setSelectedLogoFile(null);
                }}
                disabled={!selectedLogoFile || isUploadingLogo}
              >
                Clear
              </Button>
              <Button
                type="button"
                disabled={!selectedLogoFile || isUploadingLogo}
                onClick={handleLogoUpload}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-sm"
              >
                {isUploadingLogo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    Uploading...
                  </>
                ) : (
                  'Upload Logo'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Banner Tab Content */}
        <TabsContent value="banner" className="py-4">
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
            {/* Banner file upload area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                selectedBannerFile ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300 hover:border-cyan-400'
              }`}
              onClick={() => bannerFileInputRef.current?.click()}
              onDragOver={handleBannerDragOver}
              onDrop={handleBannerDrop}
            >
              {previewBannerImage ? (
                <div className="space-y-4">
                  <img 
                    src={previewBannerImage} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-md object-cover shadow-sm"
                  />
                  <p className="text-sm text-gray-600">
                    {selectedBannerFile?.name} ({selectedBannerFile ? Math.round((selectedBannerFile.size || 0) / 1024) : 0} KB)
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
                ref={bannerFileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleBannerFileChange}
              />
            </div>
            
            {/* Banner upload button */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => {
                  setPreviewBannerImage(null);
                  setSelectedBannerFile(null);
                }}
                disabled={!selectedBannerFile || isUploadingBanner}
              >
                Clear
              </Button>
              <Button
                type="button"
                disabled={!selectedBannerFile || isUploadingBanner}
                onClick={handleBannerUpload}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-sm"
              >
                {isUploadingBanner ? (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}