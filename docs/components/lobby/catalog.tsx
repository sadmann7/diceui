import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { LivePreview, type PreviewName } from "@/components/lobby/live-preview";
import { cn } from "@/lib/utils";

interface Tile {
  name: string;
  hint: string;
  slug: PreviewName;
  isNew?: boolean;
  className?: string;
}

const tiles: Tile[] = [
  {
    name: "Action Bar",
    hint: "Act on a selection",
    slug: "action-bar",
    isNew: true,
    className: "md:col-span-2",
  },
  { name: "Gauge", hint: "Show a value against a range", slug: "gauge" },
  {
    name: "File Upload",
    hint: "Drop, track and remove files",
    slug: "file-upload",
  },
  {
    name: "Color Picker",
    hint: "Pick from the area or type a hex",
    slug: "color-picker",
  },
  { name: "Stepper", hint: "Guide users step by step", slug: "stepper" },
  {
    name: "Command Stack",
    hint: "Nested pages in one palette",
    slug: "command-stack",
    isNew: true,
  },
  {
    name: "Data Grid",
    hint: "Edit cells from the keyboard",
    slug: "data-grid",
    className: "lg:col-span-2",
  },
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
                "flex h-90 flex-col overflow-hidden rounded-[14px] border bg-card dark:bg-card/40",
                tile.className,
              )}
            >
              <Link
                href={`/docs/components/base/${tile.slug}`}
                className="group flex items-center justify-between gap-4 border-b px-4 py-[13px]"
              >
                <span className="shrink-0 font-mono text-[10px] tracking-[0.09em] text-muted-foreground uppercase transition-colors group-hover:text-foreground">
                  {tile.name}
                </span>
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="truncate text-xs text-muted-foreground">
                    {tile.hint}
                  </span>
                  {tile.isNew ? (
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 font-mono text-[9px] leading-3 text-emerald-700 dark:text-emerald-300">
                      NEW
                    </span>
                  ) : null}
                  <ArrowUpRight className="size-[13px] shrink-0 text-muted-foreground transition-[color,translate] group-hover:translate-x-px group-hover:-translate-y-px group-hover:text-foreground motion-reduce:transition-none" />
                </span>
              </Link>
              <LivePreview name={tile.slug} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
