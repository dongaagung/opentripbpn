import { cn } from "@/lib/utils";
import { Clock, Zap, AlertCircle } from "lucide-react";

interface PriceTierBadgeProps {
  currentPrice: number;
  earlyBirdPrice?: number | null;
  regularPrice?: number | null;
  lastCallPrice?: number | null;
  earlyBirdDeadline?: string | null;
  earlyBirdSeats?: number | null;
  bookedSeats?: number;
  lastCallStartDate?: string | null;
  className?: string;
  showCountdown?: boolean;
}

const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} Juta`;
  }
  return price.toLocaleString("id-ID");
};

const PriceTierBadge = ({
  currentPrice,
  earlyBirdPrice,
  regularPrice,
  lastCallPrice,
  earlyBirdDeadline,
  earlyBirdSeats = 10,
  bookedSeats = 0,
  lastCallStartDate,
  className,
  showCountdown = true,
}: PriceTierBadgeProps) => {
  const now = new Date();
  
  // Determine current tier
  const getCurrentTier = () => {
    // Early Bird: if deadline not passed AND seats still available
    if (earlyBirdPrice && earlyBirdDeadline) {
      const deadline = new Date(earlyBirdDeadline);
      if (now < deadline && bookedSeats < (earlyBirdSeats || 10)) {
        return {
          tier: "early_bird",
          label: "Early Bird",
          icon: Zap,
          price: earlyBirdPrice,
          originalPrice: regularPrice || currentPrice,
          color: "bg-emerald-500",
          textColor: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          deadline,
        };
      }
    }
    
    // Last Call: if start date passed
    if (lastCallPrice && lastCallStartDate) {
      const startDate = new Date(lastCallStartDate);
      if (now >= startDate) {
        return {
          tier: "last_call",
          label: "Last Call",
          icon: AlertCircle,
          price: lastCallPrice,
          originalPrice: regularPrice || currentPrice,
          color: "bg-destructive",
          textColor: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/30",
          deadline: null,
        };
      }
    }
    
    // Regular price
    return {
      tier: "regular",
      label: "Regular",
      icon: Clock,
      price: regularPrice || currentPrice,
      originalPrice: null,
      color: "bg-primary",
      textColor: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
      deadline: earlyBirdDeadline ? new Date(earlyBirdDeadline) : null,
    };
  };
  
  const tier = getCurrentTier();
  const Icon = tier.icon;
  
  // Calculate countdown
  const getCountdown = () => {
    if (!tier.deadline || tier.tier !== "early_bird") return null;
    
    const diff = tier.deadline.getTime() - now.getTime();
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} hari lagi`;
    if (hours > 0) return `${hours} jam lagi`;
    return "Segera berakhir!";
  };
  
  const countdown = getCountdown();
  const savings = tier.originalPrice && tier.price < tier.originalPrice 
    ? tier.originalPrice - tier.price 
    : null;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Tier Badge */}
      <div className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
        tier.bgColor,
        tier.borderColor
      )}>
        <Icon className={cn("w-4 h-4", tier.textColor)} />
        <span className={cn("text-sm font-bold", tier.textColor)}>{tier.label}</span>
        {countdown && showCountdown && (
          <span className="text-xs text-muted-foreground ml-1">• {countdown}</span>
        )}
      </div>
      
      {/* Price Display */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">
          IDR {formatPrice(tier.price)}
        </span>
        {tier.originalPrice && tier.price < tier.originalPrice && (
          <span className="text-sm text-muted-foreground line-through">
            IDR {formatPrice(tier.originalPrice)}
          </span>
        )}
      </div>
      
      {/* Savings Badge */}
      {savings && savings > 0 && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-full">
          <span className="text-xs font-medium text-emerald-600">
            Hemat IDR {formatPrice(savings)}
          </span>
        </div>
      )}
    </div>
  );
};

export default PriceTierBadge;
