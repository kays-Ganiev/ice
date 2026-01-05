import { Sparkles, Zap, Globe } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="text-center mb-16 relative">
      {/* Floating badges */}
      <div className="flex justify-center gap-3 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary animate-fade-in">
          <Sparkles className="h-4 w-4" />
          AI-Powered
        </div>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chart-2/10 border border-chart-2/20 text-sm text-chart-2 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <Zap className="h-4 w-4" />
          Full-Stack
        </div>
        <div
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chart-1/10 border border-chart-1/20 text-sm text-chart-1 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <Globe className="h-4 w-4" />
          Live Preview
        </div>
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
        Generate stunning websites
        <span className="block bg-gradient-to-r from-primary via-chart-2 to-chart-1 bg-clip-text text-transparent">
          in seconds
        </span>
      </h1>

      <p
        className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        Describe your vision and watch as we build a complete React website with{" "}
        <span className="text-foreground font-medium">routes</span>,{" "}
        <span className="text-foreground font-medium">components</span>, and{" "}
        <span className="text-foreground font-medium"> AI images</span>.
      </p>

      {/* Stats */}
      <div className="flex justify-center gap-8 sm:gap-12 mt-10">
        {[
          { value: "9+", label: "Files Generated" },
          { value: "100%", label: "Customizable" },
          { value: "<2 minutes", label: "Generation Time" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="text-center animate-fade-in"
            style={{ animationDelay: `${0.3 + i * 0.1}s` }}
          >
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
