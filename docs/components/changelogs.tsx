import Link from "next/link";
import defaultComponents from "fumadocs-ui/mdx";
import { source } from "@/lib/source";

export function getChangelogPages() {
  return source
    .getPages()
    .filter(
      (page) =>
        page.url.startsWith("/docs/changelog/") &&
        page.url !== "/docs/changelog",
    )
    .map((page) => ({
      ...page,
      date: page.data.date ? new Date(page.data.date) : null,
    }))
    .sort((a, b) => {
      const dateA = a.date?.getTime() ?? 0;
      const dateB = b.date?.getTime() ?? 0;
      return dateB - dateA;
    });
}

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
          <article key={page.url} className="mb-12 border-b pb-12 last:border-b-0">
            <Link
              href={page.url}
              className="no-underline hover:underline"
            >
              <h2
                id={slug}
                className="not-prose font-semibold text-xl tracking-tight"
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
          </article>
        );
      })}
    </div>
  );
}
