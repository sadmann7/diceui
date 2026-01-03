"use client";

import { CodeBlock as FumadocsCodeBlock } from "fumadocs-ui/components/codeblock";
import * as React from "react";
import { trackEvent } from "@/lib/analytics";

const INSTALL_COMMAND_REGEX =
  /^(npm|pnpm|yarn|bun|npx)\s+(install|add|i|create)\s+/;

function getIsInstallCommand(code: string): boolean {
  const trimmed = code.trim();
  return (
    INSTALL_COMMAND_REGEX.test(trimmed) ||
    trimmed.includes("shadcn") ||
    trimmed.includes("@diceui/")
  );
}

export function CodeBlock({
  lang,
  ...props
}: React.ComponentProps<typeof FumadocsCodeBlock>) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest(
        'button[aria-label="Copy Text"]',
      );
      if (!button || !containerRef.current) return;

      const code = containerRef.current.querySelector("pre")?.textContent ?? "";
      const eventName = getIsInstallCommand(code)
        ? "copy_install_command"
        : "copy_code";

      trackEvent({
        name: eventName,
        properties: {
          ...(lang && { language: lang }),
        },
      });
    };

    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  }, [lang]);

  return (
    <div ref={containerRef}>
      <FumadocsCodeBlock {...props} />
    </div>
  );
}
