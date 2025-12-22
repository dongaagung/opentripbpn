import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  trip: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Rina Wijaya",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rina",
    rating: 5,
    text: "Pengalaman yang luar biasa! Guide sangat ramah dan itinerary-nya lengkap. Semua spot wisata yang dikunjungi amazing. Highly recommended untuk yang pertama kali ke Jepang!",
    trip: "Tokyo Explorer",
    date: "Maret 2024",
  },
  {
    id: "2",
    name: "Budi Santoso",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi",
    rating: 5,
    text: "Trip ke Kyoto-nya sangat berkesan. Kunjungan ke Fushimi Inari waktu sunrise itu magical banget. Akomodasi dan makanan juga top quality.",
    trip: "Kyoto Cultural",
    date: "Februari 2024",
  },
  {
    id: "3",
    name: "Siti Nurhaliza",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
    rating: 5,
    text: "Sudah 2x ikut trip bareng opentrip.bpn dan selalu puas! Organisasi-nya rapi, tidak ada drama, dan yang paling penting: fun! Pasti akan ikut lagi.",
    trip: "Osaka Food Tour",
    date: "Januari 2024",
  },
  {
    id: "4",
    name: "Ahmad Fauzi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
    rating: 5,
    text: "Hokkaido winter trip-nya unforgettable! Ski di Niseko, onsen di malam hari dengan pemandangan salju. Worth every penny!",
    trip: "Hokkaido Winter",
    date: "Desember 2023",
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 pattern-overlay opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Testimoni
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Kata Mereka
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pengalaman nyata dari peserta trip kami
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Featured Testimonial */}
          <div className="lg:col-span-2">
            <BentoCard variant="teal" className="h-full min-h-[350px] flex flex-col justify-between">
              <div>
                <Quote className="w-12 h-12 text-bento-cream/30 mb-4" />
                <p className="text-xl md:text-2xl text-bento-cream leading-relaxed mb-6">
                  "{testimonials[currentIndex].text}"
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    className="w-14 h-14 rounded-full bg-bento-cream"
                  />
                  <div>
                    <p className="font-bold text-bento-cream">
                      {testimonials[currentIndex].name}
                    </p>
                    <p className="text-bento-cream/70 text-sm">
                      {testimonials[currentIndex].trip} • {testimonials[currentIndex].date}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-2">
                  <button
                    onClick={goToPrev}
                    className="w-10 h-10 rounded-full bg-bento-cream/10 flex items-center justify-center text-bento-cream hover:bg-bento-cream/20 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="w-10 h-10 rounded-full bg-bento-cream/10 flex items-center justify-center text-bento-cream hover:bg-bento-cream/20 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-bento-cream w-6"
                        : "bg-bento-cream/30 hover:bg-bento-cream/50"
                    }`}
                  />
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-col gap-6">
            <BentoCard variant="default" className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">4.9</div>
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-amber-500 fill-amber-500"
                  />
                ))}
              </div>
              <p className="text-card-foreground/70 text-sm">Rating rata-rata</p>
            </BentoCard>

            <BentoCard variant="red">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary-foreground mb-2">
                  500+
                </div>
                <p className="text-primary-foreground/80">Peserta puas</p>
              </div>
            </BentoCard>

            <BentoCard variant="glass">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">
                  100%
                </div>
                <p className="text-foreground/70">Kepuasan pelanggan</p>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
