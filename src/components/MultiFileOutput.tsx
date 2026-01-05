import { useState, useMemo } from "react";
import { Copy, Check, Code, Eye, Download, Save, FileCode, Layers, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import SaveWebsiteDialog from "./SaveWebsiteDialog";
import FileTab from "./FileTab";
import IntegrationPanel from "./IntegrationPanel";
import GeneratedImagesPanel from "./GeneratedImagesPanel";
import { GeneratedProject } from "@/types/generated";

interface MultiFileOutputProps {
  project: GeneratedProject | null;
  rawOutput: string;
  isStreaming: boolean;
  prompt: string;
  previewHtml: string;
}

const MultiFileOutput = ({ project, rawOutput, isStreaming, prompt, previewHtml }: MultiFileOutputProps) => {
  const [copied, setCopied] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const { user } = useAuth();

  const files = project?.files || [];
  const activeFile = files[activeFileIndex];

  const hasIntegrations = useMemo(() => {
    return !!(project?.llmIntegration || project?.databaseSchema || project?.apiEndpoints?.length);
  }, [project]);

  const hasImages = useMemo(() => {
    return !!(project?.images && project.images.length > 0);
  }, [project]);

  const copyToClipboard = async () => {
    const content = activeFile?.content || rawOutput;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAllFiles = async () => {
    if (!project) return;
    const allContent = project.files.map(f => 
      `/* === ${f.filename} === */\n${f.content}`
    ).join("\n\n");
    await navigator.clipboard.writeText(allContent);
    toast.success("All files copied to clipboard!");
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded!`);
  };

  const downloadAllAsZip = async () => {
    if (!project) return;
    
    // For simplicity, we'll download the combined HTML
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Website downloaded!");
  };

  if (!project && !rawOutput) return null;

  // Show streaming output
  if (isStreaming || (!project && rawOutput)) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-8">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-chart-2/30 via-primary/30 to-chart-2/30 rounded-2xl blur-lg opacity-40" />
          <div className="relative bg-card rounded-xl border border-border/50 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-popover/50">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <span className="font-medium">Generating...</span>
              </div>
              <span className="text-sm text-primary animate-pulse flex items-center gap-2">
                <span className="h-2 w-2 bg-primary rounded-full animate-ping" />
                Streaming output...
              </span>
            </div>
            <div className="max-h-[500px] overflow-auto bg-secondary/10">
              <pre className="p-4 text-sm font-mono text-foreground whitespace-pre-wrap break-words">
                <code>{rawOutput}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    <FileCode className="h-4 w-4" />
                    Files ({files.length})
                  </TabsTrigger>
                  {hasImages && (
                    <TabsTrigger value="images" className="gap-2">
                      <Image className="h-4 w-4" />
                      Images ({project?.images?.length || 0})
                    </TabsTrigger>
                  )}
                  {hasIntegrations && (
                    <TabsTrigger value="integrations" className="gap-2">
                      <Layers className="h-4 w-4" />
                      Backend
                    </TabsTrigger>
                  )}
                </TabsList>
                <div className="flex items-center gap-2 flex-wrap">
                  {user && (
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
                    onClick={downloadAllAsZip}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllFiles}
                    className="gap-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy All"}
                  </Button>
                </div>
              </div>

              <TabsContent value="preview" className="m-0">
                <div className="bg-background">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[600px] border-0"
                    title="Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </TabsContent>

              <TabsContent value="code" className="m-0">
                {/* File tabs */}
                <ScrollArea className="w-full border-b border-border/30">
                  <div className="flex bg-popover/30">
                    {files.map((file, index) => (
                      <FileTab
                        key={file.filename}
                        filename={file.filename}
                        language={file.language}
                        isActive={index === activeFileIndex}
                        onClick={() => setActiveFileIndex(index)}
                      />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>

                {/* File content */}
                <div className="max-h-[550px] overflow-auto bg-secondary/10">
                  {activeFile && (
                    <>
                      <div className="flex items-center justify-between px-4 py-2 bg-popover/20 border-b border-border/20">
                        <span className="text-sm text-muted-foreground">
                          {activeFile.description || activeFile.filename}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(activeFile.filename, activeFile.content)}
                          className="gap-1 text-xs"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>
                      <pre className="p-4 text-sm font-mono text-foreground whitespace-pre-wrap break-words">
                        <code>{activeFile.content}</code>
                      </pre>
                    </>
                  )}
                </div>
              </TabsContent>

              {hasImages && (
                <TabsContent value="images" className="m-0">
                  <ScrollArea className="h-[600px]">
                    <GeneratedImagesPanel images={project!.images!} />
                  </ScrollArea>
                </TabsContent>
              )}

              {hasIntegrations && (
                <TabsContent value="integrations" className="m-0">
                  <ScrollArea className="h-[600px]">
                    <IntegrationPanel project={project!} />
                  </ScrollArea>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>

      <SaveWebsiteDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        prompt={prompt}
        code={previewHtml}
      />
    </>
  );
};

export default MultiFileOutput;
