import { ChevronDown, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/BentoCard";
import { useGalleryImages } from "@/hooks/useGalleryImages";
const HeroSection = () => {
  const {
    getImage
  } = useGalleryImages(5);
  const scrollToPackages = () => {
    const element = document.querySelector("#packages");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  const openWhatsApp = () => {
    window.open("https://wa.me/6282350125334?text=Halo%20opentrip.bpn%2C%20saya%20tertarik%20dengan%20paket%20trip%20ke%20Jepang", "_blank");
  };
  const heroImage = getImage(0);
  const tokyoImage = getImage(1);
  const kyotoImage = getImage(2);
  return <section id="home" className="relative min-h-screen pt-20 pb-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pattern-overlay" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
          {/* Main Hero Card - Large */}
          <BentoCard variant="default" size="large" className="relative overflow-hidden min-h-[400px] lg:min-h-[500px] animate-fade-up" hover={true} hoverEffect="zoom">
            {heroImage && <img src={heroImage} alt="Mount Fuji with cherry blossoms" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="eager" />}
            <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/80 via-card-foreground/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-bento-cream mb-3 leading-tight">
                Jelajahi
                <br />
                <span className="text-primary-foreground">Keindahan Jepang</span>
              </h1>
              <p className="text-bento-cream/90 text-base md:text-lg mb-6 max-w-md">
                Open trip eksklusif dengan pengalaman tak terlupakan bersama opentrip.bpn
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="bento" size="lg" onClick={scrollToPackages}>
                  Lihat Paket Trip
                </Button>
                <Button variant="heroOutline" size="lg" onClick={openWhatsApp}>
                  Hubungi Kami
                </Button>
              </div>
            </div>
          </BentoCard>

          {/* Stats Card - Red Accent */}
          <BentoCard variant="red" className="flex flex-col justify-between animate-fade-up delay-100" hoverEffect="lift">
            <div className="transition-all duration-300 group-hover:translate-x-1">
              <span className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider transition-all duration-300 group-hover:text-primary-foreground group-hover:tracking-widest">
                Pengalaman
              </span>
              <div className="mt-4 transition-all duration-500 group-hover:scale-105 origin-left">
                <span className="text-5xl md:text-6xl font-bold transition-all duration-300 group-hover:text-primary-foreground group-hover:drop-shadow-lg">2+</span>
                <p className="text-primary-foreground/90 mt-2 transition-all duration-300 group-hover:text-primary-foreground">Trip telah dilaksanakan (2026 akan ada 3-4 Trip)</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-primary-foreground/80 transition-all duration-300 group-hover:text-primary-foreground group-hover:translate-x-2 group-hover:gap-3">
              <Users className="w-5 h-5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
              <span className="text-sm transition-all duration-300 group-hover:font-medium">7+ peserta puas</span>
            </div>
          </BentoCard>

          {/* Tokyo Preview Card */}
          <BentoCard variant="default" className="relative overflow-hidden min-h-[200px] animate-fade-up delay-200" hover={true} hoverEffect="tilt">
            {tokyoImage && <img src={tokyoImage} alt="Gallery preview" className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-2" loading="eager" />}
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
            <span className="text-4xl md:text-5xl font-bold mb-2">opentrip</span>
            <span className="text-2xl md:text-3xl font-light">.bpn</span>
            <p className="text-bento-cream/70 mt-4 text-sm">Your Japan Travel Partner</p>
          </BentoCard>

          {/* Kyoto Preview Card - Tall */}
          <BentoCard variant="default" size="tall" className="relative overflow-hidden min-h-[200px] animate-fade-up delay-400" hover={true} hoverEffect="float">
            {kyotoImage && <img src={kyotoImage} alt="Gallery preview" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="eager" />}
            <div className="absolute inset-0 bg-gradient-to-t from-card-foreground/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 text-bento-cream mb-2">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">Kyoto</span>
              </div>
              <p className="text-bento-cream/80 text-sm">Temple & Tradisi</p>
            </div>
          </BentoCard>

          {/* Schedule Card */}
          <BentoCard variant="glass" className="flex flex-col justify-between animate-fade-up delay-500" hoverEffect="pulse">
            <div className="flex items-center gap-3 text-foreground/70 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Next Trip</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl md:text-4xl font-bold text-foreground">MAR</span>
              <p className="text-lg text-foreground/90">2026</p>
            </div>
            <div className="mt-4 py-2 px-3 rounded-xl bg-primary/20 text-primary text-sm font-medium inline-block">
              Slot Terbatas (Hanya 8 pax)
            </div>
          </BentoCard>

          {/* CTA Card */}
          <BentoCard variant="default" className="flex flex-col justify-center items-center text-center animate-fade-up delay-600" hoverEffect="lift">
            <p className="text-card-foreground/80 text-sm mb-3">Siap untuk petualangan?</p>
            <p className="text-xl font-bold text-card-foreground mb-4">Mulai dari</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary">IDR 17jt</span>
              <span className="text-lg text-primary">juta</span>
            </div>
            <p className="text-card-foreground/60 text-xs mt-2">*per orang</p>
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
    </section>;
};
export default HeroSection;