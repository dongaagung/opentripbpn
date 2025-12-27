import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Play, X, MapPin, ImageIcon, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LazyImage from "@/components/ui/LazyImage";

interface GalleryItem {
  id: string;
  type: "image" | "video";
  src: string;
  thumbnail: string;
  caption: string;
  location: string;
  category: string;
  aiCaption?: string;
  overlayColor?: string;
}

// Different hover effects for variety
const hoverEffects = [
  "hover:translate-y-[-8px] hover:scale-[1.02] hover:rotate-0",
  "hover:rotate-[-2deg] hover:scale-[1.03]",
  "hover:rotate-[2deg] hover:scale-[1.03]",
  "hover:scale-[1.05] hover:translate-y-0",
  "hover:translate-y-[-12px] hover:scale-[1.01]",
  "hover:scale-[1.04] hover:rotate-[-1deg]",
  "hover:translate-y-[-6px] hover:scale-[1.02] hover:rotate-[1deg]",
  "hover:scale-[1.03] hover:translate-x-[4px]"
];

// Predefined color palette matching theme - Japan inspired colors
const defaultColors = [
  '#DC5240', '#2D7D90', '#E07B39', '#3D8B6E',
  '#B8860B', '#4A6D7C', '#C75B7A', '#5E4B8A'
];

