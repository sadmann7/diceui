import { docsOptions } from "@/config/layout";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function RootDocsLayout({ children }: DocsLayoutProps) {
  return <DocsLayout {...docsOptions}>{children}</DocsLayout>;
}
