import { MapPin, Languages, Heart, Award } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { useGallery } from "@/contexts/GalleryContext";

const TripLeaderSection = () => {
  const { getImage } = useGallery();

  return (
    <section id="trip-leader" className="py-20 relative">
      <div className="absolute inset-0 pattern-overlay opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Trip Leader
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Siapa yang Akan <span className="text-primary">Menemanimu</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bukan sekadar guide. Tapi teman perjalanan yang benar-benar tahu Jepang.
          </p>
        </div>

        {/* Leader Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Photo Card */}
          <BentoCard 
            variant="default" 
            className="relative overflow-hidden min-h-[400px] lg:col-span-2"
            hoverEffect="tilt"
          >
            <img
              src={getImage(2) || '/placeholder.svg'}
              alt="Trip Leader"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl font-bold text-bento-cream">Your Trip Leader</h3>
              <p className="text-bento-cream/80">Founder opentrip.bpn</p>
            </div>
          </BentoCard>

          {/* Info Cards */}
          <div className="lg:col-span-3 space-y-6">
            {/* Bio Card */}
            <BentoCard variant="glass" className="p-6" hoverEffect="lift">
              <h4 className="font-bold text-xl text-foreground mb-4">Tentang Saya</h4>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Halo! Saya adalah traveler yang jatuh cinta dengan Jepang sejak perjalanan pertama di 2018. 
                  Setelah berkunjung lebih dari 5 kali dan menjelajahi berbagai prefektur, 
                  saya ingin berbagi pengalaman ini dengan teman-teman yang punya mimpi serupa.
                </p>
                <p>
                  Filosofi saya sederhana: <span className="font-semibold text-foreground">
                  "Traveling bukan tentang checklist destinasi, tapi tentang memori dan koneksi yang kita bangun."
                  </span>
                </p>
              </div>
            </BentoCard>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <BentoCard variant="red" className="p-5" hoverEffect="pulse">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                  <span className="text-sm text-primary-foreground/80">Pengalaman</span>
                </div>
                <p className="text-3xl font-bold text-primary-foreground">5+</p>
                <p className="text-sm text-primary-foreground/70">kunjungan ke Jepang</p>
              </BentoCard>

              <BentoCard variant="teal" className="p-5" hoverEffect="pulse">
                <div className="flex items-center gap-3 mb-2">
                  <Languages className="w-5 h-5 text-bento-cream" />
                  <span className="text-sm text-bento-cream/80">Bahasa</span>
                </div>
                <p className="text-3xl font-bold text-bento-cream">3</p>
                <p className="text-sm text-bento-cream/70">Indonesia, English, 日本語</p>
              </BentoCard>
            </div>

            {/* Why Me Card */}
            <BentoCard variant="default" className="p-6" hoverEffect="glow">
              <h4 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Kenapa Traveling Bersama Saya?
              </h4>
              <ul className="space-y-3">
                {[
                  "Saya ikut dalam perjalanan, bukan hanya mengatur dari jauh",
                  "Berbagi hidden gems yang tidak ada di guidebook",
                  "Fleksibel menyesuaikan dengan mood dan preferensi grup",
                  "Available 24/7 selama trip untuk bantuan apapun",
                  "Sudah punya network lokal: restoran, toko, dan tempat unik",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                    <Heart className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </BentoCard>
          </div>
        </div>

        {/* Trust Quote */}
        <div className="mt-12 text-center">
          <BentoCard variant="glass" className="inline-block px-8 py-6 max-w-2xl">
            <p className="text-lg text-foreground italic">
              "Trip leader yang bukan sekadar guide, tapi teman yang genuinely care sama pengalaman kamu."
            </p>
            <p className="text-muted-foreground text-sm mt-2">— Testimoni peserta</p>
          </BentoCard>
        </div>
      </div>
    </section>
  );
};

export default TripLeaderSection;