const GallerySection = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const analysisQueueRef = useRef<string[]>([]);
  const isAnalyzingRef = useRef(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset showAll when category changes
  useEffect(() => {
    setShowAll(false);
  }, [activeCategory]);

  // Hide navbar / floating elements while lightbox is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (selectedItem) root.setAttribute("data-gallery-lightbox", "open");
    else root.removeAttribute("data-gallery-lightbox");
    return () => root.removeAttribute("data-gallery-lightbox");
  }, [selectedItem]);

  // Throttled AI analysis - process one at a time with delay
  const processAnalysisQueue = useCallback(async () => {
    if (isAnalyzingRef.current || analysisQueueRef.current.length === 0) return;
    
    isAnalyzingRef.current = true;
    const itemId = analysisQueueRef.current.shift();
    
    if (!itemId) {
      isAnalyzingRef.current = false;
      return;
    }

    setAnalyzingIds(prev => new Set(prev).add(itemId));
    
    try {
      const item = galleryItems.find(i => i.id === itemId);
      if (!item || item.type === "video" || item.aiCaption) {
        isAnalyzingRef.current = false;
        processAnalysisQueue();
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { imageUrl: item.src }
      });
      
      if (!error && data) {
        setGalleryItems(prev => prev.map(i => 
          i.id === itemId ? { ...i, aiCaption: data.caption, overlayColor: data.overlayColor } : i
        ));
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      
      // Wait 2 seconds before processing next item
      setTimeout(() => {
        isAnalyzingRef.current = false;
        processAnalysisQueue();
      }, 2000);
    }
  }, [galleryItems]);

  // Queue images for analysis (only first 6 visible ones)
  useEffect(() => {
    const itemsToAnalyze = galleryItems
      .filter(item => !item.aiCaption && item.type === "image")
      .slice(0, 6) // Only analyze first 6 images
      .map(item => item.id);
    
    // Add to queue without duplicates
    const newItems = itemsToAnalyze.filter(id => !analysisQueueRef.current.includes(id));
    analysisQueueRef.current.push(...newItems);
    
    processAnalysisQueue();
  }, [galleryItems.length, processAnalysisQueue]);

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
        const items: GalleryItem[] = data.map(item => ({
          id: item.id,
          type: item.file_type === "video" ? "video" : "image",
          src: item.file_url,
          thumbnail: item.file_url,
          caption: item.title,
          location: item.description || "",
          category: item.category || "General"
        }));
        setGalleryItems(items);
        const uniqueCategories = ["Semua", ...new Set(items.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = activeCategory === "Semua"
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  // Limit items on mobile unless "showAll" is true
  const MOBILE_LIMIT = 8;
  const displayItems = (isMobile && !showAll)
    ? filteredItems.slice(0, MOBILE_LIMIT)
    : filteredItems;

  const getOverlayColor = (item: GalleryItem, index: number) => {
    return item.overlayColor || defaultColors[index % defaultColors.length];
  };

  const getGridClass = (index: number) => {
    const patterns = [
      "col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-1",
      "col-span-1 row-span-2", "col-span-1 row-span-1", "col-span-2 row-span-1",
      "col-span-1 row-span-1", "col-span-1 row-span-1"
    ];
    return patterns[index % patterns.length];
  };

  const getHoverEffect = (index: number) => hoverEffects[index % hoverEffects.length];

  if (isLoading) {
    return (
      <section id="gallery" className="py-20 bg-background">
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
      <section id="gallery" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Galeri</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">Momen Berharga</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Koleksi foto dan video dari trip-trip sebelumnya bersama peserta kami</p>
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
    <section id="gallery" className="py-20 bg-card/50 relative overflow-hidden">
      {/* Japanese-style decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full border border-primary/10" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full border border-primary/5" />
        <div className="absolute top-20 left-10 w-20 h-20 border-t-2 border-l-2 border-primary/10 rounded-tl-full" />
        <div className="absolute bottom-20 right-10 w-16 h-16 border-b-2 border-r-2 border-primary/10 rounded-br-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-lexend font-medium text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            ギャラリー
            <Sparkles className="w-4 h-4" />
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-3 mb-4">Momen Berharga</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-body">Koleksi foto dari trip-trip sebelumnya</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-xl text-sm font-lexend font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-card text-foreground hover:bg-accent border border-border"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Bento Grid Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px] md:auto-rows-[220px]">
          {displayItems.map((item, index) => {
            const overlayColor = getOverlayColor(item, index);
            const isAnalyzing = analyzingIds.has(item.id);
            const hoverEffect = getHoverEffect(index);
            
            return (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-2xl cursor-pointer group transition-all duration-500 ease-out shadow-lg hover:shadow-2xl ${getGridClass(index)} ${hoverEffect}`}
                onClick={() => setSelectedItem(item)}
                style={{ transformOrigin: 'center center' }}
              >
                {/* Image with Lazy Loading */}
                <LazyImage
                  src={item.thumbnail}
                  alt={item.caption}
                  className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-110"
                  placeholderColor={overlayColor}
                />

                {/* Color Overlay - Always visible at bottom */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1/2 transition-all duration-500"
                  style={{ background: `linear-gradient(to top, ${overlayColor}ee 0%, ${overlayColor}99 40%, transparent 100%)` }}
                />

                {/* Hover overlay for full image */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(to top, ${overlayColor}dd 0%, ${overlayColor}66 50%, transparent 100%)` }}
                />

                {/* Japanese-style corner accent */}
                <div className="absolute top-3 right-3 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-full h-full border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
                </div>
                <div className="absolute bottom-16 left-3 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <div className="w-full h-full border-b-2 border-l-2 border-white/30 rounded-bl-lg" />
                </div>

                {/* Caption - Always visible */}
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end">
                  <div className="flex items-start gap-2">
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        <span className="text-white/70 text-sm font-body">Menganalisis...</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white/80 mt-0.5 flex-shrink-0" />
                        <p className="text-white font-heading font-semibold text-sm md:text-base leading-tight drop-shadow-lg">
                          {item.aiCaption || item.caption}
                        </p>
                      </>
                    )}
                  </div>

                  {item.location && (
                    <div className="flex items-center gap-1.5 text-white/80 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs font-body">{item.location}</span>
                    </div>
                  )}
                </div>

                {/* Video Play Button */}
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                      <Play className="w-5 h-5 text-foreground ml-1" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button - Only on mobile when there are more items */}
        {isMobile && filteredItems.length > MOBILE_LIMIT && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {showAll ? (
                <>
                  <span>Tampilkan Lebih Sedikit</span>
                  <span className="text-xs opacity-80">({filteredItems.length - MOBILE_LIMIT} foto disembunyikan)</span>
                </>
              ) : (
                <>
                  <span>Lihat Lebih Banyak</span>
                  <span className="text-xs opacity-80">({filteredItems.length - MOBILE_LIMIT} foto lagi)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedItem && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-[#FAF8F5] backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
            className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-[calc(env(safe-area-inset-right)+1rem)] z-[10000] w-14 h-14 rounded-full bg-foreground flex items-center justify-center text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-2xl border-2 border-foreground/20"
            aria-label="Tutup galeri"
            type="button"
          >
            <X className="w-7 h-7" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
            className="md:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] left-1/2 -translate-x-1/2 z-[10000] rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-lg"
          >
            Tutup
          </button>

          <div className="max-w-5xl w-full max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            {selectedItem.type === "video" ? (
              <video src={selectedItem.src} controls autoPlay className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
            ) : (
              <img src={selectedItem.src} alt={selectedItem.caption} className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" loading="eager" />
            )}
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-foreground text-xl font-semibold">{selectedItem.aiCaption || selectedItem.caption}</p>
              </div>
              {selectedItem.location && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedItem.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default GallerySection;
