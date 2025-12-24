import jsPDF from 'jspdf';

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
  highlights: string[] | null;
  description: string | null;
  itinerary: ItineraryItem[] | null;
  target_participants: string | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  meeting_point: string | null;
  departure_time: string | null;
  start_date: string | null;
  available_seats: number | null;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const generatePackagePdf = (pkg: TripPackageDetail): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 15;

  const primaryColor: [number, number, number] = [220, 38, 38];
  const textColor: [number, number, number] = [30, 30, 30];
  const mutedColor: [number, number, number] = [100, 100, 100];
  const greenColor: [number, number, number] = [34, 197, 94];
  const redColor: [number, number, number] = [239, 68, 68];

  const checkPageBreak = (requiredSpace: number): void => {
    if (yPos + requiredSpace > 280) {
      doc.addPage();
      yPos = 15;
    }
  };

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('OpenTrip.BPN', margin, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Jepang Trip Specialist', margin, 28);

  yPos = 45;

  // Package Title
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(pkg.title, contentWidth);
  doc.text(titleLines, margin, yPos);
  yPos += (titleLines.length * 8) + 5;

  // Destination & Duration
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, yPos, contentWidth, 22, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(pkg.destination, margin + 5, yPos + 9);
  doc.text(pkg.duration_days + ' Hari', margin + 5, yPos + 18);
  
  if (pkg.start_date) {
    doc.text(formatDate(pkg.start_date), margin + 70, yPos + 9);
  }
  if (pkg.available_seats) {
    doc.text(pkg.available_seats + ' Seat tersedia', margin + 70, yPos + 18);
  }
  
  yPos += 30;

  // Price
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, yPos, contentWidth, 16, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Harga: ' + formatPrice(pkg.price) + ' / orang', margin + 5, yPos + 11);
  yPos += 24;

  // Description
  if (pkg.description) {
    checkPageBreak(30);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Deskripsi', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    const descLines = doc.splitTextToSize(pkg.description, contentWidth);
    doc.text(descLines, margin, yPos);
    yPos += (descLines.length * 5) + 8;
  }

  // Target Participants
  if (pkg.target_participants) {
    checkPageBreak(20);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Target Peserta', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text(pkg.target_participants, margin, yPos);
    yPos += 10;
  }

  // Highlights
  const highlights = pkg.highlights || [];
  if (highlights.length > 0) {
    checkPageBreak(20 + highlights.length * 6);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Highlight Trip', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    highlights.forEach((highlight) => {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('*', margin, yPos);
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text(highlight, margin + 6, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  // Itinerary
  const itinerary = pkg.itinerary || [];
  if (itinerary.length > 0) {
    checkPageBreak(20);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Itinerary Perjalanan', margin, yPos);
    yPos += 8;
    
    itinerary.forEach((item) => {
      checkPageBreak(15 + item.activities.length * 5);
      
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.circle(margin + 3, yPos - 1, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(String(item.day), margin + 1.5, yPos);
      
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Hari ' + item.day + ': ' + item.title, margin + 10, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      item.activities.forEach((activity) => {
        checkPageBreak(10);
        const activityLines = doc.splitTextToSize('- ' + activity, contentWidth - 12);
        doc.text(activityLines, margin + 10, yPos);
        yPos += (activityLines.length * 4);
      });
      yPos += 4;
    });
  }

  // Inclusions
  const inclusions = pkg.inclusions || [];
  if (inclusions.length > 0) {
    checkPageBreak(20 + inclusions.length * 5);
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Termasuk dalam Paket', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    inclusions.forEach((item) => {
      const lines = doc.splitTextToSize('+ ' + item, contentWidth);
      doc.text(lines, margin, yPos);
      yPos += (lines.length * 5);
    });
    yPos += 5;
  }

  // Exclusions
  const exclusions = pkg.exclusions || [];
  if (exclusions.length > 0) {
    checkPageBreak(20 + exclusions.length * 5);
    doc.setTextColor(redColor[0], redColor[1], redColor[2]);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Tidak Termasuk', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    exclusions.forEach((item) => {
      const lines = doc.splitTextToSize('- ' + item, contentWidth);
      doc.text(lines, margin, yPos);
      yPos += (lines.length * 5);
    });
    yPos += 5;
  }

  // Meeting Point & Departure
  if (pkg.meeting_point || pkg.departure_time) {
    checkPageBreak(25);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Informasi Keberangkatan', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    
    if (pkg.meeting_point) {
      doc.text('Meeting Point: ' + pkg.meeting_point, margin, yPos);
      yPos += 5;
    }
    if (pkg.departure_time) {
      doc.text('Jam Keberangkatan: ' + pkg.departure_time.slice(0, 5), margin, yPos);
      yPos += 5;
    }
    yPos += 5;
  }

  // Payment Info
  checkPageBreak(40);
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(margin, yPos, contentWidth, 28, 3, 3, 'F');
  
  doc.setTextColor(21, 128, 61);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Sistem Pembayaran', margin + 5, yPos + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('- DP 30% untuk booking slot - DP hangus jika cancel', margin + 5, yPos + 16);
  doc.text('- Pelunasan 3 bulan sebelum keberangkatan', margin + 5, yPos + 22);
  
  yPos += 35;

  // Footer
  checkPageBreak(25);
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, contentWidth, 22, 'F');
  
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Tertarik dengan paket ini?', margin + 5, yPos + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('WhatsApp: +62 823-5012-5334 | Instagram: @opentrip.bpn', margin + 5, yPos + 16);

  // Save
  const filename = pkg.title.replace(/[^a-zA-Z0-9]/g, '_') + '_OpenTripBPN.pdf';
  doc.save(filename);
};
