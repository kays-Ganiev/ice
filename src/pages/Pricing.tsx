import { Link } from "react-router-dom";
import IceLogo from "@/components/IceLogo";
import PricingPlans from "@/components/PricingPlans";
import CreditDisplay from "@/components/CreditDisplay";
import UserMenu from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, LogIn } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useState } from "react";

const Pricing = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/30 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <IceLogo />
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/pricing" className="text-sm text-foreground font-medium">
              Pricing
            </Link>
            {user && (
              <Link to="/my-websites" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                My Websites
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user && <CreditDisplay />}
            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setShowAuthModal(true)}
                  className="gap-2 shadow-lg"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Generator
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get more credits and unlock premium features to generate amazing websites
          </p>
        </div>

        <PricingPlans />

        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>All plans include access to AI-powered website generation</p>
          <p className="mt-2">Need more credits? <Link to="/pricing" className="text-primary hover:underline">Contact us</Link> for custom plans</p>
        </div>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Pricing;
