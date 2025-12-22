import { useState, useEffect } from "react";
import { Play, X, MapPin, ImageIcon } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { supabase } from "@/integrations/supabase/client";

interface GalleryItem {
  id: string;
  type: "image" | "video";
  src: string;
  thumbnail: string;
  caption: string;
  location: string;
  category: string;
}

const GallerySection = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      if (data) {
        const items: GalleryItem[] = data.map((item) => ({
          id: item.id,
          type: item.file_type === "video" ? "video" : "image",
          src: item.file_url,
          thumbnail: item.file_url,
          caption: item.title,
          location: item.description || "",
          category: item.category || "General",
        }));

        setGalleryItems(items);

        // Extract unique categories
        const uniqueCategories = [
          "Semua",
          ...new Set(items.map((item) => item.category)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems =
    activeCategory === "Semua"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  if (isLoading) {
    return (
      <section id="gallery" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (galleryItems.length === 0) {
    return (
      <section id="gallery" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Galeri
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Momen Berharga
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Koleksi foto dan video dari trip-trip sebelumnya bersama peserta kami
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
            <p>Belum ada foto di galeri</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 relative">
      <div className="absolute inset-0 pattern-overlay opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Galeri
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Momen Berharga
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Koleksi foto dan video dari trip-trip sebelumnya bersama peserta kami
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-bento-cream/10 text-foreground hover:bg-bento-cream/20"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => (
            <BentoCard
              key={item.id}
              variant="default"
              className={`relative overflow-hidden cursor-pointer group ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
              onClick={() => setSelectedItem(item)}
            >
              <div className="absolute inset-0">
                <img
                  src={item.thumbnail}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 min-h-[200px]">
                {item.location && (
                  <div className="flex items-center gap-2 text-bento-cream/80 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{item.location}</span>
                  </div>
                )}
                <p className="text-bento-cream font-medium text-sm">{item.caption}</p>
              </div>

              {/* Video Play Button */}
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-bento-cream/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 text-card-foreground ml-1" />
                  </div>
                </div>
              )}
            </BentoCard>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-bento-cream/10 flex items-center justify-center text-foreground hover:bg-bento-cream/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="max-w-5xl w-full max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.type === "video" ? (
              <video
                src={selectedItem.src}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
            ) : (
              <img
                src={selectedItem.src}
                alt={selectedItem.caption}
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
            )}
            <div className="mt-4 text-center">
              <p className="text-foreground text-xl font-semibold">
                {selectedItem.caption}
              </p>
              {selectedItem.location && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedItem.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
