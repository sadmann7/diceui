import { DocsLayout as DocsLayoutImpl } from "fumadocs-ui/layouts/docs";

import { docsOptions } from "@/config/layout";
import { getCachedFilteredTree } from "@/lib/base";
import { DEFAULT_BASE } from "@/lib/constants";

export default async function SlugLayout({
  children,
  params,
}: LayoutProps<"/docs/[[...slug]]">) {
  const { slug } = await params;
  const base = slug?.[1] === "radix" ? "radix" : DEFAULT_BASE;
  const tree = getCachedFilteredTree(docsOptions.tree, base);

  return (
    <DocsLayoutImpl {...docsOptions} tree={tree}>
      {children}
    </DocsLayoutImpl>
  );
}
