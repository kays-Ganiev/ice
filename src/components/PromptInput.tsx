import { useState } from "react";
import { Sparkles, Loader2, Wand2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  onGenerate: (prompt: string, model: string) => void;
  isLoading: boolean;
}

const MODELS = [
  { id: "qwen2.5-coder:7b", label: "Qwen2.5 Coder 7B (fastest + best for code)" },
  { id: "qwen2.5:7b", label: "Qwen2.5 7B (fast)" },
  { id: "qwen2.5:14b", label: "Qwen2.5 14B (better, slower)" },
  { id: "qwen2.5-coder:14b", label: "Qwen2.5 Coder 14B (best quality, slower)" },
  { id: "deepseek-r1:14b", label: "DeepSeek-R1 14B (reasoning, slow)" },
];


const PromptInput = ({ onGenerate, isLoading }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [model, setModel] = useState("qwen2.5:14b");


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim(), model);
    }
  };

  const examplePrompts = [
    "Portfolio for a photographer",
    "SaaS landing page",
    "Coffee shop website",
    "Tech blog",
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative group">
        <div
          className={`absolute -inset-1 bg-gradient-to-r from-primary via-chart-2 to-chart-1 rounded-2xl blur-lg transition-all duration-500 ${isFocused ? "opacity-75" : "opacity-40 group-hover:opacity-60"
            }`}
        />

        <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-border/30 bg-popover/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2">
                <Wand2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Describe your website</h3>
                <p className="text-xs text-muted-foreground">Pick a model (free via Ollama)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Model</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isLoading}
                className="h-9 rounded-md bg-background/40 border border-border/40 px-3 text-sm text-foreground focus:outline-none"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Textarea */}
          <div className="p-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="A modern landing page for a fitness app with dark theme, hero section with gradient background, features grid, testimonials, and pricing section..."
              className="min-h-[160px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted text-base leading-relaxed"
              disabled={isLoading}
            />
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-5 py-4 border-t border-border/30 bg-popover/20">
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1.5 text-xs rounded-full bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-all duration-200 border border-border/30 hover:border-border/50"
                >
                  {example}
                </button>
              ))}
            </div>

            <Button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              size="lg"
              className="gap-2 px-8 font-semibold bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Press <kbd className="px-2 py-1 rounded bg-secondary/30 font-mono text-xs mx-1">Ctrl</kbd> +
        <kbd className="px-2 py-1 rounded bg-secondary/30 font-mono text-xs mx-1">Enter</kbd> to generate
      </p>
    </form>
  );
};

export default PromptInput;
