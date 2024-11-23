import { siteConfig } from "@/lib/config";
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: siteConfig.name,
        url: siteConfig.links.github,
      }}
      links={[{ text: "Docs", url: "/docs" }]}
    >
      {children}
    </DocsLayout>
  );
}
