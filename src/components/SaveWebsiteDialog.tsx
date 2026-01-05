import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface SaveWebsiteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  code: string;
  onSaved?: () => void;
}

const SaveWebsiteDialog = ({ isOpen, onClose, prompt, code, onSaved }: SaveWebsiteDialogProps) => {
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateShareId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be signed in to save");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("websites").insert({
        user_id: user.id,
        title: title.trim(),
        prompt,
        code,
        is_public: isPublic,
        share_id: isPublic ? generateShareId() : null,
      });

      if (error) throw error;

      toast.success("Website saved!");
      onSaved?.();
      onClose();
      setTitle("");
      setIsPublic(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save website");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Website</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="My awesome website"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public">Make public</Label>
              <p className="text-sm text-muted-foreground">
                Allow anyone with the link to view
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveWebsiteDialog;
