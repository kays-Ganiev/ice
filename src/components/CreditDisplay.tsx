import { Coins, Infinity } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CreditDisplay = () => {
  const { credits, loading } = useCredits();

  if (loading) {
    return <Skeleton className="h-8 w-24" />;
  }

  if (!credits) return null;

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'water':
        return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
      case 'glacicer':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={`${getPlanColor(credits.plan)} gap-1.5 px-3 py-1`}
      >
        {credits.is_unlimited ? (
          <>
            <Infinity className="h-3.5 w-3.5" />
            <span className="font-medium">Unlimited</span>
          </>
        ) : (
          <>
            <Coins className="h-3.5 w-3.5" />
            <span className="font-medium">{credits.credits_remaining}</span>
          </>
        )}
      </Badge>
    </div>
  );
};

export default CreditDisplay;
