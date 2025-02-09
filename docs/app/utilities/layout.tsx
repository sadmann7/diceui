import { docsOptions } from "@/config/layout";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

interface UtilitiesLayoutProps {
  children: React.ReactNode;
}

export default function UtilitiesLayout({ children }: UtilitiesLayoutProps) {
  return <DocsLayout {...docsOptions}>{children}</DocsLayout>;
}
