import { HomeLayout } from "fumadocs-ui/layouts/home";

import { SiteFooter } from "@/components/site-footer";
import { baseOptions } from "@/config/layout";
import {
  MAIN_CONTENT_ID,
  SkipNav,
} from "@/registry/bases/radix/components/skip-nav";

export default function IndexLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SkipNav />
      <HomeLayout {...baseOptions}>
        <main id={MAIN_CONTENT_ID} className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </HomeLayout>
    </div>
  );
}
