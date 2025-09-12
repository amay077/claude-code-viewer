"use client";

import { Code, Eye } from "lucide-react";
import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface MermaidRendererProps {
  content: string;
  className?: string;
}

export function MermaidRenderer({
  content,
  className = "",
}: MermaidRendererProps) {
  const [isRendered, setIsRendered] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRendered) return;

    const renderMermaid = async () => {
      try {
        setError(null);

        // Initialize mermaid only once
        if (!mermaid.mermaidAPI) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
            fontFamily: "monospace",
          });
        }

        // Clear previous content
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = "";
        }

        // Generate unique ID for this render
        const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Render the diagram
        const { svg } = await mermaid.render(uniqueId, content);

        // Insert the SVG
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      } catch (err) {
        // Only set error if it's a real parsing/rendering error
        if (err instanceof Error && !err.message.includes("Duplicate id")) {
          console.error("Mermaid rendering error:", err);
          setError(err.message);
        } else if (mermaidRef.current) {
          // Try to render with innerHTML as fallback
          try {
            const tempDiv = document.createElement("div");
            tempDiv.textContent = content;
            tempDiv.classList.add("mermaid");
            if (mermaidRef.current) {
              mermaidRef.current.innerHTML = "";
              mermaidRef.current.appendChild(tempDiv);
              await mermaid.init(undefined, tempDiv);
            }
          } catch (fallbackErr) {
            console.error("Mermaid fallback rendering error:", fallbackErr);
            setError(
              fallbackErr instanceof Error
                ? fallbackErr.message
                : "Failed to render diagram",
            );
          }
        }
      }
    };

    renderMermaid();
  }, [content, isRendered]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRendered(!isRendered)}
          className="h-8 px-2 text-xs bg-background/95 backdrop-blur-sm hover:bg-background"
        >
          {isRendered ? (
            <>
              <Code className="h-3 w-3 mr-1" />
              Source
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </>
          )}
        </Button>
      </div>

      {isRendered ? (
        <div className="relative">
          {error ? (
            <div className="p-4 border border-red-500 rounded bg-red-500/10 text-red-400">
              <p className="text-sm font-semibold mb-1">
                Failed to render diagram
              </p>
              <p className="text-xs">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRendered(false)}
                className="mt-2 text-xs"
              >
                View Source
              </Button>
            </div>
          ) : (
            <div
              ref={mermaidRef}
              className="flex justify-center items-center min-h-[100px] p-4 overflow-x-auto"
            />
          )}
        </div>
      ) : (
        <pre className="p-4 overflow-x-auto rounded bg-zinc-900 border border-zinc-800">
          <code className="text-sm text-zinc-300">{content}</code>
        </pre>
      )}
    </div>
  );
}