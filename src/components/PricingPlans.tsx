import { Check, Sparkles, Droplets, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCredits, PLANS, Plan } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface PricingPlansProps {
  onSelectPlan?: (plan: Plan) => void;
}

const PricingPlans = ({ onSelectPlan }: PricingPlansProps) => {
  const { credits } = useCredits();
  const { user } = useAuth();

  const getIcon = (planId: string) => {
    switch (planId) {
      case 'water':
        return <Droplets className="h-6 w-6" />;
      case 'glacicer':
        return <Snowflake className="h-6 w-6" />;
      default:
        return <Sparkles className="h-6 w-6" />;
    }
  };

  const getGradient = (planId: string) => {
    switch (planId) {
      case 'water':
        return 'from-chart-2 to-chart-2/80';
      case 'glacicer':
        return 'from-primary to-primary/80';
      default:
        return 'from-muted-foreground to-muted-foreground/80';
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    if (onSelectPlan) {
      onSelectPlan(plan);
    } else {
      toast({
        title: "Coming soon",
        description: "Payment integration will be available soon.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {PLANS.map((plan) => {
        const isCurrentPlan = credits?.plan === plan.id;
        const isPopular = plan.id === 'glacicer';

        return (
          <Card 
            key={plan.id}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
              isPopular ? 'border-primary shadow-primary/20 shadow-lg' : 'border-border/50'
            } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
          >
            {isPopular && (
              <div className="absolute top-0 right-0">
                <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getGradient(plan.id)} flex items-center justify-center text-primary-foreground mb-4`}>
                {getIcon(plan.id)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>
                {plan.price === 0 ? (
                  <span className="text-3xl font-bold text-foreground">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-chart-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${isPopular ? '' : 'variant-outline'}`}
                variant={isPopular ? 'default' : 'outline'}
                disabled={isCurrentPlan}
                onClick={() => handleSelectPlan(plan)}
              >
                {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Subscribe'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PricingPlans;
