import { useState, useEffect } from "react";
import { MapPin, Languages, Heart, Award, Globe } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { useGallery } from "@/contexts/GalleryContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface TripLeader {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  experience_years: number;
  trips_led: number;
  languages: string[];
  specialties: string[];
  philosophy: string | null;
}

const TripLeaderSection = () => {
  const { getImage } = useGallery();
  const [leader, setLeader] = useState<TripLeader | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeader = async () => {
      const { data, error } = await supabase
        .from('trip_leaders')
        .select('*')
        .eq('is_active', true)
        .eq('is_primary', true)
        .maybeSingle();

      if (!error && data) {
        setLeader(data);
      }
      setLoading(false);
    };

    fetchLeader();
  }, []);

  if (loading) {
    return (
      <section id="trip-leader" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-4 w-24 mx-auto mb-3" />
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-48 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!leader) {
    return null;
  }

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
              src={leader.photo_url || getImage(2) || '/placeholder.svg'}
              alt={leader.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl font-bold text-bento-cream">{leader.name}</h3>
              <p className="text-bento-cream/80">{leader.role}</p>
            </div>
          </BentoCard>

          {/* Info Cards */}
          <div className="lg:col-span-3 space-y-6">
            {/* Bio Card */}
            <BentoCard variant="glass" className="p-6" hoverEffect="lift">
              <h4 className="font-bold text-xl text-foreground mb-4">Tentang Saya</h4>
              <div className="space-y-4 text-muted-foreground">
                <p>{leader.bio}</p>
                {leader.philosophy && (
                  <p>
                    <span className="font-semibold text-foreground italic">
                      "{leader.philosophy}"
                    </span>
                  </p>
                )}
              </div>
            </BentoCard>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <BentoCard variant="red" className="p-5" hoverEffect="pulse">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                  <span className="text-sm text-primary-foreground/80">Pengalaman</span>
                </div>
                <p className="text-3xl font-bold text-primary-foreground">{leader.experience_years}+</p>
                <p className="text-sm text-primary-foreground/70">tahun traveling ke Jepang</p>
              </BentoCard>

              <BentoCard variant="teal" className="p-5" hoverEffect="pulse">
                <div className="flex items-center gap-3 mb-2">
                  <Languages className="w-5 h-5 text-bento-cream" />
                  <span className="text-sm text-bento-cream/80">Bahasa</span>
                </div>
                <p className="text-3xl font-bold text-bento-cream">{leader.languages.length}</p>
                <p className="text-sm text-bento-cream/70">{leader.languages.join(', ')}</p>
              </BentoCard>
            </div>

            {/* Specialties Card */}
            {leader.specialties.length > 0 && (
              <BentoCard variant="default" className="p-6" hoverEffect="glow">
                <h4 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Spesialisasi Saya
                </h4>
                <div className="flex flex-wrap gap-2">
                  {leader.specialties.map((specialty, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Sudah memimpin {leader.trips_led}+ trip ke Jepang
                  </p>
                </div>
              </BentoCard>
            )}
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
