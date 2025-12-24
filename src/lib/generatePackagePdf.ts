import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

export const generatePackagePdf = async (pkg: TripPackageDetail): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 20;

  // Colors
  const primaryColor: [number, number, number] = [220, 38, 38];
  const textColor: [number, number, number] = [30, 30, 30];
  const mutedColor: [number, number, number] = [100, 100, 100];
  const greenColor: [number, number, number] = [34, 197, 94];
  const redColor: [number, number, number] = [239, 68, 68];

  // Header with brand
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('OpenTrip.BPN', margin, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Jepang Trip Specialist', margin, 33);

  yPos = 55;

  // Package Title
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(pkg.title, contentWidth);
  doc.text(titleLines, margin, yPos);
  yPos += (titleLines.length * 10) + 5;

  // Destination & Duration Badge
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`📍 ${pkg.destination}`, margin + 10, yPos + 10);
  doc.text(`⏱️ ${pkg.duration_days} Hari`, margin + 10, yPos + 20);
  
  if (pkg.start_date) {
    doc.text(`📅 ${formatDate(pkg.start_date)}`, margin + 80, yPos + 10);
  }
  if (pkg.available_seats) {
    doc.text(`👥 ${pkg.available_seats} Seat tersedia`, margin + 80, yPos + 20);
  }
  
  yPos += 35;

  // Price Box
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Harga: ${formatPrice(pkg.price)} / orang`, margin + 10, yPos + 13);
  yPos += 30;

  // Description
  if (pkg.description) {
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Deskripsi', margin, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    const descLines = doc.splitTextToSize(pkg.description, contentWidth);
    doc.text(descLines, margin, yPos);
    yPos += (descLines.length * 5) + 10;
  }

  // Highlights
  if (pkg.highlights && pkg.highlights.length > 0) {
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Highlight Trip', margin, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    pkg.highlights.forEach((highlight) => {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('★', margin, yPos);
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text(highlight, margin + 8, yPos);
      yPos += 6;
    });
    yPos += 5;
  }

  // Check for page break
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Itinerary
  if (pkg.itinerary && pkg.itinerary.length > 0) {
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Itinerary Perjalanan', margin, yPos);
    yPos += 10;
    
    pkg.itinerary.forEach((item) => {
      // Check for page break
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      
      // Day header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.circle(margin + 3, yPos, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(String(item.day), margin + 1.5, yPos + 1);
      
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Hari ${item.day}: ${item.title}`, margin + 12, yPos + 1);
      yPos += 8;
      
      // Activities
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      item.activities.forEach((activity) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        const activityLines = doc.splitTextToSize(`• ${activity}`, contentWidth - 15);
        doc.text(activityLines, margin + 12, yPos);
        yPos += (activityLines.length * 5);
      });
      yPos += 5;
    });
  }

  // New page for inclusions/exclusions
  doc.addPage();
  yPos = 20;

  // Inclusions & Exclusions side by side concept (stacked for PDF)
  if (pkg.inclusions && pkg.inclusions.length > 0) {
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ Termasuk dalam Paket', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    pkg.inclusions.forEach((item) => {
      const lines = doc.splitTextToSize(`• ${item}`, contentWidth);
      doc.text(lines, margin, yPos);
      yPos += (lines.length * 5) + 2;
    });
    yPos += 10;
  }

  if (pkg.exclusions && pkg.exclusions.length > 0) {
    doc.setTextColor(redColor[0], redColor[1], redColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('✗ Tidak Termasuk', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    pkg.exclusions.forEach((item) => {
      const lines = doc.splitTextToSize(`• ${item}`, contentWidth);
      doc.text(lines, margin, yPos);
      yPos += (lines.length * 5) + 2;
    });
    yPos += 10;
  }

  // Meeting Point & Departure
  if (pkg.meeting_point || pkg.departure_time) {
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informasi Keberangkatan', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    
    if (pkg.meeting_point) {
      doc.text(`📍 Meeting Point: ${pkg.meeting_point}`, margin, yPos);
      yPos += 6;
    }
    if (pkg.departure_time) {
      doc.text(`🕐 Jam Keberangkatan: ${pkg.departure_time.slice(0, 5)}`, margin, yPos);
      yPos += 6;
    }
    yPos += 10;
  }

  // Payment Info Box
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');
  
  doc.setTextColor(21, 128, 61);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('💳 Sistem Pembayaran', margin + 5, yPos + 10);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('• DP 30% untuk booking slot - DP hangus jika cancel', margin + 5, yPos + 20);
  doc.text('• Pelunasan 3 bulan sebelum keberangkatan', margin + 5, yPos + 27);
  
  yPos += 45;

  // Footer Contact
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, contentWidth, 30, 'F');
  
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tertarik dengan paket ini?', margin + 5, yPos + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('WhatsApp: +62 823-5012-5334', margin + 5, yPos + 20);
  doc.text('Instagram: @opentrip.bpn', margin + 100, yPos + 20);

  // Save the PDF
  const filename = `${pkg.title.replace(/[^a-zA-Z0-9]/g, '_')}_OpenTripBPN.pdf`;
  doc.save(filename);
};
