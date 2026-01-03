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
        // eslint-disable-next-line no-console
        console.log("📋 Copy button clicked", { lang, component });

        trackEvent({
          name: "copy_code",
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
