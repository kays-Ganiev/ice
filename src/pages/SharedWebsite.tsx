import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Copy, Download, Code, Eye, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Website {
  title: string;
  prompt: string;
  code: string;
}

const SharedWebsite = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (shareId) {
      fetchWebsite();
    }
  }, [shareId]);

  const fetchWebsite = async () => {
    try {
      const { data, error } = await supabase
        .from("websites")
        .select("title, prompt, code")
        .eq("share_id", shareId)
        .eq("is_public", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setNotFound(true);
        return;
      }

      setWebsite(data);
    } catch (error: any) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (website) {
      await navigator.clipboard.writeText(website.code);
      toast.success("Code copied!");
    }
  };

  const downloadHtml = () => {
    if (website) {
      const blob = new Blob([website.code], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${website.title.toLowerCase().replace(/\s+/g, "-")}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Website Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This link may be invalid or the website may no longer be public.
          </p>
          <Link to="/">
            <Button>Go to Ice</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Snowflake className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Ice</span>
          </Link>
          <Link to="/">
            <Button size="sm">Create Your Own</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{website?.title}</h1>
          <p className="text-muted-foreground mt-1">{website?.prompt}</p>
        </div>

        <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-xl">
          <Tabs defaultValue="preview" className="w-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-popover/50">
              <TabsList className="bg-secondary/30">
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <Code className="h-4 w-4" />
                  Code
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={downloadHtml} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>

            <TabsContent value="preview" className="m-0">
              <iframe
                srcDoc={website?.code}
                className="w-full h-[600px] border-0 bg-background"
                title="Preview"
                sandbox="allow-scripts"
              />
            </TabsContent>

            <TabsContent value="code" className="m-0">
              <div className="max-h-[600px] overflow-auto bg-secondary/10">
                <pre className="p-4 text-sm font-mono text-foreground whitespace-pre-wrap break-words">
                  <code>{website?.code}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SharedWebsite;
