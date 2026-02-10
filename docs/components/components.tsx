import Link from "next/link";

import { registries, type RegistryBase } from "@/registry";

function slugToTitle(slug: string): string {
  const special: Record<string, string> = {
    fps: "FPS",
    kbd: "Kbd",
    "qr-code": "QR Code",
  };
  if (special[slug]) return special[slug];
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getComponents(base: RegistryBase) {
  return registries[base].items
    .filter((item) => item.type === "registry:ui")
    .map((item) => ({ name: slugToTitle(item.name), slug: item.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

interface ComponentsProps {
  base?: RegistryBase;
}

export function Components({ base = "radix" }: ComponentsProps) {
  const components = getComponents(base);

  return (
    <div className="not-prose grid grid-cols-2 gap-4 sm:grid-cols-3">
      {components.map(({ name, slug }) => (
        <Link
          key={slug}
          href={`/docs/components/${base}/${slug}`}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
