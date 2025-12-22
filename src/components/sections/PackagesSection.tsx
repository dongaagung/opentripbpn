import { MapPin, Clock, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/BentoCard";
import tokyoImage from "@/assets/tokyo.jpg";
import kyotoImage from "@/assets/kyoto.jpg";
import osakaImage from "@/assets/osaka.jpg";
import hokkaidoImage from "@/assets/hokkaido.jpg";

interface TripPackage {
  id: string;
  name: string;
  destination: string;
  duration: string;
  price: string;
  rating: number;
  image: string;
  highlights: string[];
  featured?: boolean;
}

const packages: TripPackage[] = [
  {
    id: "1",
    name: "Tokyo Explorer",
    destination: "Tokyo",
    duration: "5 Hari 4 Malam",
    price: "18.5 Juta",
    rating: 4.9,
    image: tokyoImage,
    highlights: ["Shibuya Crossing", "Tokyo Tower", "Akihabara", "Harajuku"],
    featured: true,
  },
  {
    id: "2",
    name: "Kyoto Cultural",
    destination: "Kyoto",
    duration: "4 Hari 3 Malam",
    price: "15.8 Juta",
    rating: 4.8,
    image: kyotoImage,
    highlights: ["Fushimi Inari", "Kinkaku-ji", "Arashiyama", "Gion District"],
  },
  {
    id: "3",
    name: "Osaka Food Tour",
    destination: "Osaka",
    duration: "4 Hari 3 Malam",
    price: "14.5 Juta",
    rating: 4.9,
    image: osakaImage,
    highlights: ["Dotonbori", "Osaka Castle", "Universal Studios", "Street Food"],
  },
  {
    id: "4",
    name: "Hokkaido Winter",
    destination: "Hokkaido",
    duration: "6 Hari 5 Malam",
    price: "25.0 Juta",
    rating: 5.0,
    image: hokkaidoImage,
    highlights: ["Ski Resort", "Onsen Experience", "Snow Festival", "Sapporo City"],
  },
];

const PackageCard = ({ pkg }: { pkg: TripPackage }) => {
  const bookNow = () => {
    const message = `Halo opentrip.bpn, saya tertarik dengan paket ${pkg.name} - ${pkg.destination} (${pkg.duration}). Mohon info lebih lanjut.`;
    window.open(
      `https://wa.me/6282350125334?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <BentoCard
      variant="default"
      className={`relative overflow-hidden group ${pkg.featured ? "md:col-span-2" : ""}`}
      hover={true}
    >
      {/* Image */}
      <div className="absolute inset-0">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/90 via-card-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end min-h-[320px]">
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-bento-cream/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-card-foreground font-semibold text-sm">{pkg.rating}</span>
        </div>

        {pkg.featured && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            Popular
          </div>
        )}

        {/* Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-bento-cream/80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{pkg.destination}</span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4" />
            <span className="text-sm">{pkg.duration}</span>
          </div>

          <h3 className="text-2xl font-bold text-bento-cream">{pkg.name}</h3>

          {/* Highlights */}
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

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-bento-cream/60 text-sm">Mulai dari</span>
              <p className="text-2xl font-bold text-bento-cream">
                IDR {pkg.price}
              </p>
            </div>
            <Button variant="hero" size="default" onClick={bookNow}>
              Book Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </BentoCard>
  );
};

const PackagesSection = () => {
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
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
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
    </section>
  );
};

export default PackagesSection;
