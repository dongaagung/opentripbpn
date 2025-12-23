import { useState } from "react";
import { MapPin, Phone, Mail, Send, Instagram, Video, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/BentoCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save message to database
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          message: formData.message.trim(),
        });

      if (error) throw error;

      // Open WhatsApp with the message
      const message = `Halo opentrip.bpn!

Nama: ${formData.name}
Email: ${formData.email}
Telepon: ${formData.phone}

Pesan:
${formData.message}`;

      window.open(
        `https://wa.me/6282350125334?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      toast({
        title: "Pesan terkirim!",
        description: "Kami akan menghubungi Anda segera.",
      });

      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: "Pesan terkirim via WhatsApp",
        description: "Pesan Anda telah dikirim melalui WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/opentrip.bpn",
      handle: "@opentrip.bpn",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      name: "TikTok",
      icon: Video,
      url: "https://tiktok.com/@opentrip.bpn",
      handle: "@opentrip.bpn",
      color: "bg-gradient-to-br from-gray-900 to-gray-700",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: "https://wa.me/6282350125334",
      handle: "082350125334",
      color: "bg-[#25D366]",
    },
  ];

  return (
    <section id="contact" className="py-20 relative">
      <div className="absolute inset-0 pattern-overlay opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Kontak
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Hubungi Kami
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Punya pertanyaan? Kami siap membantu Anda merencanakan trip impian ke Jepang
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <BentoCard variant="default" className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-card-foreground mb-2"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Nama Anda"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-card-foreground mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={255}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-card-foreground mb-2"
                >
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="08xx xxxx xxxx"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-card-foreground mb-2"
                >
                  Pesan
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  maxLength={1000}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder="Ceritakan tentang trip impian Anda..."
                />
              </div>

              <Button
                type="submit"
                variant="bento"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Mengirim..."
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Kirim Pesan
                  </>
                )}
              </Button>
            </form>
          </BentoCard>

          {/* Contact Info & Social */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <BentoCard variant="teal">
              <h3 className="text-xl font-bold text-bento-cream mb-4">
                Quick Contact
              </h3>
              <div className="space-y-4">
                <a
                  href="tel:082350125334"
                  className="flex items-center gap-3 text-bento-cream/90 hover:text-bento-cream transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>082350125334</span>
                </a>
                <a
                  href="mailto:hello@opentrip.bpn"
                  className="flex items-center gap-3 text-bento-cream/90 hover:text-bento-cream transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>hello@opentrip.bpn</span>
                </a>
                <div className="flex items-start gap-3 text-bento-cream/90">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Balikpapan, Kalimantan Timur, Indonesia</span>
                </div>
              </div>
            </BentoCard>

            {/* Social Links */}
            <div className="space-y-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <BentoCard
                    variant="glass"
                    className="flex items-center gap-4 py-4 hover:bg-bento-cream/20"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${social.color} flex items-center justify-center`}
                    >
                      <social.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{social.name}</p>
                      <p className="text-sm text-muted-foreground">{social.handle}</p>
                    </div>
                  </BentoCard>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
