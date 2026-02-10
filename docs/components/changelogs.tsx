import defaultComponents from "fumadocs-ui/mdx";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getChangelogPages } from "@/lib/changelog";

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
                className="not-prose font-semibold text-2xl tracking-tight"
              >
                {page.data.title}
              </h2>
            </Link>
            {date && (
              <p className="not-prose mt-1 text-muted-foreground text-sm">
                {date}
              </p>
            )}
            <div className="prose dark:prose-invert mt-6 *:first:mt-0">
              <MDX components={defaultComponents} />
            </div>
            <Separator className="mt-12" />
          </article>
        );
      })}
    </div>
  );
}
