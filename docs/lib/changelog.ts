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

export function getChangelogToc() {
  return getChangelogPages().map((page) => ({
    title: page.data.title,
    url: `#${page.slugs[page.slugs.length - 1]}`,
    depth: 2,
  }));
}
