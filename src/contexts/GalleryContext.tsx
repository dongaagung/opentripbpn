import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  file_url: string;
  title: string;
  category: string | null;
}

interface GalleryContextType {
  images: GalleryImage[];
  isLoading: boolean;
  hasImages: boolean;
  getImage: (index: number) => string | null;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export function GalleryProvider({ children, count = 10 }: { children: ReactNode; count?: number }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Preload images for smooth display
  const preloadImages = useCallback(async (urls: string[]) => {
    const promises = urls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      });
    });
    await Promise.all(promises);
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("id, file_url, title, category")
          .eq("is_published", true)
          .eq("file_type", "image")
          .order("display_order", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setImages(data);
          // Preload first few images for hero section
          await preloadImages(data.slice(0, Math.min(5, data.length)).map(img => img.file_url));
        }
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      } finally {
        setIsLoading(false);
        setImagesPreloaded(true);
      }
    };

    fetchImages();
  }, [preloadImages]);

  // Get stable images from gallery
  const selectedImages = useMemo(() => {
    if (images.length === 0) return [];
    
    const selected = images.slice(0, Math.min(count, images.length));
    const result = [...selected];
    
    while (result.length < count && images.length > 0) {
      const remaining = count - result.length;
      result.push(...images.slice(0, remaining));
    }
    
    return result;
  }, [images, count]);

  const getImage = useCallback((index: number): string | null => {
    if (selectedImages.length === 0) return null;
    return selectedImages[index % selectedImages.length].file_url;
  }, [selectedImages]);

  const hasImages = images.length > 0 && imagesPreloaded;

  return (
    <GalleryContext.Provider value={{ images: selectedImages, isLoading, hasImages, getImage }}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
}
