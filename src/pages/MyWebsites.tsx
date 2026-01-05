import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Trash2, Globe, Lock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import IceLogo from "@/components/IceLogo";
import CreditDisplay from "@/components/CreditDisplay";

interface Website {
  id: string;
  title: string;
  prompt: string;
  is_public: boolean;
  share_id: string | null;
  created_at: string;
}

const MyWebsites = () => {
  const { user, loading: authLoading } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWebsites();
    }
  }, [user]);

  const fetchWebsites = async () => {
    try {
      const { data, error } = await supabase
        .from("websites")
        .select("id, title, prompt, is_public, share_id, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebsites(data || []);
    } catch (error: any) {
      toast.error("Failed to load websites");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this website?")) return;

    try {
      const { error } = await supabase.from("websites").delete().eq("id", id);
      if (error) throw error;
      setWebsites(websites.filter((w) => w.id !== id));
      toast.success("Website deleted");
    } catch (error: any) {
      toast.error("Failed to delete website");
    }
  };

  const copyShareLink = (shareId: string) => {
    const url = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied!");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <IceLogo />
          </Link>
          <div className="flex items-center gap-3">
            <CreditDisplay />
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Generator
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Websites</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : websites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven't saved any websites yet.
            </p>
            <Link to="/">
              <Button>Generate Your First Website</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <Card key={website.id} className="group hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {website.is_public ? (
                          <Globe className="h-4 w-4 text-primary" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted" />
                        )}
                        {website.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {website.prompt}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Link to={`/view/${website.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    {website.is_public && website.share_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyShareLink(website.share_id!)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(website.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(website.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyWebsites;
