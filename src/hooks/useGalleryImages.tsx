import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  file_url: string;
  title: string;
  category: string | null;
}

export const useGalleryImages = (count: number = 5) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

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
          // Preload images
          await preloadImages(data.slice(0, count).map(img => img.file_url));
        }
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      } finally {
        setIsLoading(false);
        setImagesPreloaded(true);
      }
    };

    fetchImages();
  }, [count]);

  // Preload images for smooth display
  const preloadImages = useCallback(async (urls: string[]) => {
    const promises = urls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Resolve even on error to not block
        img.src = url;
      });
    });
    await Promise.all(promises);
  }, []);

  // Get stable random images from gallery
  const selectedImages = useMemo(() => {
    if (images.length === 0) {
      return [];
    }

    // Use first N images (already ordered by display_order)
    const selected = images.slice(0, Math.min(count, images.length));

    // If not enough images, repeat from the beginning
    const result = [...selected];
    while (result.length < count && images.length > 0) {
      const remaining = count - result.length;
      const additional = images.slice(0, remaining);
      result.push(...additional);
    }

    return result;
  }, [images, count]);

  // Get a specific image by index
  const getImage = (index: number): string | null => {
    if (selectedImages.length === 0) {
      return null;
    }
    return selectedImages[index % selectedImages.length].file_url;
  };

  // Check if we have images loaded and ready
  const hasImages = images.length > 0 && imagesPreloaded;

  return { 
    images: selectedImages, 
    isLoading, 
    getImage, 
    hasImages,
    imagesPreloaded 
  };
};
