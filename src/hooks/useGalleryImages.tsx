import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  file_url: string;
  title: string;
  category: string | null;
}

// Fallback images from assets
import heroImage from "@/assets/hero-japan.jpg";
import tokyoImage from "@/assets/tokyo.jpg";
import kyotoImage from "@/assets/kyoto.jpg";
import osakaImage from "@/assets/osaka.jpg";
import hokkaidoImage from "@/assets/hokkaido.jpg";

const fallbackImages = [heroImage, tokyoImage, kyotoImage, osakaImage, hokkaidoImage];

export const useGalleryImages = (count: number = 5) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("id, file_url, title, category")
          .eq("is_published", true)
          .eq("file_type", "image");

        if (error) throw error;

        if (data && data.length > 0) {
          setImages(data);
        }
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Get random images from gallery, with fallbacks if not enough
  const randomImages = useMemo(() => {
    if (images.length === 0) {
      // Return fallback images if no gallery images
      return fallbackImages.slice(0, count).map((url, index) => ({
        id: `fallback-${index}`,
        file_url: url,
        title: "",
        category: null,
      }));
    }

    // Shuffle and pick random images
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    // If not enough images, repeat from the beginning
    while (selected.length < count && images.length > 0) {
      const remaining = count - selected.length;
      const additional = [...images].sort(() => Math.random() - 0.5).slice(0, remaining);
      selected.push(...additional);
    }

    return selected;
  }, [images, count]);

  // Get a specific random image by index (stable per session)
  const getImage = (index: number): string => {
    if (randomImages.length === 0) {
      return fallbackImages[index % fallbackImages.length];
    }
    return randomImages[index % randomImages.length].file_url;
  };

  return { images: randomImages, isLoading, getImage };
};
