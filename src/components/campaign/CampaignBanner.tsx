import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Clock, Zap, Users, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: string;
  name: string;
  campaign_type: string;
  title: string;
  description: string | null;
  copywriting: string | null;
  discount_type: string | null;
  discount_value: number | null;
  start_date: string | null;
  end_date: string | null;
  badge_text: string | null;
  badge_color: string | null;
  priority: number;
}

interface CampaignBannerProps {
  className?: string;
  packageId?: string;
  onAction?: () => void;
}

const campaignIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  flash: Zap,
  group_deal: Users,
  referral: Gift,
  seasonal: Sparkles,
  addon: Gift,
};

const CampaignBanner = ({ className, packageId, onAction }: CampaignBannerProps) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const now = new Date().toISOString();
        
        let query = supabase
          .from("campaigns")
          .select("*")
          .eq("is_active", true)
          .or(`start_date.is.null,start_date.lte.${now}`)
          .or(`end_date.is.null,end_date.gte.${now}`)
          .order("priority", { ascending: false })
          .limit(1);

        const { data, error } = await query;

        if (error) throw error;
        if (data && data.length > 0) {
          setCampaign(data[0]);
        }
      } catch (error) {
        console.error("Error fetching campaign:", error);
      }
    };

    fetchCampaign();
  }, [packageId]);

  // Countdown timer
  useEffect(() => {
    if (!campaign?.end_date) return;

    const updateCountdown = () => {
      const end = new Date(campaign.end_date!);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days}h ${hours}j ${minutes}m`);
      } else if (hours > 0) {
        setCountdown(`${hours}j ${minutes}m ${seconds}d`);
      } else {
        setCountdown(`${minutes}m ${seconds}d`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [campaign?.end_date]);

  if (!campaign) return null;

  const Icon = campaignIcons[campaign.campaign_type] || Sparkles;
  const isFlash = campaign.campaign_type === "flash";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 md:p-6",
        isFlash 
          ? "bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground" 
          : "bg-gradient-to-r from-bento-teal via-bento-teal/90 to-bento-teal/80 text-bento-cream",
        className
      )}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[length:20px_20px]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            {campaign.badge_text && (
              <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur rounded-full text-xs font-bold mb-2">
                {campaign.badge_text}
              </span>
            )}
            <h3 className="text-lg md:text-xl font-bold">{campaign.title}</h3>
            {campaign.copywriting && (
              <p className="text-sm opacity-90 mt-1">{campaign.copywriting}</p>
            )}
            {campaign.discount_value && campaign.discount_type && (
              <p className="text-sm font-medium mt-1">
                {campaign.discount_type === "percentage" 
                  ? `Hemat ${campaign.discount_value}%` 
                  : `Hemat IDR ${campaign.discount_value.toLocaleString("id-ID")}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {countdown && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-xl">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold text-sm">{countdown}</span>
            </div>
          )}
          {onAction && (
            <Button 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90 w-full md:w-auto"
              onClick={onAction}
            >
              Claim Sekarang
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignBanner;
