import { docsOptions } from "@/config/layout";
import { DocsLayout as DocsLayoutImpl } from "fumadocs-ui/layouts/docs";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return <DocsLayoutImpl {...docsOptions}>{children}</DocsLayoutImpl>;
}
