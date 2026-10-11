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

export const LATEST_CHANGELOG_COUNT = 5;

export const MORE_UPDATES_ID = "more-updates";

export function getChangelogToc() {
  const pages = getChangelogPages();
  const toc = pages.slice(0, LATEST_CHANGELOG_COUNT).map((page) => ({
    title: page.data.title,
    url: `#${page.slugs[page.slugs.length - 1]}`,
    depth: 2,
  }));

  if (pages.length > LATEST_CHANGELOG_COUNT) {
    toc.push({ title: "More Updates", url: `#${MORE_UPDATES_ID}`, depth: 2 });
  }

  return toc;
}
