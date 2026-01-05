import { useState } from "react";
import { Copy, Check, Code, Eye, Download, Save, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import SaveWebsiteDialog from "./SaveWebsiteDialog";

interface CodeOutputProps {
  code: string;
  isStreaming: boolean;
  prompt: string;
}

const CodeOutput = ({ code, isStreaming, prompt }: CodeOutputProps) => {
  const [copied, setCopied] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { user } = useAuth();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML file downloaded!");
  };

  if (!code) return null;

  return (
    <>
      <div className="w-full max-w-5xl mx-auto mt-8">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-chart-2/30 via-primary/30 to-chart-2/30 rounded-2xl blur-lg opacity-40" />
          <div className="relative bg-card rounded-xl border border-border/50 overflow-hidden shadow-xl">
            <Tabs defaultValue="preview" className="w-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-popover/50 flex-wrap gap-2">
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
                <div className="flex items-center gap-2 flex-wrap">
                  {isStreaming && (
                    <span className="text-sm text-primary animate-pulse flex items-center gap-2">
                      <span className="h-2 w-2 bg-primary rounded-full animate-ping" />
                      Generating...
                    </span>
                  )}
                  {user && !isStreaming && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSaveDialog(true)}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadHtml}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <TabsContent value="preview" className="m-0">
                <div className="bg-background">
                  <iframe
                    title="Preview"
                    srcDoc={code}
                    sandbox="allow-scripts allow-forms allow-same-origin"
                  />

                </div>
              </TabsContent>

              <TabsContent value="code" className="m-0">
                <div className="max-h-[600px] overflow-auto bg-secondary/10">
                  <pre className="p-4 text-sm font-mono text-foreground whitespace-pre-wrap break-words">
                    <code>{code}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <SaveWebsiteDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        prompt={prompt}
        code={code}
      />
    </>
  );
};

export default CodeOutput;
