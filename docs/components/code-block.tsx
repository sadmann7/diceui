"use client";

import { CodeBlock as FumadocsCodeBlock } from "fumadocs-ui/components/codeblock";
import * as React from "react";
import { trackEvent } from "@/lib/analytics";

interface CodeBlockProps
  extends React.ComponentProps<typeof FumadocsCodeBlock> {
  "data-component"?: string;
}

export function CodeBlock({ lang, ...props }: CodeBlockProps) {
  const component = props["data-component"];
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const button = target.closest('button[aria-label="Copy Text"]');

      if (button) {
        const currentContainer = containerRef.current;
        if (!currentContainer) return;

        const pre = currentContainer.querySelector("pre");
        const code = pre?.textContent || "";

        const isInstallCommand =
          /^(npm|pnpm|yarn|bun|npx)\s+(install|add|i)\s+/.test(code.trim()) ||
          /^(npm|pnpm|yarn|bun)\s+create\s+/.test(code.trim()) ||
          code.includes("shadcn") ||
          code.includes("@diceui/");

        const eventName = isInstallCommand
          ? "copy_install_command"
          : "copy_code";

        trackEvent({
          name: eventName,
          properties: {
            language: lang || "unknown",
            ...(component && { component }),
          },
        });
      }
    }

    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  }, [lang, component]);

  return (
    <div ref={containerRef}>
      <FumadocsCodeBlock {...props} />
    </div>
  );
}
