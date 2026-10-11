"use client";

import type { Root } from "fumadocs-core/page-tree";
import type * as React from "react";

import { DocsLayout as DocsLayoutImpl } from "fumadocs-ui/layouts/docs";
import { usePathname } from "next/navigation";

import type { RegistryBase } from "@/registry/registry";

import { DEFAULT_BASE } from "@/lib/constants";

interface DocsLayoutProps extends Omit<
  React.ComponentProps<typeof DocsLayoutImpl>,
  "tree"
> {
  trees: Record<RegistryBase, Root>;
}

// Picks the sidebar tree on the client, so the layout (and the sidebar's
// scroll position) persists across page navigations
export function DocsLayout({ trees, ...props }: DocsLayoutProps) {
  const pathname = usePathname();
  // `/docs/components/radix/...` and `/docs/utilities/radix/...`
  const base = pathname.split("/")[3] === "radix" ? "radix" : DEFAULT_BASE;

  // The sidebar keeps the tree it mounted with, so remount it when the base changes
  return <DocsLayoutImpl key={base} {...props} tree={trees[base]} />;
}
