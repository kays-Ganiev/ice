import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { GeneratedProject, GeneratedFile } from "@/types/generated";
import { GenerationStep } from "@/components/GenerationProgress";

// Prefer the local backend (or a deployed backend) for generation.
// In development, Vite proxies /api to the backend.
const API_BASE = import.meta.env.VITE_API_URL || "";
const GENERATE_URL = `${API_BASE}/api/generate-website`;

const initialSteps: GenerationStep[] = [
  { id: "init", label: "Initializing generation...", status: "pending" },
  { id: "html", label: "Generating HTML structure", status: "pending" },
  { id: "css", label: "Creating styles & themes", status: "pending" },
  { id: "js", label: "Building JavaScript logic", status: "pending" },
  { id: "components", label: "Creating components", status: "pending" },
  { id: "images", label: "Generating AI images", status: "pending" },
  { id: "finalize", label: "Finalizing project", status: "pending" },
];

export const useWebsiteGenerator = () => {
  const [rawOutput, setRawOutput] = useState("");
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>(initialSteps);
  const [currentStepId, setCurrentStepId] = useState("");

  // Keep track of simulated step timers so we can cancel them when generation finishes early.
  const stepTimeoutsRef = useRef<number[]>([]);

  const updateStep = useCallback((stepId: string, status: GenerationStep["status"]) => {
    setCurrentStepId(stepId);
    setGenerationSteps((prev) => {
      const targetIndex = prev.findIndex((s) => s.id === stepId);
      if (targetIndex === -1) return prev;

      return prev.map((step, idx) => {
        // Don't override explicit errors.
        if (step.status === "error") return step;

        // Everything before the current step is completed.
        if (idx < targetIndex) {
          return { ...step, status: "completed" };
        }

        // This is the active step.
        if (idx === targetIndex) {
          return { ...step, status };
        }

        // Steps after the current step should remain pending unless already completed.
        return step.status === "completed" ? step : { ...step, status: "pending" };
      });
    });
  }, []);

  const parseProject = (rawJson: string): GeneratedProject | null => {
    try {
      let cleaned = rawJson.trim();

      // Remove markdown code blocks if present
      if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
      else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
      if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();

      // If the model wrapped extra text, try to extract the first JSON object
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(cleaned);

      if (!parsed.files || !Array.isArray(parsed.files)) {
        console.error("Invalid project structure: missing files array");
        return null;
      }

      return parsed as GeneratedProject;
    } catch (error) {
      console.error("Failed to parse project JSON:", error);
      return null;
    }
  };

  // ✅ UPDATED: accepts a model selected from your UI dropdown
  const generateWebsite = async (prompt: string, model?: string) => {
    setIsLoading(true);
    setIsStreaming(true);
    setRawOutput("");
    setProject(null);
    setCurrentPrompt(prompt);
    setGenerationSteps(initialSteps.map((s) => ({ ...s, status: "pending" })));

    // Clear any previous simulated step timers.
    stepTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    stepTimeoutsRef.current = [];

    // Start progress simulation
    updateStep("init", "in-progress");

    // ✅ Allow up to 3 minutes before we abort (tune as you like)
    const controller = new AbortController();
    const timeoutMs = 180_000; // 3 minutes
    const abortTimer = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Simulate step progression while waiting for response
      // (slower pacing to match ~1–2 minute generations)
      stepTimeoutsRef.current.push(window.setTimeout(() => updateStep("html", "in-progress"), 4000));
      stepTimeoutsRef.current.push(window.setTimeout(() => updateStep("css", "in-progress"), 15000));
      stepTimeoutsRef.current.push(window.setTimeout(() => updateStep("js", "in-progress"), 30000));
      stepTimeoutsRef.current.push(window.setTimeout(() => updateStep("components", "in-progress"), 50000));
      stepTimeoutsRef.current.push(window.setTimeout(() => updateStep("images", "in-progress"), 70000));
      stepTimeoutsRef.current.push(window.setTimeout(() => updateStep("finalize", "in-progress"), 95000));

      const response = await fetch(GENERATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        // ✅ send model to backend
        body: JSON.stringify({ prompt, generateImages: true, model }),
      });

      // When response starts, we’re at images step
      updateStep("images", "in-progress");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        if (response.status === 402) throw new Error("Credits required. Please add credits to continue.");
        throw new Error(errorData.error || "Failed to generate website");
      }

      const contentType = response.headers.get("content-type") || "";

      // Handle JSON response (with images)
      if (contentType.includes("application/json")) {
        setIsStreaming(false);
        const projectData = await response.json();
        updateStep("finalize", "in-progress");

        if (projectData.files && Array.isArray(projectData.files)) {
          setProject(projectData);
          setRawOutput(JSON.stringify(projectData, null, 2));
          setGenerationSteps((prev) => prev.map((s) => (s.status === "error" ? s : { ...s, status: "completed" })));
          updateStep("finalize", "completed");
          const imageCount = projectData.images?.length || 0;
          toast.success(`Generated ${projectData.files.length} files${imageCount > 0 ? ` and ${imageCount} images` : ""}!`);
        } else if (projectData.error) {
          throw new Error(projectData.error);
        } else {
          // Fallback
          const fallbackFile: GeneratedFile = {
            filename: "index.html",
            language: "html",
            content: JSON.stringify(projectData),
            description: "Generated website",
          };
          setProject({ files: [fallbackFile] });
          setGenerationSteps((prev) => prev.map((s) => (s.status === "error" ? s : { ...s, status: "completed" })));
          updateStep("finalize", "completed");
        }
        return;
      }

      // Handle streaming response
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedOutput = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulatedOutput += content;
              setRawOutput(accumulatedOutput);
            }
          } catch {
            // put it back and wait for more
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      const parsedProject = parseProject(accumulatedOutput);

      if (parsedProject) {
        setProject(parsedProject);
        setGenerationSteps((prev) => prev.map((s) => (s.status === "error" ? s : { ...s, status: "completed" })));
        toast.success(`Generated ${parsedProject.files.length} files successfully!`);
      } else {
        const fallbackFile: GeneratedFile = {
          filename: "index.html",
          language: "html",
          content: accumulatedOutput,
          description: "Generated website",
        };
        setProject({ files: [fallbackFile] });
        setGenerationSteps((prev) => prev.map((s) => (s.status === "error" ? s : { ...s, status: "completed" })));
        toast.success("Website generated successfully!");
      }
    } catch (error: any) {
      console.error("Generation error:", error);

      // Mark the current step as errored so the progress UI reflects failure.
      setGenerationSteps((prev) =>
        prev.map((s) => {
          if (s.status === "completed") return s;
          if (s.status === "in-progress") return { ...s, status: "error" };
          return s;
        })
      );

      if (error?.name === "AbortError") {
        toast.error("Generation took too long (over 3 minutes). Try a smaller prompt or a faster model (Coder 7B).");
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to generate website");
      }
    } finally {
      window.clearTimeout(abortTimer);

      setIsLoading(false);
      setIsStreaming(false);

      // Stop simulated timers.
      stepTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
      stepTimeoutsRef.current = [];
    }
  };

  // Get combined HTML for preview (inline CSS and JS)
  const getPreviewHtml = (): string => {
    if (!project || project.files.length === 0) return "";

    const htmlFile = project.files.find((f) => f.filename.endsWith(".html"));
    const cssFile = project.files.find((f) => f.filename.endsWith(".css"));
    const jsFiles = project.files.filter((f) => f.filename.endsWith(".js"));

    if (!htmlFile) return project.files[0]?.content || "";

    let html = htmlFile.content;

    // Inject CSS
    if (cssFile) {
      const cssLink = `<link rel="stylesheet" href="${cssFile.filename}">`;
      const styleTag = `<style>\n${cssFile.content}\n</style>`;
      html = html.replace(cssLink, styleTag);
      html = html.replace(`<link rel="stylesheet" href=${cssFile.filename}>`, styleTag);
      if (!html.includes("<style>")) {
        html = html.replace("</head>", `${styleTag}\n</head>`);
      }
    }

    // Inject JS
    for (const jsFile of jsFiles) {
      const scriptSrc = `<script src="${jsFile.filename}"></script>`;
      const scriptTag = `<script>\n${jsFile.content}\n</script>`;
      html = html.replace(scriptSrc, scriptTag);
      html = html.replace(`<script src=${jsFile.filename}></script>`, scriptTag);
    }

    // If JS wasn't injected via replacement, add before </body>
    if (jsFiles.length > 0 && !html.includes("<script>")) {
      const allJs = jsFiles.map((f) => f.content).join("\n\n");
      html = html.replace("</body>", `<script>\n${allJs}\n</script>\n</body>`);
    }

    return html;
  };

  return {
    rawOutput,
    project,
    isLoading,
    isStreaming,
    generateWebsite, // now supports generateWebsite(prompt, model)
    currentPrompt,
    getPreviewHtml,
    generationSteps,
    currentStepId,
    // Legacy compatibility
    code: getPreviewHtml(),
  };
};
