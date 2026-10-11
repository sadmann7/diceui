import type { Folder, Node } from "fumadocs-core/page-tree";

import Link from "next/link";

import type { RegistryBase } from "@/registry/registry";

import {
  MdxTabs,
  MdxTabsContent,
  MdxTabsList,
  MdxTabsTrigger,
} from "@/components/mdx-tabs";
import { NewBadge } from "@/components/new-badge";
import { DEFAULT_BASE } from "@/lib/constants";
import { source } from "@/lib/source";

type Section = "components" | "utilities";

const bases: { label: string; value: RegistryBase }[] = [
  { label: "Base UI", value: "base" },
  { label: "Radix UI", value: "radix" },
];

function findSectionFolder(nodes: Node[], section: Section): Folder | null {
  for (const node of nodes) {
    if (node.type !== "folder") continue;
    if (node.index?.url === `/docs/${section}`) return node;

    const folder = findSectionFolder(node.children, section);
    if (folder) return folder;
  }

  return null;
}

function getPages(section: Section, base: RegistryBase) {
  const folder = findSectionFolder(source.getPageTree().children, section);
  if (!folder) return [];

  const urls: string[] = [];
  function collect(nodes: Node[]) {
    for (const node of nodes) {
      if (node.type === "page") urls.push(node.url);
      if (node.type === "folder") collect(node.children);
    }
  }
  collect(folder.children);

  return urls
    .filter((url) => url.startsWith(`/docs/${section}/${base}/`))
    .map((url) => source.getPage(url.split("/").slice(2)))
    .filter((page) => page !== undefined);
}

interface ComponentListProps {
  section?: Section;
}

export function ComponentList({ section = "components" }: ComponentListProps) {
  return (
    <MdxTabs
      variant="line"
      defaultValue={DEFAULT_BASE}
      className="not-prose *:data-[slot=tabs-list]:gap-6"
    >
      <MdxTabsList>
        {bases.map((base) => (
          <MdxTabsTrigger key={base.value} value={base.value}>
            {base.label}
          </MdxTabsTrigger>
        ))}
      </MdxTabsList>
      {bases.map((base) => (
        <MdxTabsContent key={base.value} value={base.value} className="pt-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {getPages(section, base.value).map((page) => (
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
        </MdxTabsContent>
      ))}
    </MdxTabs>
  );
}
