import { DocsLayout as DocsLayoutImpl } from "fumadocs-ui/layouts/docs";
import { docsOptions } from "@/config/layout";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return <DocsLayoutImpl {...docsOptions}>{children}</DocsLayoutImpl>;
}
