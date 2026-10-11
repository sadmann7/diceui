import Link from "next/link";

import { useMdxComponents } from "@/components/mdx-components";
import {
  getChangelogPages,
  LATEST_CHANGELOG_COUNT,
  MORE_UPDATES_ID,
} from "@/lib/changelog";
import { DEFAULT_BASE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Separator } from "@/registry/bases/radix/ui/separator";

export function Changelogs() {
  const pages = getChangelogPages();
  const latestPages = pages.slice(0, LATEST_CHANGELOG_COUNT);
  const olderPages = pages.slice(LATEST_CHANGELOG_COUNT);
  const components = useMdxComponents({}, DEFAULT_BASE);

  return (
    <div className="flex flex-col">
      {latestPages.map((page, index) => {
        const MDX = page.data.body;
        const slug = page.slugs[page.slugs.length - 1];
        const date = page.date
          ? page.date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : null;

        return (
          <article key={page.url} className="mb-12">
            <Link href={page.url} className="no-underline hover:underline">
              <h2
                id={slug}
                className={cn(
                  "not-prose text-2xl font-semibold tracking-tight",
                  // The first entry scrolls to the top of the page, keeping the page description in view
                  index === 0 ? "scroll-mt-96" : "scroll-mt-20 md:scroll-mt-10",
                )}
              >
                {page.data.title}
              </h2>
            </Link>
            {date && (
              <p className="not-prose mt-1 text-sm text-muted-foreground">
                {date}
              </p>
            )}
            <div className="mt-6 *:first:mt-0">
              <MDX components={components} />
            </div>
            <Separator className="mt-12" />
          </article>
        );
      })}
      {olderPages.length > 0 && (
        <section className="not-prose">
          <h2
            id={MORE_UPDATES_ID}
            className="mb-6 scroll-mt-20 text-2xl font-semibold tracking-tight md:scroll-mt-10"
          >
            More Updates
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {olderPages.map((page) => {
              const [date, ...titleParts] = page.data.title.split(" - ");

              return (
                <Link
                  key={page.url}
                  href={page.url}
                  className="flex flex-col gap-0.5 rounded-lg border bg-card px-4 py-3 no-underline transition-colors hover:bg-muted/50"
                >
                  <span className="text-xs text-muted-foreground">{date}</span>
                  <span className="text-sm font-medium text-foreground">
                    {titleParts.join(" - ")}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
