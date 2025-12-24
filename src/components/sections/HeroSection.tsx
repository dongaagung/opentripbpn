import { ChevronDown, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/BentoCard";
import { useGallery } from "@/contexts/GalleryContext";
import { openWhatsApp } from "@/lib/whatsapp";
import { useState, useEffect, useMemo } from "react";

// Dynamic image component with smooth fade transition
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
  const [displayedImage, setDisplayedImage] = useState(images[0] || '');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      // Start fade out
      setIsVisible(false);
      
      // After fade out completes, change image and fade in
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % images.length;
          setDisplayedImage(images[next]);
          return next;
        });
        setIsVisible(true);
      }, 800); // Wait for fade out to complete
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, images]);

  // Update displayed image when images array changes
  useEffect(() => {
    if (images.length > 0 && images[currentIndex]) {
      setDisplayedImage(images[currentIndex]);
    }
  }, [images, currentIndex]);

  if (images.length === 0 || !displayedImage) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={displayedImage}
        alt={alt}
        className={`${className} absolute inset-0 transition-opacity duration-[800ms] ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
};

const HeroSection = () => {
  const { images } = useGallery();

  // Shuffle and distribute images for each card - ensuring no duplicates across cards at the same index
  const shuffledImageSets = useMemo(() => {
    if (images.length === 0) return { hero: [], tokyo: [], kyoto: [] };
    
    const allUrls = images.map(img => img.file_url);
    
    // Fisher-Yates shuffle with seed offset for different starting points
    const shuffleWithOffset = (arr: string[], offset: number) => {
      const shuffled = [...arr];
      // Apply offset rotation first
      for (let i = 0; i < offset; i++) {
        const first = shuffled.shift();
        if (first) shuffled.push(first);
      }
      // Then shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Create different sets with different starting indices to avoid same image showing
    const heroSet = shuffleWithOffset(allUrls, 0);
    const tokyoSet = shuffleWithOffset(allUrls, Math.floor(allUrls.length / 3));
    const kyotoSet = shuffleWithOffset(allUrls, Math.floor((allUrls.length * 2) / 3));

    // Ensure first images are different across all cards
    const usedFirstImages = new Set<string>();
    
    const getUniqueFirstImage = (arr: string[]): string[] => {
      const result = [...arr];
      // Find first unused image and move it to front
      for (let i = 0; i < result.length; i++) {
        if (!usedFirstImages.has(result[i])) {
          usedFirstImages.add(result[i]);
          // Move this image to front
          const [chosen] = result.splice(i, 1);
          result.unshift(chosen);
          break;
        }
      }
      return result;
    };

    return {
      hero: getUniqueFirstImage(heroSet),
      tokyo: getUniqueFirstImage(tokyoSet),
      kyoto: getUniqueFirstImage(kyotoSet),
    };
  }, [images]);

  const scrollToPackages = () => {
    const element = document.querySelector("#packages");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen pt-20 pb-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pattern-overlay" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
          {/* Main Hero Card - Large */}
          <BentoCard variant="default" size="large" className="relative overflow-hidden min-h-[400px] lg:min-h-[500px] animate-fade-up" hover={true} hoverEffect="zoom">
            {shuffledImageSets.hero.length > 0 && (
              <DynamicImage 
                images={shuffledImageSets.hero} 
                interval={10000} 
                alt="Japan destination" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/80 via-card-foreground/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              {/* Emotional Headline */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-bento-cream mb-3 leading-tight">
                Jepang yang <span className="text-primary-foreground">Sesungguhnya.</span>
                <br />
                <span className="text-xl md:text-2xl lg:text-3xl font-normal text-bento-cream/90">Bukan yang di Brosur.</span>
              </h1>
              <p className="text-bento-cream/90 text-base md:text-lg mb-6 max-w-md">
                Eksplor hidden gems, kuliner lokal, dan pengalaman autentik bersama grup kecil yang intimate.
              </p>
              {/* Soft CTA */}
              <div className="flex flex-wrap gap-3">
                <Button variant="bento" size="lg" onClick={scrollToPackages}>
                  Lihat Trip Selanjutnya →
                </Button>
                <Button variant="heroOutline" size="lg" onClick={() => {
                  const element = document.querySelector("#why-us");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}>
                  Kenapa Kami?
                </Button>
              </div>
            </div>
          </BentoCard>

          {/* Social Proof Card - Red Accent */}
          <BentoCard variant="red" className="flex flex-col justify-between animate-fade-up delay-100" hoverEffect="lift">
            <div className="transition-all duration-300 group-hover:translate-x-1">
              <span className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider transition-all duration-300 group-hover:text-primary-foreground group-hover:tracking-widest">
                Dipercaya Oleh
              </span>
              <div className="mt-4 transition-all duration-500 group-hover:scale-105 origin-left">
                <span className="text-5xl md:text-6xl font-bold transition-all duration-300 group-hover:text-primary-foreground group-hover:drop-shadow-lg">7+</span>
                <p className="text-primary-foreground/90 mt-2 transition-all duration-300 group-hover:text-primary-foreground">Traveler sudah merasakan pengalaman kami</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <span className="text-amber-300">★★★★★</span>
                <span className="text-sm">4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80 transition-all duration-300 group-hover:text-primary-foreground group-hover:translate-x-2 group-hover:gap-3">
                <Users className="w-5 h-5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
                <span className="text-sm transition-all duration-300 group-hover:font-medium">100% ingin ikut lagi</span>
              </div>
            </div>
          </BentoCard>

          {/* Tokyo Preview Card */}
          <BentoCard variant="default" className="relative overflow-hidden min-h-[200px] animate-fade-up delay-200" hover={true} hoverEffect="tilt">
            {shuffledImageSets.tokyo.length > 0 && (
              <DynamicImage 
                images={shuffledImageSets.tokyo} 
                interval={13000} 
                alt="Gallery preview" 
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-2"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/70 to-transparent transition-all duration-500 group-hover:from-card-foreground/90" />
            <div className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 group-hover:translate-y-[-4px]">
              <div className="flex items-center gap-2 text-bento-cream transition-all duration-300 group-hover:gap-3">
                <MapPin className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:text-primary" />
                <span className="font-semibold transition-all duration-300 group-hover:tracking-wide group-hover:text-primary-foreground">Tokyo</span>
              </div>
            </div>
          </BentoCard>

          {/* Brand Card - Teal */}
          <BentoCard variant="teal" className="flex flex-col justify-center items-center text-center animate-fade-up delay-300" hoverEffect="glow">
            <span className="text-4xl md:text-5xl font-bold mb-2 transition-all duration-500 group-hover:scale-110 group-hover:tracking-wide group-hover:text-bento-cream">opentrip</span>
            <span className="text-2xl md:text-3xl font-light transition-all duration-500 group-hover:scale-105 group-hover:text-primary delay-75">.bpn</span>
            <p className="text-bento-cream/70 mt-4 text-sm transition-all duration-300 group-hover:text-bento-cream group-hover:translate-y-1 group-hover:tracking-wider">Your Japan Travel Partner</p>
          </BentoCard>

          {/* Kyoto Preview Card - Tall */}
          <BentoCard variant="default" size="tall" className="relative overflow-hidden min-h-[200px] animate-fade-up delay-400" hover={true} hoverEffect="float">
            {shuffledImageSets.kyoto.length > 0 && (
              <DynamicImage 
                images={shuffledImageSets.kyoto} 
                interval={16000} 
                alt="Gallery preview" 
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:-rotate-1"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/70 to-transparent transition-all duration-500 group-hover:from-card-foreground/90" />
            <div className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 group-hover:translate-y-[-6px]">
              <div className="flex items-center gap-2 text-bento-cream mb-2 transition-all duration-300 group-hover:gap-3">
                <MapPin className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:text-primary" />
                <span className="font-semibold transition-all duration-300 group-hover:tracking-wide group-hover:text-primary-foreground">Kyoto</span>
              </div>
              <p className="text-bento-cream/80 text-sm transition-all duration-300 group-hover:text-bento-cream group-hover:translate-x-1">Temple & Tradisi</p>
            </div>
          </BentoCard>

          {/* Schedule Card */}
          <BentoCard variant="glass" className="flex flex-col justify-between animate-fade-up delay-500" hoverEffect="pulse">
            <div className="flex items-center gap-3 text-foreground/70 text-sm transition-all duration-300 group-hover:text-foreground group-hover:gap-4">
              <Calendar className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 group-hover:text-primary" />
              <span className="transition-all duration-300 group-hover:tracking-wider">Next Trip</span>
            </div>
            <div className="mt-4 transition-all duration-500 group-hover:scale-105 origin-left">
              <span className="text-3xl md:text-4xl font-bold text-foreground transition-all duration-300 group-hover:text-primary group-hover:drop-shadow-lg">MAR</span>
              <p className="text-lg text-foreground/90 transition-all duration-300 group-hover:text-foreground group-hover:translate-x-1">2026</p>
            </div>
            <div className="mt-4 py-2 px-3 rounded-xl bg-primary/20 text-primary text-sm font-medium inline-block transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
              Slot Terbatas (Hanya 8 pax)
            </div>
          </BentoCard>

          {/* CTA Card */}
          <BentoCard variant="default" className="flex flex-col justify-center items-center text-center animate-fade-up delay-600" hoverEffect="lift">
            <p className="text-card-foreground/80 text-sm mb-3 transition-all duration-300 group-hover:text-card-foreground group-hover:-translate-y-1">Siap untuk petualangan?</p>
            <p className="text-xl font-bold text-card-foreground mb-4 transition-all duration-300 group-hover:scale-105 group-hover:tracking-wide">Mulai dari</p>
            <div className="flex items-baseline gap-1 transition-all duration-500 group-hover:scale-110 group-hover:gap-2">
              <span className="text-3xl font-bold text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">IDR 17jt</span>
              <span className="text-lg text-primary transition-all duration-300 group-hover:translate-x-1">juta</span>
            </div>
            <p className="text-card-foreground/60 text-xs mt-2 transition-all duration-300 group-hover:text-card-foreground/80 group-hover:translate-y-1">*per orang</p>
          </BentoCard>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-12">
          <button onClick={scrollToPackages} className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors duration-300">
            <span className="text-sm mb-2">Scroll untuk melihat lebih</span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
