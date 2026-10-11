import { HomeLayout } from "fumadocs-ui/layouts/home";

import { SiteFooter } from "@/components/site-footer";
import { baseOptions } from "@/config/layout";
import { SkipLink } from "@/registry/bases/radix/components/skip-link";

export default function IndexLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SkipLink />
      <HomeLayout {...baseOptions}>
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </HomeLayout>
    </div>
  );
}
