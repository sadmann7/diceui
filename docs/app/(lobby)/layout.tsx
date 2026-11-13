import { HomeLayout } from "fumadocs-ui/layouts/home";
import Link from "next/link";

import { Icons } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { baseOptions } from "@/config/layout";
import { GITHUB_URL } from "@/lib/site";
import {
  MAIN_CONTENT_ID,
  SkipNav,
} from "@/registry/bases/radix/components/skip-nav";

const starsFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

async function getStars() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/sadmann7/diceui",
      { next: { revalidate: 86400 } },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { stargazers_count?: number };
    return data.stargazers_count ?? null;
  } catch {
    return null;
  }
}

export default async function IndexLayout({ children }: LayoutProps<"/">) {
  const stars = await getStars();

  return (
    <div className="relative flex min-h-screen flex-col">
      <SkipNav />
      <HomeLayout
        {...baseOptions}
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
                aria-label={
                  stars === null ? "GitHub" : `GitHub, ${stars} stars`
                }
                className="inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
              >
                <Icons.gitHub className="size-3.5" />
                {stars === null ? null : (
                  <span className="font-mono tabular-nums">
                    {starsFormatter.format(stars).toLowerCase()}
                  </span>
                )}
              </a>
            ),
          },
          {
            type: "custom",
            secondary: true,
            on: "nav",
            children: (
              <Link
                href="/docs"
                className="inline-flex h-8 items-center rounded-md bg-fd-primary px-3 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            ),
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
