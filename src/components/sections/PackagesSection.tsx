import { MapPin, Clock, Star, ImageIcon, ArrowRight, Eye } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { PackageDetailDialog } from "./PackageDetailDialog";
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

const PackageCard = ({ pkg, fallbackImage, onViewDetails }: PackageCardProps) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} Juta`;
    }
    return price.toLocaleString("id-ID");
  };

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
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/90 via-card-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end min-h-[320px]">
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-bento-cream/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-card-foreground font-semibold text-sm">4.9</span>
        </div>

        {/* View Details Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 text-bento-cream bg-primary/80 backdrop-blur-sm px-4 py-2 rounded-full">
            <Eye className="w-5 h-5" />
            <span className="font-medium">Lihat Detail</span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-bento-cream/80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{pkg.destination}</span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4" />
            <span className="text-sm">{pkg.duration_days} Hari</span>
          </div>

          <h3 className="text-2xl font-bold text-bento-cream">{pkg.title}</h3>

          {/* Highlights */}
          {pkg.highlights && pkg.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pkg.highlights.slice(0, 3).map((highlight, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-bento-cream/20 backdrop-blur-sm rounded-lg text-bento-cream"
                >
                  {highlight}
                </span>
              ))}
              {pkg.highlights.length > 3 && (
                <span className="text-xs px-2 py-1 bg-bento-cream/20 backdrop-blur-sm rounded-lg text-bento-cream">
                  +{pkg.highlights.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-bento-cream/60 text-sm">Mulai dari</span>
              <p className="text-2xl font-bold text-bento-cream">
                IDR {formatPrice(pkg.price)}
              </p>
            </div>
            <Button variant="hero" size="default" onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
              Detail
              <ArrowRight className="w-4 h-4" />
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
  const { getImage } = useGalleryImages(10);

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
              fallbackImage={getImage(index)} 
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
              onClick={() => {
                window.open(
                  "https://wa.me/6282350125334?text=Halo%20opentrip.bpn%2C%20saya%20ingin%20request%20paket%20trip%20custom%20ke%20Jepang",
                  "_blank"
                );
              }}
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
        fallbackImage={getImage(0)}
      />
    </section>
  );
};

export default PackagesSection;
