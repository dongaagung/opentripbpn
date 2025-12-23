// WhatsApp utility functions
export const WHATSAPP_NUMBER = "6282350125334";

export const openWhatsApp = (message?: string) => {
  const defaultMsg = "Halo opentrip.bpn, saya tertarik dengan paket trip ke Jepang";
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message || defaultMsg)}`;
  window.open(url, "_blank");
};

export const getWhatsAppUrl = (message?: string) => {
  const defaultMsg = "Halo opentrip.bpn, saya tertarik dengan paket trip ke Jepang";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message || defaultMsg)}`;
};
