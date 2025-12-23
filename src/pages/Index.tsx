import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import PackagesSection from "@/components/sections/PackagesSection";
import GallerySection from "@/components/sections/GallerySection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactSection from "@/components/sections/ContactSection";
import { GalleryProvider, useGallery } from "@/contexts/GalleryContext";

const IndexContent = () => {
  const { hasImages, isLoading } = useGallery();

  useEffect(() => {
    document.title = "opentrip.bpn - Open Trip Jepang | Explore Japan with Us";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "opentrip.bpn - Spesialis open trip ke Jepang dari Balikpapan. Paket perjalanan Tokyo, Kyoto, Osaka, Hokkaido dengan itinerary menarik dan harga terjangkau."
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "opentrip.bpn - Spesialis open trip ke Jepang dari Balikpapan. Paket perjalanan Tokyo, Kyoto, Osaka, Hokkaido dengan itinerary menarik dan harga terjangkau.";
      document.head.appendChild(meta);
    }
  }, []);

  // Show loading screen until images are ready
  if (isLoading || !hasImages) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="relative">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              opentrip<span className="text-primary">.bpn</span>
            </h1>
            <p className="text-muted-foreground mt-2">Japan Travel Partner</p>
          </div>
          
          {/* Loading animation */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Memuat galeri...
            </p>
          </div>
        </div>
        
        {/* Japanese decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-primary/20 rounded-tl-3xl opacity-50" />
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-primary/20 rounded-br-3xl opacity-50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background japan-wave-bg seigaiha-pattern">
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <div className="sakura-float">
          <PackagesSection />
        </div>
        <GallerySection />
        <div className="asanoha-pattern">
          <TestimonialsSection />
        </div>
        <div className="kanagawa-wave">
          <ContactSection />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

const Index = () => {
  return (
    <GalleryProvider count={10}>
      <IndexContent />
    </GalleryProvider>
  );
};

export default Index;
