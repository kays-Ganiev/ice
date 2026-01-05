import { Snowflake } from "lucide-react";

const IceLogo = () => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative">
        {/* Animated glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-chart-2 blur-xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300 animate-pulse" />
        
        {/* Icon container */}
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
          <Snowflake className="h-7 w-7 text-primary-foreground" strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          Ice
        </span>
        <span className="text-[10px] text-muted-foreground -mt-1 tracking-wide uppercase">
          Website Generator
        </span>
      </div>
    </div>
  );
};

export default IceLogo;
