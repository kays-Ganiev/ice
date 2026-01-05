import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to generate an image using Lovable AI
async function generateImage(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log("Generating image for:", prompt.slice(0, 50));
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error("Image generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    return imageUrl || null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, generateImages = true } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating website for:", prompt);

    // Simplified prompt for faster generation
    const systemPrompt = `You are an expert web developer. Generate a complete website with HTML, CSS, and JavaScript.

IMPORTANT: Match the design theme EXACTLY to what the user requests:
- Coffee shop = warm browns (#8B4513, #D2691E), elegant serif fonts
- Restaurant = rich reds, appetizing imagery
- Fitness = bold oranges/reds, energetic sans-serif
- Portfolio = minimal, elegant grays and accent color
- Tech startup = modern blues/purples, clean design
- Fashion = sophisticated blacks, stylish fonts
- Healthcare = calming blues/greens, clean design
- Education = professional blues, accessible

Return ONLY valid JSON (no markdown):
{
  "files": [
    {"filename": "index.html", "language": "html", "content": "...", "description": "Main page"},
    {"filename": "styles.css", "language": "css", "content": "...", "description": "Styles"},
    {"filename": "app.js", "language": "javascript", "content": "...", "description": "JavaScript"}
  ]
}

REQUIREMENTS:
- Beautiful, modern responsive design
- CSS variables for theming
- Smooth hover effects and transitions
- Mobile-first layout
- Semantic HTML with proper sections
- Include realistic placeholder content`;

    // Start image generation in parallel with text generation
    const imagePromises = generateImages ? [
      generateImage(`Professional hero banner for ${prompt}. High-quality, realistic photography. 16:9, no text.`, LOVABLE_API_KEY),
      generateImage(`Feature image for ${prompt}. Clean, professional. Square format, no text.`, LOVABLE_API_KEY),
    ] : [];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a ${prompt} website. Use colors and design appropriate for this specific type of business.` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    console.log("Got response, length:", content.length);

    // Parse the JSON response
    try {
      let cleaned = content.trim();
      if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
      else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
      if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();

      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }

      const project = JSON.parse(cleaned);
      
      // Wait for images and add them
      if (imagePromises.length > 0) {
        console.log("Waiting for images...");
        const imageResults = await Promise.all(imagePromises);
        const generatedImages = [];
        
        if (imageResults[0]) {
          generatedImages.push({
            url: imageResults[0],
            alt: "Hero Image",
            description: "Main hero section image",
          });
        }
        if (imageResults[1]) {
          generatedImages.push({
            url: imageResults[1],
            alt: "Feature Image",
            description: "Feature section illustration",
          });
        }
        
        if (generatedImages.length > 0) {
          project.images = generatedImages;
          console.log("Added", generatedImages.length, "images");
        }
      }

      return new Response(JSON.stringify(project), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Parse error:", parseError);
      return new Response(JSON.stringify({ 
        files: [{ filename: "index.html", language: "html", content: content, description: "Generated website" }] 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
