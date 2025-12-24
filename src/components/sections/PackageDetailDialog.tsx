import { 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  MapPinned,
  ArrowRight,
  Download,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generatePackagePdf } from "@/lib/generatePackagePdf";
import { toast } from "sonner";
interface ItineraryItem {
  day: number;
  title: string;
  activities: string[];
}

interface TripPackageDetail {
  id: string;
  title: string;
  destination: string;
  duration_days: number;
  price: number;
  cover_image_url: string | null;
  highlights: string[];
  description: string | null;
  itinerary: ItineraryItem[];
  target_participants: string | null;
  inclusions: string[];
  exclusions: string[];
  meeting_point: string | null;
  departure_time: string | null;
  start_date: string | null;
  available_seats: number | null;
}

interface PackageDetailDialogProps {
  pkg: TripPackageDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fallbackImage: string;
}

export function PackageDetailDialog({ 
  pkg, 
  open, 
  onOpenChange, 
  fallbackImage 
}: PackageDetailDialogProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  if (!pkg) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const bookNow = () => {
    const message = `Halo opentrip.bpn, saya tertarik dengan paket ${pkg.title} - ${pkg.destination} (${pkg.duration_days} Hari). Mohon info lebih lanjut.`;
    window.open(
      `https://wa.me/6282350125334?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePackagePdf(pkg);
      toast.success("PDF berhasil didownload!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const imageUrl = pkg.cover_image_url || fallbackImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{pkg.title}</DialogTitle>
          <DialogDescription>
            Detail paket trip {pkg.title} di {pkg.destination}. Termasuk itinerary, harga, dan informasi pembayaran.
          </DialogDescription>
        </DialogHeader>

        {/* Hero Image */}
        <div className="relative h-56 md:h-72">
          <img
            src={imageUrl}
            alt={`Detail paket trip ${pkg.title} - ${pkg.destination}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6">
            <Badge variant="secondary" className="mb-2">
              {pkg.destination}
            </Badge>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{pkg.title}</h2>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(90vh-18rem)]">
          <div className="p-6 space-y-6">
            {/* Quick Info + Download Button */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm">{pkg.duration_days} Hari</span>
                </div>
                {pkg.start_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm">{formatDate(pkg.start_date)}</span>
                  </div>
                )}
                {pkg.available_seats && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm">{pkg.available_seats} Seat</span>
                  </div>
                )}
                {pkg.meeting_point && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPinned className="w-4 h-4 text-primary" />
                    <span className="text-sm">{pkg.meeting_point}</span>
                  </div>
                )}
              </div>
              <Button
                onClick={handleDownloadPdf}
                size="sm"
                className="gap-2 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download PDF
              </Button>
            </div>

            {/* Description */}
            {pkg.description && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Deskripsi</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {pkg.description}
                </p>
              </div>
            )}

            {/* Target Participants */}
            {pkg.target_participants && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Target Peserta</h3>
                <p className="text-muted-foreground text-sm">{pkg.target_participants}</p>
              </div>
            )}

            {/* Highlights */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Highlight</h3>
                <div className="flex flex-wrap gap-2">
                  {pkg.highlights.map((highlight, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Itinerary */}
            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-4">Itinerary</h3>
                <div className="space-y-4">
                  {pkg.itinerary.map((item, idx) => (
                    <div key={idx} className="relative pl-6 pb-4 last:pb-0">
                      {/* Timeline line */}
                      {idx < pkg.itinerary.length - 1 && (
                        <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-border" />
                      )}
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">
                          {item.day}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          Hari {item.day}: {item.title}
                        </h4>
                        <ul className="mt-2 space-y-1">
                          {item.activities.map((activity, actIdx) => (
                            <li
                              key={actIdx}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-primary mt-1">•</span>
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            {((pkg.inclusions && pkg.inclusions.length > 0) || 
              (pkg.exclusions && pkg.exclusions.length > 0)) && (
              <>
                <Separator />
                <div className="grid md:grid-cols-2 gap-6">
                  {pkg.inclusions && pkg.inclusions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Termasuk
                      </h3>
                      <ul className="space-y-2">
                        {pkg.inclusions.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pkg.exclusions && pkg.exclusions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        Tidak Termasuk
                      </h3>
                      <ul className="space-y-2">
                        {pkg.exclusions.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Transparent Pricing */}
            <Separator />
            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                💰 Breakdown Harga (Transparan)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga Paket</span>
                  <span className="font-medium text-foreground">{formatPrice(pkg.price)}</span>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">Estimasi Pengeluaran Tambahan:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span>• Makan siang/malam</span>
                    <span className="text-right">~¥800-2,500/meal</span>
                    <span>• Belanja/Souvenir</span>
                    <span className="text-right">Sesuai budget</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm text-primary">
                  <strong>💡 Tips:</strong> Siapkan budget ±¥5,000 untuk pengeluaran pribadi
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-green-500/10 rounded-xl p-4 text-sm">
              <p className="font-semibold text-green-700 dark:text-green-400 mb-2">💳 Sistem Pembayaran</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• DP 30% untuk booking slot - DP hangus jika cancel</li>
                <li>• Pelunasan 3 bulan sebelum keberangkatan</li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="border-t bg-background p-4 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-muted-foreground text-sm">Mulai dari</span>
            <p className="text-xl md:text-2xl font-bold text-primary">{formatPrice(pkg.price)}</p>
            <span className="text-xs text-muted-foreground">*tanpa hidden cost</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={bookNow} size="lg" className="gap-2">
              Tanya Detail
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}