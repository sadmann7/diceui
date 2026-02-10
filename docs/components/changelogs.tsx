import { source } from "@/lib/source";

export function Changelogs() {
  const changelogPages = source
    .getPages()
    .filter(
      (page) =>
        page.url.startsWith("/docs/changelog/") &&
        page.url !== "/docs/changelog",
    )
    .sort((a, b) => {
      const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
      const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="flex flex-col gap-12">
      {changelogPages.map((page) => {
        const pageData = page.data as {
          date?: string;
          title: string;
          description?: string;
          body?: React.ComponentType;
        };
        const date = pageData.date
          ? new Date(pageData.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : null;

        return (
          <article key={page.url} className="flex flex-col gap-2">
            <h2 className="font-semibold text-2xl">{pageData.title}</h2>
            {date && <p className="text-muted-foreground text-sm">{date}</p>}
            {pageData.description && (
              <p className="text-muted-foreground">{pageData.description}</p>
            )}
            <div className="prose dark:prose-invert">
              {pageData.body && <pageData.body />}
            </div>
          </article>
        );
      })}
    </div>
  );
}
