import type { Node } from "fumadocs-core/page-tree";

import Link from "next/link";

import { NewBadge } from "@/components/new-badge";
import { DEFAULT_BASE } from "@/lib/constants";
import { source } from "@/lib/source";

type Group = "components" | "utilities";

function getPages(group: Group) {
  const urls: string[] = [];
  function collect(nodes: Node[]) {
    for (const node of nodes) {
      if (node.type === "page") urls.push(node.url);
      if (node.type === "folder") collect(node.children);
    }
  }
  collect(source.getPageTree().children);

  return urls
    .filter((url) => url.startsWith(`/docs/${group}/${DEFAULT_BASE}/`))
    .map((url) => source.getPage(url.split("/").slice(2)))
    .filter((page) => page !== undefined);
}

interface ComponentListProps {
  group?: Group;
}

export function ComponentList({ group = "components" }: ComponentListProps) {
  return (
    <div className="not-prose grid grid-cols-2 gap-4 sm:grid-cols-3">
      {getPages(group).map((page) => (
        <Link
          key={page.url}
          href={page.url}
          className="inline-flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          {page.data.title}
          {page.data.new ? <NewBadge /> : null}
        </Link>
      ))}
    </div>
  );
}
