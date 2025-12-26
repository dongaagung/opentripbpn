import { useState, useEffect, useMemo } from "react";
import { ChevronDown, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/BentoCard";
import { useGallery } from "@/contexts/GalleryContext";
import { supabase } from "@/integrations/supabase/client";
interface HeroStat {
  id: string;
  label: string;
  value: string;
  display_order: number;
}

// Dynamic image component with smooth crossfade and Ken Burns effect
const DynamicImage = ({
  images,
  interval = 7000,
  alt,
  className,
  priority = false
}: {
  images: string[];
  interval?: number;
  alt: string;
  className?: string;
  priority?: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1 % images.length);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);

      // After transition starts, prepare next image
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % images.length);
        setIsTransitioning(false);
      }, 1500); // Match transition duration
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, nextIndex, images]);

  // Update indices when images array changes
  useEffect(() => {
    if (images.length > 0) {
      setCurrentIndex(0);
      setNextIndex(1 % images.length);
    }
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Current Image - Smooth crossfade with Ken Burns zoom */}
      <img
        src={images[currentIndex] || images[0]}
        alt={alt}
        className={`${className} absolute inset-0 transition-all duration-[1500ms] ease-cinematic ${
          isTransitioning
            ? 'opacity-0 scale-[1.03]'
            : 'opacity-100 scale-100'
        }`}
        loading={priority ? "eager" : "lazy"}
        style={{
          transformOrigin: 'center center'
        }}
      />

      {/* Next Image - Fades in with subtle zoom */}
      {images[nextIndex] && (
        <img
          src={images[nextIndex]}
          alt={alt}
          className={`${className} absolute inset-0 transition-all duration-[1500ms] ease-cinematic ${
            isTransitioning
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-[1.05]'
          }`}
          loading="lazy"
          style={{
            transformOrigin: 'center center'
          }}
        />
      )}
    </div>
  );
};
const HeroSection = () => {
  const {
    images
  } = useGallery();
  const [heroStats, setHeroStats] = useState<HeroStat[]>([]);
  useEffect(() => {
    const fetchHeroStats = async () => {
      const {
        data,
        error
      } = await supabase.from('hero_stats').select('*').eq('is_active', true).order('display_order', {
        ascending: true
      });
      if (!error && data) {
        setHeroStats(data);
      }
    };
    fetchHeroStats();
  }, []);

  // Distribute images ensuring NO slideshow shows the same image at any time
  const shuffledImageSets = useMemo(() => {
    if (images.length === 0) return {
      hero: [],
      tokyo: [],
      kyoto: []
    };

    const allUrls = images.map(img => img.file_url);

    // Shuffle all images once using Fisher-Yates
    const shuffled = [...allUrls];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Distribute images to 3 exclusive sets (no overlap)
    const heroSet: string[] = [];
    const tokyoSet: string[] = [];
    const kyotoSet: string[] = [];

    shuffled.forEach((url, index) => {
      const group = index % 3;
      if (group === 0) heroSet.push(url);
      else if (group === 1) tokyoSet.push(url);
      else kyotoSet.push(url);
    });

    // Edge case: if less than 3 images, each slideshow gets all images
    // but starts at different index to minimize overlap
    if (allUrls.length < 3) {
      return {
        hero: [...allUrls],
        tokyo: [...allUrls].reverse(),
        kyoto: [...allUrls].sort(() => Math.random() - 0.5)
      };
    }

    // Ensure each set has at least 1 image
    const minImages = Math.min(heroSet.length, tokyoSet.length, kyotoSet.length);
    if (minImages === 0) {
      // Redistribute if any set is empty
      return {
        hero: shuffled.filter((_, i) => i % 3 === 0),
        tokyo: shuffled.filter((_, i) => i % 3 === 1),
        kyoto: shuffled.filter((_, i) => i % 3 === 2)
      };
    }

    return {
      hero: heroSet,
      tokyo: tokyoSet,
      kyoto: kyotoSet
    };
  }, [images]);
  const scrollToPackages = () => {
    const element = document.querySelector("#packages");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };

  // Get stats for display
  const displayStats = heroStats.length > 0 ? heroStats : [{
    id: '1',
    label: 'Peserta Happy',
    value: '500+',
    display_order: 1
  }, {
    id: '2',
    label: 'Trip Sukses',
    value: '50+',
    display_order: 2
  }, {
    id: '3',
    label: 'Rating',
    value: '4.9★',
    display_order: 3
  }];
  return <section id="home" className="relative min-h-screen pt-20 pb-8 md:pb-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pattern-overlay" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Mobile: Compact 2-column grid, Desktop: Full bento */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 mt-4 md:mt-8">
          {/* Main Hero Card - Full width on mobile */}
          <BentoCard variant="default" size="large" className="col-span-2 md:col-span-2 lg:col-span-2 relative min-h-[280px] md:min-h-[400px] lg:min-h-[500px] animate-fade-up" hover={true} hoverEffect="zoom">
            {shuffledImageSets.hero.length > 0 && <DynamicImage images={shuffledImageSets.hero} interval={10000} alt="Japan destination" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" priority />}
            <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/90 via-card-foreground/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
              {/* Emotional Headline - Smaller on mobile */}
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-bento-cream mb-2 md:mb-3 leading-tight">
                Jepang yang <span className="text-primary-foreground">Sesungguhnya.</span>
                <br className="hidden sm:block" />
                <span className="text-base sm:text-lg md:text-2xl lg:text-3xl font-normal text-bento-cream/90"> Bukan yang di Brosur.</span>
              </h1>
              <p className="text-bento-cream/90 text-xs sm:text-sm md:text-lg mb-3 md:mb-6 max-w-md line-clamp-2 md:line-clamp-none">
                Eksplor hidden gems, kuliner lokal, dan pengalaman autentik bersama grup kecil yang intimate.
              </p>
              {/* Soft CTA - Stack on small mobile */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <Button variant="bento" size="sm" className="md:hidden" onClick={scrollToPackages}>
                  Lihat Trip →
                </Button>
                <Button variant="bento" size="lg" className="hidden md:flex" onClick={scrollToPackages}>
                  Lihat Trip Selanjutnya →
                </Button>
                <Button variant="heroOutline" size="sm" className="md:hidden" onClick={() => {
                const element = document.querySelector("#why-us");
                if (element) element.scrollIntoView({
                  behavior: "smooth"
                });
              }}>
                  Kenapa Kami?
                </Button>
                <Button variant="heroOutline" size="lg" className="hidden md:flex" onClick={() => {
                const element = document.querySelector("#why-us");
                if (element) element.scrollIntoView({
                  behavior: "smooth"
                });
              }}>
                  Kenapa Kami?
                </Button>
              </div>
            </div>
          </BentoCard>

          {/* Social Proof Card - Compact on mobile */}
          <BentoCard variant="red" className="col-span-1 flex flex-col justify-between animate-fade-up delay-100 p-3 md:p-6" hoverEffect="lift">
            <div className="transition-all duration-300 group-hover:translate-x-1">
              <span className="text-[10px] md:text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">
                Dipercaya
              </span>
              <div className="mt-2 md:mt-4">
                <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold">
                  {displayStats[0]?.value || '500+'}
                </span>
                <p className="text-primary-foreground/90 mt-1 md:mt-2 text-[10px] sm:text-xs md:text-base line-clamp-2">
                  {displayStats[0]?.label || 'Traveler'} sudah merasakan
                </p>
              </div>
            </div>
            <div className="mt-2 md:mt-6 space-y-1 md:space-y-2">
              <div className="flex items-center gap-1 md:gap-2 text-primary-foreground/80">
                <span className="text-amber-300 text-xs md:text-base">★★★★★</span>
                <span className="text-[10px] md:text-sm">{displayStats.find(s => s.label.toLowerCase().includes('rating'))?.value || '4.9'}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-primary-foreground/80">
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">100% ikut lagi</span>
              </div>
            </div>
          </BentoCard>

          {/* Tokyo Preview Card - Show on all screens */}
          <BentoCard variant="default" className="col-span-1 relative min-h-[140px] md:min-h-[200px] animate-fade-up delay-200" hover={true} hoverEffect="tilt">
            {shuffledImageSets.tokyo.length > 0 && <DynamicImage images={shuffledImageSets.tokyo} interval={13000} alt="Gallery preview" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/70 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 pointer-events-none">
              <div className="flex items-center gap-2 text-bento-cream">
                <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                <span className="font-semibold text-sm md:text-base">Tokyo</span>
              </div>
            </div>
          </BentoCard>

          {/* Schedule + Price Combined Card for Mobile */}
          <BentoCard variant="glass" className="col-span-1 sm:hidden flex flex-col justify-between animate-fade-up delay-200 p-3" hoverEffect="pulse">
            <div>
              <div className="flex items-center gap-2 text-foreground/70 text-[10px]">
                <Calendar className="w-3 h-3" />
                <span>Next Trip</span>
              </div>
              <span className="text-lg font-bold text-foreground">MAY 2026</span>
            </div>
            <div className="mt-2 py-1 px-2 rounded-lg bg-primary/20 text-primary text-[10px] font-medium">
              8 pax only
            </div>
            <div className="mt-2 border-t border-border pt-2">
              <span className="text-[10px] text-foreground/60">Mulai dari</span>
              <p className="text-lg font-bold text-primary">IDR 17jt</p>
            </div>
          </BentoCard>

          {/* Brand Card - Smaller on mobile */}
          <BentoCard variant="teal" className="col-span-1 flex flex-col justify-center items-center text-center animate-fade-up delay-300 p-3 md:p-6" hoverEffect="glow">
            <span className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2">opentrip</span>
            <span className="text-base sm:text-lg md:text-2xl lg:text-3xl font-light">.bpn</span>
            <p className="text-bento-cream/70 mt-2 md:mt-4 text-[10px] md:text-sm">Your Japan Travel Partner</p>
          </BentoCard>

          {/* Kyoto Preview Card - Show on all screens */}
          <BentoCard variant="default" size="tall" className="col-span-1 relative min-h-[140px] md:min-h-[200px] animate-fade-up delay-400" hover={true} hoverEffect="float">
            {shuffledImageSets.kyoto.length > 0 && <DynamicImage images={shuffledImageSets.kyoto} interval={16000} alt="Gallery preview" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/70 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 pointer-events-none">
              <div className="flex items-center gap-2 text-bento-cream mb-1 md:mb-2">
                <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                <span className="font-semibold text-sm md:text-base">Kyoto</span>
              </div>
              <p className="text-bento-cream/80 text-xs md:text-sm">Temple & Tradisi</p>
            </div>
          </BentoCard>

          {/* Schedule Card - Desktop only */}
          <BentoCard variant="glass" className="hidden sm:flex col-span-1 flex-col justify-between animate-fade-up delay-500" hoverEffect="pulse">
            <div className="flex items-center gap-3 text-foreground/70 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Next Trip</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl md:text-4xl font-bold text-foreground">MAY</span>
              <p className="text-lg text-foreground/90">2026</p>
            </div>
            <div className="mt-4 py-2 px-3 rounded-xl bg-primary/20 text-primary text-sm font-medium inline-block">
              Slot Terbatas (Hanya 8 pax)
            </div>
          </BentoCard>

          {/* CTA Card - Desktop only */}
          <BentoCard variant="default" className="hidden sm:flex col-span-1 flex-col justify-center items-center text-center animate-fade-up delay-600" hoverEffect="lift">
            <p className="text-card-foreground/80 text-sm mb-3">Siap untuk petualangan?</p>
            <p className="text-xl font-bold text-card-foreground mb-4">Mulai dari</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary">IDR 17jt</span>
              <span className="text-lg text-primary">juta</span>
            </div>
            <p className="text-card-foreground/60 text-xs mt-2">*per orang</p>
          </BentoCard>
        </div>

        {/* Scroll indicator - Smaller on mobile */}
        <div className="flex justify-center mt-6 md:mt-12">
          <button onClick={scrollToPackages} className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors duration-300">
            <span className="text-xs md:text-sm mb-1 md:mb-2">Scroll untuk melihat lebih</span>
            <ChevronDown className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />
          </button>
        </div>
      </div>
    </section>;
};
export default HeroSection;