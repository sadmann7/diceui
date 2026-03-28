import type { Node, Root } from "fumadocs-core/page-tree";
import { DocsLayout as DocsLayoutImpl } from "fumadocs-ui/layouts/docs";
import { docsOptions } from "@/config/layout";

function filterTreeForBase(tree: Root, base: string): Root {
  const otherBase = base === "base" ? "radix" : "base";

  function filterNode(node: Node): Node | null {
    if (node.type === "page") {
      if (
        node.url.includes(`/components/${otherBase}/`) ||
        node.url.includes(`/utilities/${otherBase}/`)
      ) {
        return null;
      }
      return node;
    }

    if (node.type === "folder") {
      const children = node.children.map(filterNode).filter(Boolean) as Node[];
      return { ...node, children };
    }

    return node;
  }

  return {
    ...tree,
    children: tree.children.map(filterNode).filter(Boolean) as Node[],
  };
}

interface SlugLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug?: string[] }>;
}

export default async function SlugLayout({
  children,
  params,
}: SlugLayoutProps) {
  const { slug } = await params;
  // slug[0] = "components" | "utilities" | ...
  // slug[1] = "base" | "radix" | page-name
  const base = slug?.[1] === "base" ? "base" : "radix";
  const tree = filterTreeForBase(docsOptions.tree, base);

  return (
    <DocsLayoutImpl {...docsOptions} tree={tree}>
      {children}
    </DocsLayoutImpl>
  );
}
