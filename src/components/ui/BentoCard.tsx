import * as React from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "red" | "teal" | "glass";
  size?: "default" | "large" | "tall" | "wide";
  hover?: boolean;
  hoverEffect?: "lift" | "tilt" | "zoom" | "glow" | "float" | "pulse" | "shimmer";
  decorative?: "sakura" | "wave" | "dots" | "lines" | "none";
}

const hoverEffectClasses = {
  lift: "hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:shadow-primary/30 hover:border-primary/20",
  tilt: "hover:rotate-1 hover:scale-[1.02] hover:shadow-[0_15px_35px_rgba(0,0,0,0.12)] hover:-translate-y-1",
  zoom: "hover:scale-[1.03] hover:shadow-[0_25px_50px_rgba(0,0,0,0.18)] hover:z-10",
  glow: "hover:shadow-[0_0_50px_rgba(220,38,38,0.5),0_0_80px_rgba(220,38,38,0.3)] hover:-translate-y-2 hover:border-primary/40",
  float: "hover:-translate-y-3 hover:translate-x-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:rotate-[0.5deg]",
  pulse: "hover:shadow-[0_0_40px_rgba(13,148,136,0.4)] hover:scale-[1.015] hover:-translate-y-1",
  shimmer: "hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(0,0,0,0.12)] hover:scale-[1.02]",
};

const DecorativeElement = ({ type, variant }: { type: string; variant: string }) => {
  const isLight = variant === "default" || variant === "glass";
  
  switch (type) {
    case "sakura":
      return (
        <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path 
              d="M20 0C20 11 29 20 40 20C29 20 20 29 20 40C20 29 11 20 0 20C11 20 20 11 20 0Z" 
              fill={isLight ? "#1a1a2e" : "#faf7f0"}
              className="animate-[spin_20s_linear_infinite]"
            />
          </svg>
        </div>
      );
    case "wave":
      return (
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 400 40" className="w-full h-full" preserveAspectRatio="none">
            <path 
              d="M0 20 Q100 0 200 20 T400 20 V40 H0 Z" 
              fill={isLight ? "#1a1a2e" : "#faf7f0"}
              className="animate-[wave_3s_ease-in-out_infinite]"
            />
          </svg>
        </div>
      );
    case "dots":
      return (
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle, ${isLight ? '#1a1a2e' : '#faf7f0'} 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
        </div>
      );
    case "lines":
      return (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none">
            {[0, 15, 30, 45, 60].map((offset) => (
              <line 
                key={offset}
                x1={offset} y1="0" x2={offset + 40} y2="100" 
                stroke={isLight ? "#1a1a2e" : "#faf7f0"} 
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>
      );
    default:
      return null;
  }
};

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    hover = true, 
    hoverEffect = "lift", 
    decorative = "none",
    children, 
    ...props 
  }, ref) => {
    const variantClasses = {
      default: "bg-bento-cream text-card-foreground",
      red: "bg-primary text-primary-foreground",
      teal: "bg-bento-teal text-bento-cream",
      glass: "bg-bento-cream/10 backdrop-blur-xl border border-bento-cream/20 text-foreground",
    };

    const sizeClasses = {
      default: "",
      large: "md:col-span-2 md:row-span-2",
      tall: "md:row-span-2",
      wide: "md:col-span-2",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-2xl p-6 transition-all duration-700 ease-out",
          variantClasses[variant],
          sizeClasses[size],
          hover && hoverEffectClasses[hoverEffect],
          hover && "cursor-pointer",
          "shadow-lg",
          hoverEffect === "shimmer" && "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-1000",
          className
        )}
        {...props}
      >
        <DecorativeElement type={decorative} variant={variant} />
        {children}
      </div>
    );
  }
);

BentoCard.displayName = "BentoCard";

export { BentoCard };
