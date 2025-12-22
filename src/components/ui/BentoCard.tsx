import * as React from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "red" | "teal" | "glass";
  size?: "default" | "large" | "tall" | "wide";
  hover?: boolean;
}

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, variant = "default", size = "default", hover = true, children, ...props }, ref) => {
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
          "relative overflow-hidden rounded-2xl p-6 transition-all duration-500",
          variantClasses[variant],
          sizeClasses[size],
          hover && "hover:-translate-y-1 hover:shadow-xl cursor-pointer",
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
