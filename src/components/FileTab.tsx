import { cn } from "@/lib/utils";

interface FileTabProps {
  filename: string;
  language: string;
  isActive: boolean;
  onClick: () => void;
}

const languageIcons: Record<string, string> = {
  html: "🌐",
  css: "🎨",
  javascript: "⚡",
  js: "⚡",
  json: "📋",
  sql: "🗃️",
  typescript: "💎",
  ts: "💎",
};

const FileTab = ({ filename, language, isActive, onClick }: FileTabProps) => {
  const icon = languageIcons[language.toLowerCase()] || "📄";
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap",
        isActive
          ? "text-primary border-primary bg-primary/5"
          : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
      )}
    >
      <span>{icon}</span>
      <span className="font-mono">{filename}</span>
    </button>
  );
};

export default FileTab;
