import { Check, Loader2, Circle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export interface GenerationStep {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "completed" | "error";
}

interface GenerationProgressProps {
  steps: GenerationStep[];
  currentStep: string;
}

const GenerationProgress = ({ steps, currentStep }: GenerationProgressProps) => {
  const completedCount = steps.filter(s => s.status === "completed").length;
  const currentIndex = steps.findIndex(s => s.status === "in-progress");
  const progress = Math.round(
    ((completedCount + (currentIndex >= 0 ? 0.5 : 0)) / steps.length) * 100
  );

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-chart-2/30 to-primary/30 rounded-2xl blur-lg opacity-60 animate-pulse" />
        <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-lg shadow-primary/30">
                <Sparkles className="h-6 w-6 text-primary-foreground animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-foreground">Generating Your Website</h3>
                <p className="text-sm text-muted-foreground">Creating something amazing...</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-secondary/30" />
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all duration-500",
                  step.status === "completed" && "bg-primary/5 border-primary/20",
                  step.status === "in-progress" && "bg-primary/10 border border-primary/30 scale-[1.02]",
                  step.status === "pending" && "bg-secondary/10 border-border/30",
                  step.status === "error" && "bg-destructive/5 border-destructive/20"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0">
                  {step.status === "completed" ? (
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  ) : step.status === "in-progress" ? (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    </div>
                  ) : step.status === "error" ? (
                    <div className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center">
                      <Circle className="h-4 w-4 text-destructive" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center">
                      <Circle className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      step.status === "completed" && "text-foreground",
                      step.status === "in-progress" && "text-primary",
                      step.status === "pending" && "text-muted-foreground",
                      step.status === "error" && "text-destructive"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.status === "in-progress" && step.id === currentStep && (
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer message */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            This usually takes 1-2 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default GenerationProgress;
