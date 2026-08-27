import defaultComponents from "fumadocs-ui/mdx";
import Link from "next/link";

import { getChangelogPages } from "@/lib/changelog";
import { Separator } from "@/registry/bases/radix/ui/separator";

export function Changelogs() {
  const pages = getChangelogPages();

  return (
    <div className="flex flex-col">
      {pages.map((page) => {
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
                className="not-prose text-2xl font-semibold tracking-tight"
              >
                {page.data.title}
              </h2>
            </Link>
            {date && (
              <p className="not-prose mt-1 text-sm text-muted-foreground">
                {date}
              </p>
            )}
            <div className="dark:prose-invert prose mt-6 *:first:mt-0">
              <MDX components={defaultComponents} />
            </div>
            <Separator className="mt-12" />
          </article>
        );
      })}
    </div>
  );
}
