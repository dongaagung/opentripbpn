import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, ImageIcon } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  trip: string;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Testimonial[] = data.map(t => ({
            id: t.id,
            name: t.customer_name,
            avatar: t.customer_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.customer_name}`,
            rating: t.rating,
            text: t.testimonial_text,
            trip: t.trip_destination || "Japan Trip",
          }));
          setTestimonials(mapped);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => prev === 0 ? testimonials.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
  };

  if (isLoading) {
    return (
      <section id="testimonials" className="py-20 relative">
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

  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Testimoni</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">Kata Mereka</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
            <p>Belum ada testimoni</p>
          </div>
        </div>
      </section>
    );
  }

  const current = testimonials[currentIndex];

  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 pattern-overlay opacity-30" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Testimoni</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">Kata Mereka</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Pengalaman nyata dari peserta trip kami</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard variant="teal" className="h-full min-h-[350px] flex flex-col justify-between">
              <div>
                <Quote className="w-12 h-12 text-bento-cream/30 mb-4" />
                <p className="text-xl md:text-2xl text-bento-cream leading-relaxed mb-6">"{current.text}"</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={current.avatar} alt={current.name} className="w-14 h-14 rounded-full bg-bento-cream" />
                  <div>
                    <p className="font-bold text-bento-cream">{current.name}</p>
                    <p className="text-bento-cream/70 text-sm">{current.trip}</p>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: current.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={goToPrev} className="w-10 h-10 rounded-full bg-bento-cream/10 flex items-center justify-center text-bento-cream hover:bg-bento-cream/20 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={goToNext} className="w-10 h-10 rounded-full bg-bento-cream/10 flex items-center justify-center text-bento-cream hover:bg-bento-cream/20 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button key={index} onClick={() => { setIsAutoPlaying(false); setCurrentIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-bento-cream w-6" : "bg-bento-cream/30 hover:bg-bento-cream/50"}`} />
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="flex flex-col gap-6">
            <BentoCard variant="default" className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">4.9</div>
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />)}
              </div>
              <p className="text-card-foreground/70 text-sm">Rating rata-rata</p>
            </BentoCard>
            <BentoCard variant="red">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary-foreground mb-2">{testimonials.length}+</div>
                <p className="text-primary-foreground/80">Peserta puas</p>
              </div>
            </BentoCard>
            <BentoCard variant="glass">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">100%</div>
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
