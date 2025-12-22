import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import PackagesSection from "@/components/sections/PackagesSection";
import GallerySection from "@/components/sections/GallerySection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactSection from "@/components/sections/ContactSection";

const Index = () => {
  useEffect(() => {
    // Update document title
    document.title = "opentrip.bpn - Open Trip Jepang | Explore Japan with Us";
    
    // Add meta description
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <PackagesSection />
        <GallerySection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
