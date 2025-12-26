import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Map, Users, Shield, Award, Star, Check } from "lucide-react";

interface TrustProof {
  id: string;
  proof_type: string;
  label: string;
  value: string;
  icon: string | null;
  display_order: number;
}

interface TrustBadgesProps {
  className?: string;
  variant?: "horizontal" | "vertical" | "compact";
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Map,
  Users,
  Shield,
  Award,
  Star,
  Check,
};

const TrustBadges = ({ className, variant = "horizontal" }: TrustBadgesProps) => {
  const [proofs, setProofs] = useState<TrustProof[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const { data, error } = await supabase
          .from("trust_proofs")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        setProofs(data || []);
      } catch (error) {
        console.error("Error fetching trust proofs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProofs();
  }, []);

  if (isLoading || proofs.length === 0) return null;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-4 flex-wrap", className)}>
        {proofs.map((proof) => {
          const Icon = iconMap[proof.icon || "Check"] || Check;
          return (
            <div
              key={proof.id}
              className="flex items-center gap-1.5 text-sm"
            >
              <Icon className="w-4 h-4 text-primary" />
              <span className="font-bold text-foreground">{proof.value}</span>
              <span className="text-muted-foreground">{proof.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={cn("space-y-3", className)}>
        {proofs.map((proof) => {
          const Icon = iconMap[proof.icon || "Check"] || Check;
          return (
            <div
              key={proof.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{proof.value}</div>
                <div className="text-sm text-muted-foreground">{proof.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal (default)
  return (
    <div className={cn("flex items-center justify-center gap-6 flex-wrap", className)}>
      {proofs.map((proof, index) => {
        const Icon = iconMap[proof.icon || "Check"] || Check;
        return (
          <div key={proof.id} className="flex items-center gap-2">
            {index > 0 && <div className="w-px h-8 bg-border hidden md:block" />}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card/50 backdrop-blur border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-foreground">{proof.value}</div>
                <div className="text-xs text-muted-foreground">{proof.label}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrustBadges;
