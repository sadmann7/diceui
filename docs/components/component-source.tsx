import { ComponentSourceImpl } from "@/components/component-source-impl";
import { highlightCode } from "@/lib/highlight-code";
import { readFileFromRoot } from "@/lib/read-file";
import { getRegistryItem } from "@/lib/registry";
import type { RegistryBase } from "@/registry";

function deriveTitle(
  name: string | undefined,
  src: string | undefined,
  explicit: string | undefined,
): string | undefined {
  if (explicit) return explicit;
  if (name) return `${name}.tsx`;
  if (src) return src.split("/").pop();
  return undefined;
}

interface ComponentSourceProps
  extends Omit<React.ComponentProps<typeof ComponentSourceImpl>, "language"> {
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
  className,
  base = "radix",
  maxLines,
}: ComponentSourceProps) {
  if (!name && !src) return null;

  let code: string | undefined;

  if (name) {
    code = getRegistryItem(name, base)?.files?.[0]?.content;
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

  const title = deriveTitle(name, src, explicitTitle);
  const lang = language ?? title?.split(".").pop() ?? "tsx";
  const highlightedCode = await highlightCode(code, lang);

  return (
    <ComponentSourceImpl
      code={code}
      highlightedCode={highlightedCode}
      language={lang}
      title={title}
      collapsible={collapsible}
      className={className}
    />
  );
}
