import { Plane, Instagram, Video, MessageCircle } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "Paket Trip", href: "#packages" },
    { label: "Galeri", href: "#gallery" },
    { label: "Testimoni", href: "#testimonials" },
    { label: "Kontak", href: "#contact" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-muted/50 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Plane className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">opentrip.bpn</span>
                <p className="text-xs text-muted-foreground">Your Japan Travel Partner</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Kami membantu Anda mewujudkan impian trip ke Jepang dengan pengalaman yang tak terlupakan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/opentrip.bpn"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-bento-cream/10 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com/@opentrip.bpn"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-bento-cream/10 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Video className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/6282350125334"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-bento-cream/10 flex items-center justify-center text-foreground hover:bg-[#25D366] hover:text-white transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} opentrip.bpn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
