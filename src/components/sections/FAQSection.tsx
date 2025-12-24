import { MessageCircleQuestion } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
  category: "safety" | "cost" | "experience" | "logistics";
}

const faqs: FAQItem[] = [
  {
    question: "Aman nggak sih ikut open trip sama orang yang nggak dikenal?",
    answer: "Sangat aman! Grup kami maksimal 8 orang, jadi kamu akan cepat kenal satu sama lain. Kebanyakan peserta kami adalah profesional muda (25-35 tahun) yang solo traveling atau bersama teman. Kami juga ada WhatsApp grup sebelum keberangkatan supaya sudah saling kenal. Plus, trip leader kami selalu standby 24/7 selama perjalanan.",
    category: "safety",
  },
  {
    question: "Saya tidak bisa bahasa Jepang, apakah akan kesulitan?",
    answer: "Tidak perlu khawatir! Trip leader kami fasih berbahasa Jepang dan Inggris. Selain itu, di kota-kota besar Jepang, signage dan informasi sudah tersedia dalam bahasa Inggris. Kami juga menyediakan tips & phrase card bahasa Jepang dasar yang berguna.",
    category: "logistics",
  },
  {
    question: "Apakah ada biaya tambahan yang tidak tertulis?",
    answer: "Tidak ada hidden cost! Semua biaya yang termasuk dan tidak termasuk sudah kami tulis dengan jelas di setiap paket. Yang biasanya tidak termasuk adalah: makan siang (karena kami ingin kamu bebas eksplor kuliner), tiket masuk tempat wisata tertentu, dan belanja pribadi. Estimasi pengeluaran harian juga kami berikan.",
    category: "cost",
  },
  {
    question: "Kalau saya butuh waktu sendiri untuk eksplor, bisa?",
    answer: "Tentu! Itinerary kami dirancang dengan free time di setiap harinya. Mau eksplor sendiri, shopping, atau sekadar duduk di cafe? Silakan! Kami hanya akan mengumpulkan peserta di waktu-waktu tertentu untuk aktivitas bersama.",
    category: "experience",
  },
  {
    question: "Gimana kalau saya punya dietary restriction atau alergi?",
    answer: "Infokan saja saat pendaftaran, dan kami akan membantu menyesuaikan. Jepang cukup ramah untuk berbagai dietary needs, termasuk halal, vegetarian, dan alergi umum. Kami akan guide kamu ke restoran yang tepat.",
    category: "logistics",
  },
  {
    question: "Apa perbedaan open trip dengan paket tour travel konvensional?",
    answer: "Perbedaan utama ada di ukuran grup (kami max 8 vs tour bus 20-40 orang), fleksibilitas itinerary, dan gaya perjalanan. Kami menggunakan transportasi publik supaya kamu merasakan kehidupan lokal, bukan hanya naik-turun bus wisata. Pengalaman lebih personal dan intimate!",
    category: "experience",
  },
  {
    question: "Apakah harga termasuk tiket pesawat?",
    answer: "Tergantung paket yang dipilih. Beberapa paket sudah termasuk tiket pesawat PP dari Jakarta/Surabaya, beberapa paket land arrangement only (tanpa pesawat). Cek detail di setiap paket, atau hubungi kami untuk info lebih lanjut.",
    category: "cost",
  },
  {
    question: "Bagaimana sistem pembayaran dan apakah bisa cicil?",
    answer: "Kami menerima pembayaran via transfer bank dan bisa dicicil! Down payment 30% untuk booking slot, kemudian pelunasan 1 bulan sebelum keberangkatan. Kami juga bisa bantu dengan jadwal cicilan yang lebih fleksibel, hubungi kami untuk diskusi.",
    category: "cost",
  },
];

const getCategoryColor = (category: FAQItem["category"]) => {
  switch (category) {
    case "safety":
      return "bg-green-500/10 text-green-600 dark:text-green-400";
    case "cost":
      return "bg-primary/10 text-primary";
    case "experience":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "logistics":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
};

const getCategoryLabel = (category: FAQItem["category"]) => {
  switch (category) {
    case "safety":
      return "Keamanan";
    case "cost":
      return "Biaya";
    case "experience":
      return "Pengalaman";
    case "logistics":
      return "Logistik";
  }
};

const FAQSection = () => {
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
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`faq-${idx}`}
                    className="border border-border rounded-xl px-4 data-[state=open]:bg-muted/30 transition-colors"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-start gap-3 text-left">
                        <span className={`shrink-0 px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(faq.category)}`}>
                          {getCategoryLabel(faq.category)}
                        </span>
                        <span className="font-semibold text-foreground">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 pl-[76px] text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
