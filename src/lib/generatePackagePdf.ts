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

// Create styled HTML content that mirrors the dialog
const createPdfHtml = (pkg: TripPackageDetail): string => {
  const highlights = pkg.highlights || [];
  const itinerary = pkg.itinerary || [];
  const inclusions = pkg.inclusions || [];
  const exclusions = pkg.exclusions || [];

  const highlightsHtml = highlights.length 
    ? highlights.map(h => `<span style="display: inline-block; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 9999px; padding: 4px 12px; margin: 2px 4px 2px 0; font-size: 11px;">${h}</span>`).join('')
    : '';

  const itineraryHtml = itinerary.length
    ? itinerary.map((item, idx) => `
        <div style="position: relative; padding-left: 28px; padding-bottom: 16px; ${idx < itinerary.length - 1 ? 'border-left: 2px solid #e5e7eb; margin-left: 9px;' : ''}">
          <div style="position: absolute; left: -2px; top: 0; width: 20px; height: 20px; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 10px; font-weight: bold;">${item.day}</span>
          </div>
          <div style="padding-left: 8px;">
            <h4 style="font-weight: 600; color: #1f2937; margin: 0 0 8px 0; font-size: 13px;">Hari ${item.day}: ${item.title}</h4>
            <ul style="margin: 0; padding: 0; list-style: none;">
              ${item.activities.map(act => `
                <li style="display: flex; align-items: flex-start; gap: 8px; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                  <span style="color: #dc2626;">&#8226;</span>
                  <span>${act}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `).join('')
    : '';

  const inclusionsHtml = inclusions.length
    ? inclusions.map(item => `
        <li style="display: flex; align-items: flex-start; gap: 8px; font-size: 11px; color: #6b7280; margin-bottom: 6px;">
          <span style="color: #22c55e; font-weight: bold;">&#10003;</span>
          <span>${item}</span>
        </li>
      `).join('')
    : '';

  const exclusionsHtml = exclusions.length
    ? exclusions.map(item => `
        <li style="display: flex; align-items: flex-start; gap: 8px; font-size: 11px; color: #6b7280; margin-bottom: 6px;">
          <span style="color: #ef4444; font-weight: bold;">&#10007;</span>
          <span>${item}</span>
        </li>
      `).join('')
    : '';

  return `
    <div id="pdf-content" style="font-family: 'Segoe UI', Arial, sans-serif; width: 595px; background: white; padding: 0;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 24px; color: white;">
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">OpenTrip.BPN</div>
        <div style="font-size: 12px; opacity: 0.9;">Jepang Trip Specialist</div>
      </div>

      <!-- Title Section -->
      <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: inline-block; background: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 500; margin-bottom: 8px;">${pkg.destination}</div>
        <h1 style="font-size: 22px; font-weight: bold; color: #1f2937; margin: 8px 0 0 0;">${pkg.title}</h1>
      </div>

      <!-- Quick Info -->
      <div style="padding: 16px 24px; background: #f9fafb; display: flex; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280;">
          <span style="color: #dc2626;">&#9200;</span> ${pkg.duration_days} Hari
        </div>
        ${pkg.start_date ? `<div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280;"><span style="color: #dc2626;">&#128197;</span> ${formatDate(pkg.start_date)}</div>` : ''}
        ${pkg.available_seats ? `<div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280;"><span style="color: #dc2626;">&#128101;</span> ${pkg.available_seats} Seat</div>` : ''}
        ${pkg.meeting_point ? `<div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280;"><span style="color: #dc2626;">&#128205;</span> ${pkg.meeting_point}</div>` : ''}
      </div>

      <!-- Price Banner -->
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 16px 24px; color: white; text-align: center;">
        <div style="font-size: 11px; opacity: 0.9;">Mulai dari</div>
        <div style="font-size: 26px; font-weight: bold;">${formatPrice(pkg.price)}</div>
        <div style="font-size: 10px; opacity: 0.8;">*tanpa hidden cost</div>
      </div>

      <div style="padding: 24px;">
        <!-- Description -->
        ${pkg.description ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Deskripsi</h3>
            <p style="font-size: 11px; color: #6b7280; line-height: 1.6; margin: 0;">${pkg.description}</p>
          </div>
        ` : ''}

        <!-- Target Participants -->
        ${pkg.target_participants ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Target Peserta</h3>
            <p style="font-size: 11px; color: #6b7280; margin: 0;">${pkg.target_participants}</p>
          </div>
        ` : ''}

        <!-- Highlights -->
        ${highlights.length ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Highlight</h3>
            <div>${highlightsHtml}</div>
          </div>
        ` : ''}

        <!-- Itinerary -->
        ${itinerary.length ? `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Itinerary</h3>
            ${itineraryHtml}
          </div>
        ` : ''}

        <!-- Inclusions & Exclusions -->
        <div style="display: flex; gap: 24px; margin-bottom: 20px;">
          ${inclusions.length ? `
            <div style="flex: 1;">
              <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px;">
                <span style="color: #22c55e;">&#10003;</span> Termasuk
              </h3>
              <ul style="margin: 0; padding: 0; list-style: none;">${inclusionsHtml}</ul>
            </div>
          ` : ''}
          ${exclusions.length ? `
            <div style="flex: 1;">
              <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px;">
                <span style="color: #ef4444;">&#10007;</span> Tidak Termasuk
              </h3>
              <ul style="margin: 0; padding: 0; list-style: none;">${exclusionsHtml}</ul>
            </div>
          ` : ''}
        </div>

        <!-- Pricing Breakdown -->
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">&#128176; Breakdown Harga (Transparan)</h3>
          <div style="display: flex; justify-content: space-between; font-size: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; margin-bottom: 8px;">
            <span style="color: #6b7280;">Harga Paket</span>
            <span style="font-weight: 600; color: #1f2937;">${formatPrice(pkg.price)}</span>
          </div>
          <div style="font-size: 11px; color: #6b7280;">
            <p style="margin: 0 0 6px 0; font-weight: 500; color: #1f2937;">Estimasi Pengeluaran Tambahan:</p>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span>&#8226; Makan siang/malam</span>
              <span>~&#165;800-2,500/meal</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>&#8226; Belanja/Souvenir</span>
              <span>Sesuai budget</span>
            </div>
          </div>
          <div style="margin-top: 12px; padding: 10px; background: #fef2f2; border-radius: 8px; font-size: 11px; color: #dc2626;">
            <strong>&#128161; Tips:</strong> Siapkan budget &#177;&#165;5,000 untuk pengeluaran pribadi
          </div>
        </div>

        <!-- Payment Info -->
        <div style="background: #dcfce7; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <p style="font-size: 13px; font-weight: 600; color: #166534; margin: 0 0 8px 0;">&#128179; Sistem Pembayaran</p>
          <ul style="margin: 0; padding: 0; list-style: none; font-size: 11px; color: #6b7280;">
            <li style="margin-bottom: 4px;">&#8226; DP 30% untuk booking slot - DP hangus jika cancel</li>
            <li>&#8226; Pelunasan 3 bulan sebelum keberangkatan</li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f3f4f6; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 13px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Tertarik dengan paket ini?</p>
        <p style="font-size: 12px; color: #dc2626; margin: 0;">
          WhatsApp: +62 823-5012-5334 | Instagram: @opentrip.bpn
        </p>
      </div>
    </div>
  `;
};

export const generatePackagePdf = async (pkg: TripPackageDetail): Promise<void> => {
  const html2canvas = (await import('html2canvas')).default;
  
  // Create container for rendering
  const container = document.createElement('div');
  container.innerHTML = createPdfHtml(pkg);
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  const content = container.querySelector('#pdf-content') as HTMLElement;
  
  try {
    // Render to canvas with high quality
    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const doc = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF (possibly multiple pages)
    const imgData = canvas.toDataURL('image/png', 1.0);
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    const filename = `${pkg.title.replace(/[^a-zA-Z0-9]/g, '_')}_OpenTripBPN.pdf`;
    doc.save(filename);
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
};
