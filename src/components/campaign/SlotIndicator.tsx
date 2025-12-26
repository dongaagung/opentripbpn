import { cn } from "@/lib/utils";

interface SlotIndicatorProps {
  totalSeats: number;
  bookedSeats: number;
  className?: string;
  compact?: boolean;
}

const SlotIndicator = ({ totalSeats, bookedSeats, className, compact = false }: SlotIndicatorProps) => {
  const availableSeats = Math.max(0, totalSeats - bookedSeats);
  const percentFilled = Math.min(100, (bookedSeats / totalSeats) * 100);
  
  // Determine status
  const getStatus = () => {
    if (availableSeats === 0) return { label: "Full Booked", color: "bg-destructive", textColor: "text-destructive" };
    if (availableSeats <= 3) return { label: "Almost Full", color: "bg-amber-500", textColor: "text-amber-500" };
    return { label: "Available", color: "bg-emerald-500", textColor: "text-emerald-500" };
  };
  
  const status = getStatus();

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className={cn("w-2 h-2 rounded-full animate-pulse", status.color)} />
        <span className={cn("text-xs font-medium", status.textColor)}>
          {availableSeats === 0 ? "Full" : `${availableSeats} seat tersisa`}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full animate-pulse", status.color)} />
          <span className={cn("text-sm font-semibold", status.textColor)}>{status.label}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{availableSeats}</span> dari {totalSeats} seat
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 ease-out rounded-full", status.color)}
          style={{ width: `${percentFilled}%` }}
        />
      </div>
    </div>
  );
};

export default SlotIndicator;
