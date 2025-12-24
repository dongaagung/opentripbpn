import { useState, useEffect } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setFaqs(data);
      }
      setLoading(false);
    };

    fetchFAQs();
  }, []);

  return (
    <section id="faq" className="py-20 relative">
      <div className="absolute inset-0 pattern-overlay opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Pertanyaan yang Sering Ditanyakan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Jawaban untuk kekhawatiran yang mungkin ada di benakmu.
            Masih ada pertanyaan? Langsung chat kami!
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main FAQ Accordion */}
          <div className="lg:col-span-2">
            <BentoCard variant="default" className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : faqs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada FAQ tersedia.
                </p>
              ) : (
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <AccordionItem 
                      key={faq.id} 
                      value={`faq-${idx}`}
                      className="border border-border rounded-xl px-4 data-[state=open]:bg-muted/30 transition-colors"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-start gap-3 text-left">
                          <span className="shrink-0 px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">
                            Q{idx + 1}
                          </span>
                          <span className="font-semibold text-foreground">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 pl-[52px] text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </BentoCard>
          </div>

          {/* Side Cards */}
          <div className="space-y-6">
            <BentoCard variant="teal" className="p-6" hoverEffect="lift">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircleQuestion className="w-8 h-8 text-bento-cream" />
                <h3 className="font-bold text-xl text-bento-cream">Masih Ragu?</h3>
              </div>
              <p className="text-bento-cream/80 mb-4">
                Wajar kok kalau masih ada keraguan. Yuk ngobrol langsung dengan tim kami!
              </p>
              <ul className="space-y-2 text-bento-cream/90 text-sm">
                <li>✓ Response dalam 1 jam (jam kerja)</li>
                <li>✓ Bebas tanya apa saja</li>
                <li>✓ Tidak ada pressure untuk booking</li>
              </ul>
            </BentoCard>

            <BentoCard variant="glass" className="p-6" hoverEffect="glow">
              <h4 className="font-bold text-foreground mb-3">Fakta Menarik:</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎌</span>
                  <div>
                    <p className="font-semibold text-foreground">7+ Peserta Puas</p>
                    <p className="text-sm text-muted-foreground">dengan rating 4.9/5</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤝</span>
                  <div>
                    <p className="font-semibold text-foreground">2+ Trip Sukses</p>
                    <p className="text-sm text-muted-foreground">tanpa kendala berarti</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💯</span>
                  <div>
                    <p className="font-semibold text-foreground">100% Repeat Rate</p>
                    <p className="text-sm text-muted-foreground">peserta ingin ikut lagi</p>
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
