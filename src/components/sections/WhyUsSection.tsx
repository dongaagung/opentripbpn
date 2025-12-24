import { useState, useEffect } from "react";
import { Users, MapPin, Camera, Heart, Clock, Wallet, User, Compass, Train, Bus, Coffee, Briefcase, Shuffle, Lock, X, Check } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ComparisonItem {
  id: string;
  category: string;
  our_way_title: string;
  our_way_description: string;
  our_way_icon: string;
  other_way_title: string;
  other_way_description: string;
  other_way_icon: string;
  display_order: number;
}

const iconMap: Record<string, React.ReactNode> = {
  heart: <Heart className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  train: <Train className="w-6 h-6" />,
  bus: <Bus className="w-6 h-6" />,
  coffee: <Coffee className="w-6 h-6" />,
  clock: <Clock className="w-6 h-6" />,
  briefcase: <Briefcase className="w-6 h-6" />,
  shuffle: <Shuffle className="w-6 h-6" />,
  lock: <Lock className="w-6 h-6" />,
  compass: <Compass className="w-6 h-6" />,
  mappin: <MapPin className="w-6 h-6" />,
  wallet: <Wallet className="w-6 h-6" />,
  user: <User className="w-6 h-6" />,
  check: <Check className="w-6 h-6" />,
  x: <X className="w-6 h-6" />,
};

const WhyUsSection = () => {
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparisons = async () => {
      const { data, error } = await supabase
        .from('comparison_items')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setComparisons(data);
      }
      setLoading(false);
    };

    fetchComparisons();
  }, []);

  const getIcon = (iconName: string) => {
    return iconMap[iconName.toLowerCase()] || <Compass className="w-6 h-6" />;
  };

  return (
    <section id="why-us" className="py-20 relative">
      <div className="absolute inset-0 pattern-overlay opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Kenapa Kami?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Bukan Sekadar Liburan.
            <br />
            <span className="text-primary">Ini Pengalaman.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Kami tidak menjual "paket tour". Kami mengajak kamu merasakan Jepang seperti penduduk lokal.
          </p>
        </div>

        {/* Story-based intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <BentoCard variant="teal" className="p-8" hoverEffect="lift">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-bento-cream/20">
                <Heart className="w-8 h-8 text-bento-cream" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-bento-cream mb-2">Filosofi Kami</h3>
                <p className="text-bento-cream/80">
                  Trip bukan soal berapa banyak tempat yang dikunjungi.
                  Tapi seberapa dalam kamu merasakannya.
                </p>
              </div>
            </div>
            <div className="space-y-4 text-bento-cream/90">
              <p>
                Bayangkan berjalan di gang sempit Kyoto, menemukan kedai ramen kecil yang tidak ada di Google Maps.
              </p>
              <p>
                Bayangkan berbincang dengan nenek-nenek Jepang yang menawarkan teh gratis di toko manisannya.
              </p>
              <p className="font-semibold text-bento-cream">
                Itulah Jepang yang sesungguhnya. Itulah yang kami tawarkan.
              </p>
            </div>
          </BentoCard>

          <BentoCard variant="red" className="p-8" hoverEffect="lift">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary-foreground/20">
                <Camera className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">Real Experience</h3>
                <p className="text-primary-foreground/80">
                  Bukan sekadar foto di depan landmark terkenal.
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                "Makan di tempat favorit warga lokal",
                "Naik kereta seperti penduduk Tokyo",
                "Eksplor area yang tidak ada di guidebook",
                "Waktu luang untuk jalan-jalan sendiri",
                "Grup kecil = teman baru yang akrab",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-primary-foreground/90">
                  <span className="w-2 h-2 rounded-full bg-primary-foreground/60" />
                  {item}
                </li>
              ))}
            </ul>
          </BentoCard>
        </div>

        {/* Visual Comparison Cards */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            Perbedaan yang <span className="text-primary">Terasa</span>
          </h3>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : comparisons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Data perbandingan belum tersedia.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisons.map((item) => (
                <BentoCard key={item.id} variant="glass" className="p-6" hoverEffect="lift">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getIcon(item.our_way_icon)}
                    </div>
                    <h4 className="font-bold text-foreground">{item.category}</h4>
                  </div>
                  
                  {/* Our Way */}
                  <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">🚶 {item.our_way_title}</span>
                    </div>
                    <p className="text-sm text-foreground">{item.our_way_description}</p>
                  </div>
                  
                  {/* Old Way */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">🚌 {item.other_way_title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.other_way_description}</p>
                  </div>
                </BentoCard>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Quote */}
        <div className="text-center">
          <BentoCard variant="default" className="inline-block px-12 py-8 max-w-3xl">
            <p className="text-xl md:text-2xl font-medium text-foreground italic mb-4">
              "Kami tidak menjual kursi bus. Kami menawarkan teman perjalanan dan cerita yang tidak akan kamu lupakan."
            </p>
            <p className="text-muted-foreground">— Tim opentrip.bpn</p>
          </BentoCard>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
