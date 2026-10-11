import { DocsLayout } from "@/components/docs-layout";
import { docsOptions } from "@/config/layout";
import { getCachedFilteredTree } from "@/lib/base";
import { SkipNav } from "@/registry/bases/radix/components/skip-nav";

export default function Layout({ children }: LayoutProps<"/docs">) {
  const trees = {
    base: getCachedFilteredTree(docsOptions.tree, "base"),
    radix: getCachedFilteredTree(docsOptions.tree, "radix"),
  };

  return (
    <>
      <SkipNav href="#nd-page" />
      <DocsLayout {...docsOptions} trees={trees}>
        {children}
      </DocsLayout>
    </>
  );
}
