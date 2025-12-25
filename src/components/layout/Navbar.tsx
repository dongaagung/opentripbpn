import { useState, useEffect } from "react";
import { Menu, X, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { openWhatsApp } from "@/lib/whatsapp";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#why-us", label: "Kenapa Kami?" },
    { href: "#packages", label: "Paket Trip" },
    { href: "#gallery", label: "Galeri" },
    { href: "#testimonials", label: "Testimoni" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Kontak" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile menu */}
      <div 
        className={`fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />
      
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || isOpen
            ? "bg-background/95 backdrop-blur-xl shadow-lg border-b border-border/50"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#home");
              }}
              className="flex items-center gap-2 md:gap-3 group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Plane className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-foreground">opentrip.bpn</span>
                <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Explore Japan</span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="text-foreground/80 hover:text-primary font-medium transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Theme Toggle & CTA Button */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <Button variant="hero" onClick={() => openWhatsApp()}>
                Hubungi Kami
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  isOpen 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "bg-card/80 text-foreground border border-border hover:bg-primary/10 hover:border-primary/50"
                }`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                <div className="relative w-5 h-5">
                  <Menu className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${isOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
                  <X className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Full Screen Slide */}
          <div
            className={`md:hidden fixed left-0 right-0 bg-background/98 backdrop-blur-xl border-t border-border transition-all duration-500 ease-out ${
              isOpen 
                ? "top-16 bottom-0 opacity-100" 
                : "top-16 bottom-full opacity-0 pointer-events-none"
            }`}
            style={{ maxHeight: isOpen ? 'calc(100vh - 4rem)' : '0' }}
          >
            <div className="container mx-auto px-4 py-6 h-full overflow-y-auto">
              <div className="space-y-2">
                {navLinks.map((link, index) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="flex items-center gap-4 py-4 px-4 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary font-medium transition-all duration-300 border border-transparent hover:border-primary/20"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
                      transition: `all 0.3s ease ${index * 50}ms`
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-primary/40" />
                    {link.label}
                  </a>
                ))}
              </div>
              
              {/* Mobile CTA */}
              <div className="mt-8 pt-6 border-t border-border">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full py-6 text-lg"
                  onClick={() => openWhatsApp()}
                >
                  💬 Hubungi Kami via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
