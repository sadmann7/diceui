import type * as React from "react";
import { ComponentSourceImpl } from "@/components/component-source-impl";
import { highlightCode } from "@/lib/highlight-code";
import { readFileFromRoot } from "@/lib/read-file";
import { getRegistryItem } from "@/lib/registry";
import type { RegistryBase } from "@/registry/registry";

function deriveTitle(
  name: string | undefined,
  src: string | undefined,
  explicit: string | undefined,
  registryPath: string | undefined,
): string | undefined {
  if (explicit) return explicit;
  if (registryPath) return registryPath;
  if (name) return `${name}.tsx`;
  if (src) return src.split("/").pop();
  return undefined;
}

interface ComponentSourceProps
  extends Omit<
    React.ComponentProps<typeof ComponentSourceImpl>,
    "code" | "language" | "highlightedCode"
  > {
  name?: string;
  src?: string;
  base?: RegistryBase;
  language?: string;
  maxLines?: number;
}

export async function ComponentSource({
  name,
  src,
  title: explicitTitle,
  language,
  collapsible = true,
  base,
  maxLines,
  ...props
}: ComponentSourceProps) {
  if (!name && !src) return null;

  let code: string | undefined;
  let registryPath: string | undefined;

  if (name) {
    const item = getRegistryItem(name, base);
    code = item?.files?.[0]?.content;
    registryPath = item?.files?.[0]?.path;
  }

  if (src) {
    try {
      code = readFileFromRoot(src);
    } catch {
      return null;
    }
  }

  if (!code) return null;

  if (maxLines) {
    code = code.split("\n").slice(0, maxLines).join("\n");
  }

  const title = deriveTitle(name, src, explicitTitle, registryPath);
  const lang = language ?? title?.split(".").pop() ?? "tsx";
  const highlightedCode = await highlightCode(code, lang);

  return (
    <ComponentSourceImpl
      code={code}
      highlightedCode={highlightedCode}
      language={lang}
      title={title}
      collapsible={collapsible}
      {...props}
    />
  );
}
