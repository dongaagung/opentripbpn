import { Users, MapPin, Camera, Heart, Clock, Wallet, User, Compass } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";

interface ComparisonItem {
  aspect: string;
  ourWay: string;
  oldWay: string;
  icon: React.ReactNode;
}

const comparisons: ComparisonItem[] = [
  {
    aspect: "Pengalaman",
    ourWay: "Jalan kaki eksplor hidden gems, kuliner lokal, interaksi dengan warga",
    oldWay: "Turun dari bus → foto → naik bus → repeat",
    icon: <Compass className="w-6 h-6" />,
  },
  {
    aspect: "Ukuran Grup",
    ourWay: "Maksimal 8 orang, intimate & fleksibel",
    oldWay: "20-40 orang per bus, tidak personal",
    icon: <Users className="w-6 h-6" />,
  },
  {
    aspect: "Itinerary",
    ourWay: "Fleksibel, bisa request tambahan destinasi",
    oldWay: "Fixed, tidak bisa diubah",
    icon: <MapPin className="w-6 h-6" />,
  },
  {
    aspect: "Transportasi",
    ourWay: "Public transport + walking = authentic experience",
    oldWay: "Private bus, tidak merasakan kehidupan lokal",
    icon: <Clock className="w-6 h-6" />,
  },
  {
    aspect: "Hidden Cost",
    ourWay: "Transparan, semua tertera jelas",
    oldWay: "Banyak biaya tambahan mendadak",
    icon: <Wallet className="w-6 h-6" />,
  },
  {
    aspect: "Trip Leader",
    ourWay: "Ikut serta, berbagi cerita & tips",
    oldWay: "Tour guide formal, baca script",
    icon: <User className="w-6 h-6" />,
  },
];

const WhyUsSection = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisons.map((item, idx) => (
              <BentoCard key={idx} variant="glass" className="p-6" hoverEffect="lift">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-foreground">{item.aspect}</h4>
                </div>
                
                {/* Our Way */}
                <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">🚶 Cara Kami</span>
                  </div>
                  <p className="text-sm text-foreground">{item.ourWay}</p>
                </div>
                
                {/* Old Way */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">🚌 Cara Lama</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.oldWay}</p>
                </div>
              </BentoCard>
            ))}
          </div>
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
