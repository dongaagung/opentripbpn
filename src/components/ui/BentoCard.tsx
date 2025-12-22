import * as React from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "red" | "teal" | "glass";
  size?: "default" | "large" | "tall" | "wide";
  hover?: boolean;
  hoverEffect?: "lift" | "tilt" | "zoom" | "glow" | "float" | "pulse";
}

const hoverEffectClasses = {
  lift: "hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20",
  tilt: "hover:rotate-1 hover:scale-[1.02] hover:shadow-xl",
  zoom: "hover:scale-[1.03] hover:shadow-2xl",
  glow: "hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:-translate-y-1",
  float: "hover:-translate-y-3 hover:translate-x-1 hover:shadow-xl",
  pulse: "hover:animate-pulse hover:shadow-xl",
};

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, variant = "default", size = "default", hover = true, hoverEffect = "lift", children, ...props }, ref) => {
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
          "relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ease-out",
          variantClasses[variant],
          sizeClasses[size],
          hover && hoverEffectClasses[hoverEffect],
          hover && "cursor-pointer",
          "shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoCard.displayName = "BentoCard";

export { BentoCard };
