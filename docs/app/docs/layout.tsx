import { siteConfig } from "@/config/site";
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function RootDocsLayout({ children }: DocsLayoutProps) {
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
