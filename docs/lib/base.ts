import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/source";
import type { RegistryBase } from "@/registry";

type PageType = InferPageType<typeof source>;

export function getHasBothBases({
  url,
  base,
  allPages,
}: {
  url: string;
  base: RegistryBase | undefined;
  allPages: PageType[];
}): boolean {
  if (!base) return false;

  const isComponentOrUtility =
    url.startsWith("/docs/components/") || url.startsWith("/docs/utilities/");
  if (!isComponentOrUtility) return false;

  const componentName = url.split("/").pop();
  if (!componentName) return false;

  const otherBase = base === "radix" ? "base" : "radix";

  const prefix = url.startsWith("/docs/components/")
    ? "/docs/components/"
    : "/docs/utilities/";

  return allPages.some(
    (p) => p.url === `${prefix}${otherBase}/${componentName}`,
  );
}
