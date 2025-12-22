import { useState, useEffect, useCallback } from "react";
import { Play, X, MapPin, ImageIcon, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
const hoverEffects = ["hover:translate-y-[-8px] hover:scale-[1.02] hover:rotate-0", "hover:rotate-[-2deg] hover:scale-[1.03]", "hover:rotate-[2deg] hover:scale-[1.03]", "hover:scale-[1.05] hover:translate-y-0", "hover:translate-y-[-12px] hover:scale-[1.01]", "hover:scale-[1.04] hover:rotate-[-1deg]", "hover:translate-y-[-6px] hover:scale-[1.02] hover:rotate-[1deg]", "hover:scale-[1.03] hover:translate-x-[4px]"];
const GallerySection = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const analyzeImage = useCallback(async (item: GalleryItem) => {
    if (item.type === "video" || item.aiCaption) return;
    setAnalyzingIds(prev => new Set(prev).add(item.id));
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-image', {
        body: {
          imageUrl: item.src
        }
      });
      if (!error && data) {
        setGalleryItems(prev => prev.map(i => i.id === item.id ? {
          ...i,
          aiCaption: data.caption,
          overlayColor: data.overlayColor
        } : i));
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }, []);
  useEffect(() => {
    fetchGalleryItems();
  }, []);

  // Analyze images when they load
  useEffect(() => {
    galleryItems.forEach(item => {
      if (!item.aiCaption && item.type === "image" && !analyzingIds.has(item.id)) {
        analyzeImage(item);
      }
    });
  }, [galleryItems, analyzeImage, analyzingIds]);
  const fetchGalleryItems = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("gallery").select("*").eq("is_published", true).order("display_order", {
        ascending: true
      });
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
  const filteredItems = activeCategory === "Semua" ? galleryItems : galleryItems.filter(item => item.category === activeCategory);

  // Predefined color palette matching theme - Japan inspired colors
  const defaultColors = ['#DC5240',
  // warm red (primary-like)
  '#2D7D90',
  // ocean teal
  '#E07B39',
  // sunset orange
  '#3D8B6E',
  // forest green
  '#B8860B',
  // golden
  '#4A6D7C',
  // slate blue
  '#C75B7A',
  // sakura pink
  '#5E4B8A' // dusk purple
  ];
  const getOverlayColor = (item: GalleryItem, index: number) => {
    return item.overlayColor || defaultColors[index % defaultColors.length];
  };

  // Determine grid span based on index for bento layout
  const getGridClass = (index: number) => {
    const patterns = ["col-span-2 row-span-2",
    // Large featured
    "col-span-1 row-span-1",
    // Small
    "col-span-1 row-span-1",
    // Small
    "col-span-1 row-span-2",
    // Tall
    "col-span-1 row-span-1",
    // Small
    "col-span-2 row-span-1",
    // Wide
    "col-span-1 row-span-1",
    // Small
    "col-span-1 row-span-1" // Small
    ];
    return patterns[index % patterns.length];
  };

  // Get hover effect for variety
  const getHoverEffect = (index: number) => {
    return hoverEffects[index % hoverEffects.length];
  };
  if (isLoading) {
    return <section id="gallery" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>;
  }
  if (galleryItems.length === 0) {
    return <section id="gallery" className="py-20 bg-background">
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
      </section>;
  }
  return <section id="gallery" className="py-20 bg-card/50 relative overflow-hidden">
      {/* Japanese-style decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
        backgroundSize: '60px 60px'
      }} />
        {/* Circular accent */}
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full border border-primary/10" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full border border-primary/5" />
        {/* Japanese wave pattern hint */}
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mt-3 mb-4">
            Momen Berharga
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-body">Koleksi foto dari trip-trip sebelumnya</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(category => <button key={category} onClick={() => setActiveCategory(category)} className={`px-5 py-2.5 rounded-xl text-sm font-lexend font-medium transition-all duration-300 ${activeCategory === category ? "bg-primary text-primary-foreground shadow-lg" : "bg-card text-foreground hover:bg-accent border border-border"}`}>
              {category}
            </button>)}
        </div>

        {/* Bento Grid Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px] md:auto-rows-[220px]">
          {filteredItems.map((item, index) => {
          const overlayColor = getOverlayColor(item, index);
          const isAnalyzing = analyzingIds.has(item.id);
          const hoverEffect = getHoverEffect(index);
          return <div key={item.id} className={`relative overflow-hidden rounded-2xl cursor-pointer group transition-all duration-500 ease-out shadow-lg hover:shadow-2xl ${getGridClass(index)} ${hoverEffect}`} onClick={() => setSelectedItem(item)} style={{
            transformOrigin: 'center center'
          }}>
                {/* Image */}
                <div className="absolute inset-0">
                  <img src={item.thumbnail} alt={item.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>

                {/* Color Overlay - Always visible at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 transition-all duration-500" style={{
              background: `linear-gradient(to top, ${overlayColor}ee 0%, ${overlayColor}99 40%, transparent 100%)`
            }} />

                {/* Hover overlay for full image */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
              background: `linear-gradient(to top, ${overlayColor}dd 0%, ${overlayColor}66 50%, transparent 100%)`
            }} />

                {/* Japanese-style corner accent */}
                <div className="absolute top-3 right-3 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-full h-full border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
                </div>
                <div className="absolute bottom-16 left-3 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <div className="w-full h-full border-b-2 border-l-2 border-white/30 rounded-bl-lg" />
                </div>

                {/* Caption - Always visible */}
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end">
                  {/* AI Caption with sparkle */}
                  <div className="flex items-start gap-2">
                    {isAnalyzing ? <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        <span className="text-white/70 text-sm font-body">Menganalisis...</span>
                      </div> : <>
                        <Sparkles className="w-4 h-4 text-white/80 mt-0.5 flex-shrink-0" />
                        <p className="text-white font-heading font-semibold text-sm md:text-base leading-tight drop-shadow-lg">
                          {item.aiCaption || item.caption}
                        </p>
                      </>}
                  </div>

                  {/* Location - visible on hover */}
                  {item.location && <div className="flex items-center gap-1.5 text-white/80 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs font-body">{item.location}</span>
                    </div>}
                </div>

                {/* Video Play Button */}
                {item.type === "video" && <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                      <Play className="w-5 h-5 text-foreground ml-1" />
                    </div>
                  </div>}
              </div>;
        })}
        </div>
      </div>

      {/* Lightbox */}
      {selectedItem && <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-accent transition-colors border border-border">
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl w-full max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
            {selectedItem.type === "video" ? <video src={selectedItem.src} controls autoPlay className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" /> : <img src={selectedItem.src} alt={selectedItem.caption} className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />}
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-foreground text-xl font-semibold">
                  {selectedItem.aiCaption || selectedItem.caption}
                </p>
              </div>
              {selectedItem.location && <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedItem.location}</span>
                </div>}
            </div>
          </div>
        </div>}
    </section>;
};
export default GallerySection;