import { HomeLayout } from "fumadocs-ui/layouts/home";

import { Icons } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { baseOptions } from "@/config/layout";
import { GITHUB_URL } from "@/lib/site";
import {
  MAIN_CONTENT_ID,
  SkipNav,
} from "@/registry/bases/radix/components/skip-nav";

export default function IndexLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-screen flex-col [&_#nd-home-layout]:[--fd-layout-width:1232px]">
      <SkipNav />
      <HomeLayout
        {...baseOptions}
        slots={{ themeSwitch: false }}
        searchToggle={{
          full: {
            className:
              "w-full max-w-[220px] rounded-lg ps-2.5 [&>div]:gap-0 [&>div]:rounded-sm [&>div]:border [&>div]:bg-fd-background [&>div]:px-1.5 [&_kbd]:border-0 [&_kbd]:bg-transparent [&_kbd]:px-0",
          },
        }}
        links={[
          { text: "Docs", url: "/docs", active: "none" },
          { text: "Components", url: "/docs/components" },
          {
            type: "custom",
            secondary: true,
            children: (
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="inline-flex size-8 items-center justify-center rounded-md text-fd-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
              >
                <Icons.gitHub className="size-4.5" />
              </a>
            ),
          },
          {
            type: "custom",
            secondary: true,
            children: <ThemeToggle />,
          },
        ]}
      >
        <main id={MAIN_CONTENT_ID} className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </HomeLayout>
    </div>
  );
}
