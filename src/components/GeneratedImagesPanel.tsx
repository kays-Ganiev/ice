import { useState } from "react";
import { Image, Download, Loader2, AlertCircle, CheckCircle, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GeneratedImage } from "@/types/generated";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface GeneratedImagesPanelProps {
  images: GeneratedImage[];
}

const ImageCard = ({ image, index }: { image: GeneratedImage; index: number }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadImage = async () => {
    setIsDownloading(true);
    try {
      if (image.url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `${image.alt.toLowerCase().replace(/\s+/g, '-')}-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${image.alt.toLowerCase().replace(/\s+/g, '-')}-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image container */}
      <div className="relative aspect-video bg-secondary/20">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <span className="text-sm text-destructive">Failed to load image</span>
          </div>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full h-full cursor-zoom-in">
                <img 
                  src={image.url} 
                  alt={image.alt}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                  } group-hover:scale-105`}
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                  }}
                />
                {/* Zoom overlay */}
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-background/80 rounded-full">
                    <ZoomIn className="h-5 w-5 text-foreground" />
                  </div>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
              <img 
                src={image.url} 
                alt={image.alt}
                className="w-full h-auto"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Info footer */}
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-foreground">{image.alt}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{image.description}</p>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={downloadImage}
          disabled={isDownloading || hasError}
          className="w-full gap-2"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Image
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const GeneratedImagesPanel = ({ images }: GeneratedImagesPanelProps) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-chart-1 to-chart-2">
            <Image className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI-Generated Images</h3>
            <p className="text-sm text-muted-foreground">{images.length} image{images.length !== 1 ? 's' : ''} ready to use</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-chart-2">
          <CheckCircle className="h-4 w-4" />
          <span>Generated</span>
        </div>
      </div>
      
      {/* Image grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((image, index) => (
          <ImageCard key={index} image={image} index={index} />
        ))}
      </div>
      
      {/* Usage tip */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Tip:</span> Download these images and update the <code className="px-1.5 py-0.5 rounded bg-secondary/50 text-xs font-mono">src</code> attributes in your HTML to use them in your website.
        </p>
      </div>
    </div>
  );
};

export default GeneratedImagesPanel;
