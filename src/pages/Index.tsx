import IceLogo from "@/components/IceLogo";
import PromptInput from "@/components/PromptInput";
import MultiFileOutput from "@/components/MultiFileOutput";
import GenerationProgress from "@/components/GenerationProgress";
import UserMenu from "@/components/UserMenu";
import FloatingElements from "@/components/FloatingElements";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import CreditDisplay from "@/components/CreditDisplay";
import { Button } from "@/components/ui/button";
import { useWebsiteGenerator } from "@/hooks/useWebsiteGenerator";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { FileCode, Database, Bot, Image, Github, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const {
    project,
    rawOutput,
    isLoading,
    isStreaming,
    generateWebsite,
    currentPrompt,
    getPreviewHtml,
    generationSteps,
    currentStepId
  } = useWebsiteGenerator();
  const { user } = useAuth();
  const { hasCredits, useCredit } = useCredits();

  const handleGenerate = async (prompt: string, model: string) => {

    if (!hasCredits) {
      toast({
        title: "No credits remaining",
        description: "Please upgrade your plan to get more credits.",
        variant: "destructive",
      });
      return;
    }

    const success = await useCredit(1);
    if (success) {
      generateWebsite(prompt, model);
    } else {
      toast({
        title: "Failed to use credit",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const features = [
    {
      icon: FileCode,
      title: "9+ Files Generated",
      description: "Complete project structure with HTML, CSS, JavaScript, components, utilities, and configuration files.",
      gradient: "bg-gradient-to-br from-primary to-primary/80",
    },
    {
      icon: Bot,
      title: "LLM Integration Ready",
      description: "Pre-configured AI API endpoints and chat interface components for instant AI capabilities.",
      gradient: "bg-gradient-to-br from-chart-2 to-chart-2/80",
    },
    {
      icon: Database,
      title: "Database Schemas",
      description: "Complete SQL schemas, table relationships, and API documentation ready for your backend.",
      gradient: "bg-gradient-to-br from-chart-1 to-chart-1/80",
    },
    {
      icon: Image,
      title: "AI-Generated Images",
      description: "Automatically generates hero images, feature illustrations, and brand assets for your site.",
      gradient: "bg-gradient-to-br from-chart-5 to-chart-5/80",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <FloatingElements />

      <div className="relative z-10">
        {/* GIA Title Bar */}
        <div className="bg-primary/5 border-b border-primary/20 py-2">
          <div className="container mx-auto px-4 text-center">
            <span className="text-sm font-bold tracking-widest text-primary">GIA</span>
            <span className="text-xs text-muted-foreground ml-2">v1.a.1.1</span>
          </div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/30 backdrop-blur-xl bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <IceLogo />

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm text-foreground font-medium">
                Home
              </Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              {user && (
                <Link to="/my-websites" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  My Websites
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <CreditDisplay />
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-16">
          {/* Hero section */}
          <HeroSection />

          {/* Prompt input */}
          <div className="mb-16">
            <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
          </div>

          {/* Generation Progress */}
          {isLoading && !project && (
            <div className="mt-8 animate-fade-in">
              <GenerationProgress steps={generationSteps} currentStep={currentStepId} />
            </div>
          )}

          {/* Output */}
          {!isLoading && (
            <MultiFileOutput
              project={project}
              rawOutput={rawOutput}
              isStreaming={isStreaming}
              prompt={currentPrompt}
              previewHtml={getPreviewHtml()}
            />
          )}

          {/* Features section - only show when no project */}
          {!project && !rawOutput && !isLoading && (
            <section className="mt-24 mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Everything you need in one generation
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  GIA creates production-ready code with all the essential files and integrations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {features.map((feature) => (
                  <FeatureCard key={feature.title} {...feature} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/30 bg-card/30 backdrop-blur-sm mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <IceLogo />
              </div>

              <p className="text-sm text-muted-foreground">
                Generate beautiful websites with AI in seconds
              </p>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Github className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Twitter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
};

export default Index;
