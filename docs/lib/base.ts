import type { Node, Root } from "fumadocs-core/page-tree";
import { source } from "@/lib/source";
import type { RegistryBase } from "@/registry";

// Computed once per server process — source pages are static build-time data.
// O(1) lookup vs O(n) .some() on every page render.
const pageUrls = new Set(source.getPages().map((p) => p.url));

// Only two possible filtered trees ("radix" | "base"). Memoize both after
// the first request for each so subsequent renders skip the tree walk.
const treeCache = new Map<string, Root>();

export function filterTreeForBase(tree: Root, base: string): Root {
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

export function getCachedFilteredTree(tree: Root, base: string): Root {
  if (!treeCache.has(base)) {
    treeCache.set(base, filterTreeForBase(tree, base));
  }
  const cached = treeCache.get(base);
  if (!cached) throw new Error(`No cached tree for base: ${base}`);
  return cached;
}

export function getHasBothBases({
  url,
  base,
}: {
  url: string;
  base: RegistryBase | undefined;
}): boolean {
  if (!base) return false;

  const isComponentOrUtility =
    url.startsWith("/docs/components/") || url.startsWith("/docs/utilities/");
  if (!isComponentOrUtility) return false;

  const componentName = url.split("/").pop();
  if (!componentName) return false;

  const otherBase = base === "radix" ? "base" : "radix";
  const prefix = url.startsWith("/docs/components/")
    ? "/docs/components/"
    : "/docs/utilities/";

  return pageUrls.has(`${prefix}${otherBase}/${componentName}`);
}
