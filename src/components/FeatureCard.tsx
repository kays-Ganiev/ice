import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard = ({ icon: Icon, title, description, gradient }: FeatureCardProps) => {
  return (
    <div className="group relative">
      {/* Hover glow effect */}
      <div className={`absolute -inset-0.5 ${gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500`} />
      
      <div className="relative h-full p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        {/* Icon container */}
        <div className={`inline-flex p-3 rounded-xl ${gradient} mb-4`}>
          <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={1.5} />
        </div>
        
        <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-xl">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rotate-45" />
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
