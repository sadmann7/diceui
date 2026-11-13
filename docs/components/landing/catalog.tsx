import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import {
  LivePreview,
  type PreviewName,
} from "@/components/landing/live-preview";
import { cn } from "@/lib/utils";

interface Tile {
  name: string;
  slug: PreviewName;
  isNew?: boolean;
  className?: string;
}

const tiles: Tile[] = [
  {
    name: "Action Bar",
    slug: "action-bar",
    isNew: true,
    className: "md:col-span-2",
  },
  { name: "Gauge", slug: "gauge" },
  { name: "Tags Input", slug: "tags-input" },
  { name: "Cropper", slug: "cropper" },
  { name: "Stepper", slug: "stepper" },
  { name: "Command Stack", slug: "command-stack", isNew: true },
  { name: "Data Grid", slug: "data-grid", className: "lg:col-span-2" },
];

export function Catalog() {
  return (
    <section className="border-t bg-muted/40 dark:bg-transparent">
      <div className="mx-auto flex max-w-[1248px] flex-col gap-11 px-6 pt-20 pb-24">
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-xs tracking-[0.1em] text-muted-foreground">
            THE CATALOG
          </span>
          <h2 className="max-w-[16ch] text-3xl leading-[1.12] font-semibold tracking-[-0.035em] text-balance md:max-w-none md:text-[40px]">
            Components for the parts
            <br className="hidden md:block" /> nobody wants to build.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <div
              key={tile.slug}
              className={cn(
                "flex h-80 flex-col overflow-hidden rounded-[14px] border bg-card dark:bg-card/40",
                tile.className,
              )}
            >
              <div className="flex items-center justify-between border-b px-4 py-[13px]">
                <Link
                  href={`/docs/components/base/${tile.slug}`}
                  className="group flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-foreground/70 uppercase transition-colors hover:text-foreground"
                >
                  {tile.name}
                  <ArrowUpRight className="size-[13px] transition-transform group-hover:translate-x-px group-hover:-translate-y-px" />
                </Link>
                {tile.isNew ? (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[9px] text-emerald-700 dark:text-emerald-300">
                    NEW
                  </span>
                ) : null}
              </div>
              <LivePreview name={tile.slug} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
