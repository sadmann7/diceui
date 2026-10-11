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

export function DocsLayout({ trees, ...props }: DocsLayoutProps) {
  const pathname = usePathname();
  const base = pathname.split("/")[3] === "radix" ? "radix" : DEFAULT_BASE;

  return <DocsLayoutImpl key={base} {...props} tree={trees[base]} />;
}
