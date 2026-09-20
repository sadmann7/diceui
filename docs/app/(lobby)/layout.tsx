import { HomeLayout } from "fumadocs-ui/layouts/home";

import { SiteFooter } from "@/components/site-footer";
import { baseOptions } from "@/config/layout";

export default function IndexLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <HomeLayout {...baseOptions}>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </HomeLayout>
    </div>
  );
}
