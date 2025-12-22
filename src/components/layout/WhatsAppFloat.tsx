import { MessageCircle } from "lucide-react";

const WhatsAppFloat = () => {
  const handleClick = () => {
    window.open(
      "https://wa.me/6282350125334?text=Halo%20opentrip.bpn%2C%20saya%20tertarik%20dengan%20paket%20trip%20ke%20Jepang",
      "_blank"
    );
  };

  return (
    <button
      onClick={handleClick}
      className="whatsapp-float group"
      aria-label="Chat via WhatsApp"
    >
      <MessageCircle className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
      
      {/* Tooltip */}
      <div className="absolute right-full mr-4 px-4 py-2 bg-card text-card-foreground rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg text-sm font-medium">
        Chat WhatsApp
      </div>
      
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
    </button>
  );
};

export default WhatsAppFloat;
