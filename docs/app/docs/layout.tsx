import { docsOptions } from "@/config/layout";
import { DocsLayout as DocsLayoutComp } from "fumadocs-ui/layouts/docs";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return <DocsLayoutComp {...docsOptions}>{children}</DocsLayoutComp>;
}
