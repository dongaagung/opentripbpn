import { MapPin, Clock, Star, ImageIcon, ArrowRight } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGallery } from "@/contexts/GalleryContext";
import { PackageDetailDialog } from "./PackageDetailDialog";
import { openWhatsApp } from "@/lib/whatsapp";
import { Json } from "@/integrations/supabase/types";

interface ItineraryItem {
  day: number;
  title: string;
  activities: string[];
}

interface TripPackage {
  id: string;
  title: string;
  destination: string;
  duration_days: number;
  price: number;
  cover_image_url: string | null;
  highlights: string[];
  is_active: boolean;
  description: string | null;
  itinerary: ItineraryItem[];
  target_participants: string | null;
  inclusions: string[];
  exclusions: string[];
  meeting_point: string | null;
  departure_time: string | null;
  start_date: string | null;
  available_seats: number | null;
}

const parseItinerary = (data: Json | null): ItineraryItem[] => {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((item) => ({
      day: typeof item === 'object' && item !== null && 'day' in item ? Number(item.day) : 0,
      title: typeof item === 'object' && item !== null && 'title' in item ? String(item.title) : '',
      activities: typeof item === 'object' && item !== null && 'activities' in item && Array.isArray(item.activities)
        ? item.activities.map(String)
        : [],
    }));
  }
  return [];
};

interface PackageCardProps {
  pkg: TripPackage;
  fallbackImage: string;
  onViewDetails: () => void;
}

const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} Juta`;
  }
  return price.toLocaleString("id-ID");
};

const PackageCard = ({ pkg, fallbackImage, onViewDetails }: PackageCardProps) => {
  const imageUrl = pkg.cover_image_url || fallbackImage;

  return (
    <BentoCard
      variant="default"
      className="relative overflow-hidden group cursor-pointer"
      hover={true}
      onClick={onViewDetails}
    >
      {/* Image */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={pkg.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/90 via-card-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end min-h-[320px]">
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-bento-cream/90 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-bento-cream cursor-default">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500 transition-transform duration-300 group-hover:rotate-12" />
          <span className="text-card-foreground font-semibold text-sm">4.9</span>
        </div>


        {/* Info */}
        <div className="space-y-3">
          {/* Location & Duration Badge */}
          <div className="inline-flex items-center gap-2 text-bento-cream/80 bg-card-foreground/20 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-card-foreground/40 hover:scale-105 hover:text-bento-cream cursor-default">
            <MapPin className="w-4 h-4 transition-transform duration-300 hover:animate-bounce" />
            <span className="text-sm">{pkg.destination}</span>
            <span className="mx-1">•</span>
            <Clock className="w-4 h-4" />
            <span className="text-sm">{pkg.duration_days} Hari</span>
          </div>

          <h3 className="text-2xl font-bold text-bento-cream transition-all duration-300 group-hover:translate-x-1">{pkg.title}</h3>

          {/* Highlights */}
          {pkg.highlights && pkg.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pkg.highlights.slice(0, 3).map((highlight, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-bento-cream/20 backdrop-blur-sm rounded-lg text-bento-cream transition-all duration-300 hover:bg-bento-cream/40 hover:scale-110 hover:-translate-y-1 hover:shadow-md cursor-default"
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  {highlight}
                </span>
              ))}
              {pkg.highlights.length > 3 && (
                <span className="text-xs px-2 py-1 bg-primary/60 backdrop-blur-sm rounded-lg text-bento-cream transition-all duration-300 hover:bg-primary hover:scale-110 hover:-translate-y-1 cursor-default">
                  +{pkg.highlights.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-2">
            <div className="transition-all duration-300 hover:scale-105 cursor-default group/price">
              <span className="text-bento-cream/60 text-sm transition-colors duration-300 group-hover/price:text-bento-cream/80">Mulai dari</span>
              <p className="text-2xl font-bold text-bento-cream transition-all duration-300 group-hover/price:text-primary-foreground group-hover/price:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                IDR {formatPrice(pkg.price)}
              </p>
            </div>
            <Button variant="hero" size="default" className="transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1" onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
              Detail
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </BentoCard>
  );
};

const PackagesSection = () => {
  const [packages, setPackages] = useState<TripPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<TripPackage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { getImage } = useGallery();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from("trip_packages")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          const parsed: TripPackage[] = data.map((pkg) => ({
            ...pkg,
            itinerary: parseItinerary(pkg.itinerary),
            highlights: pkg.highlights || [],
            inclusions: pkg.inclusions || [],
            exclusions: pkg.exclusions || [],
          }));
          setPackages(parsed);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleViewDetails = (pkg: TripPackage, index: number) => {
    setSelectedPackage({ ...pkg, cover_image_url: pkg.cover_image_url || getImage(index) });
    setDialogOpen(true);
  };

  // Memoize fallback image
  const fallbackImage = useMemo(() => getImage(0), [getImage]);

  if (isLoading) {
    return (
      <section id="packages" className="py-20 relative">
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

  if (packages.length === 0) {
    return (
      <section id="packages" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Paket Perjalanan
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              Pilih Petualangan Anda
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Berbagai pilihan paket trip ke Jepang dengan itinerary menarik dan harga terjangkau
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
            <p>Belum ada paket trip tersedia</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="packages" className="py-20 relative">
      <div className="absolute inset-0 pattern-overlay opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Paket Perjalanan
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Pilih Petualangan Anda
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Berbagai pilihan paket trip ke Jepang dengan itinerary menarik dan harga terjangkau
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <PackageCard 
              key={pkg.id} 
              pkg={pkg} 
              fallbackImage={getImage(index) || ''} 
              onViewDetails={() => handleViewDetails(pkg, index)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <BentoCard variant="teal" className="inline-flex flex-col md:flex-row items-center gap-6 px-8 py-6">
            <div className="text-center md:text-left">
              <p className="text-bento-cream/80 text-sm">Butuh paket custom?</p>
              <p className="text-xl font-bold text-bento-cream">Hubungi kami untuk request khusus</p>
            </div>
            <Button
              variant="hero"
              size="lg"
              onClick={() => openWhatsApp("Halo opentrip.bpn, saya ingin request paket trip custom ke Jepang")}
            >
              Custom Trip
            </Button>
          </BentoCard>
        </div>
      </div>

      {/* Package Detail Dialog */}
      <PackageDetailDialog
        pkg={selectedPackage}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fallbackImage={fallbackImage || ''}
      />
    </section>
  );
};

export default PackagesSection;
