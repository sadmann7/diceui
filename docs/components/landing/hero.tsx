import { ArrowRight, LayoutGrid } from "lucide-react";
import Link from "next/link";

import { KanbanWindow } from "@/components/landing/kanban-window";
import { cn } from "@/lib/utils";
import { Button } from "@/styles/radix-nova/ui/button";

const enter =
  "animate-fade-up opacity-0 [animation-duration:400ms] [animation-fill-mode:forwards] [animation-timing-function:cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none motion-reduce:opacity-100";

export function Hero() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto flex max-w-[1248px] flex-col items-center gap-16 px-6 pt-16 pb-[72px] md:pt-24">
        <div className="flex flex-col items-center text-center">
          <Link
            href="/docs/components/base/query-builder"
            className={cn(
              enter,
              "flex items-center gap-[9px] rounded-full border bg-card px-[11px] py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground",
            )}
          >
            <span className="size-[5px] rounded-full bg-emerald-500" />
            <span className="font-mono text-xs tracking-wide text-emerald-700 dark:text-emerald-300">
              NEW
            </span>
            <span className="h-2.5 w-px bg-border" />
            Query Builder and Presentation just landed
            <ArrowRight className="size-[13px]" />
          </Link>
          <h1
            className={cn(
              enter,
              "pt-7 text-[40px] leading-[1.06] font-semibold tracking-[-0.04em] [animation-delay:60ms] sm:text-5xl md:text-[66px]",
            )}
          >
            Composable components
            <br />
            <span className="text-muted-foreground">for shadcn/ui</span>
          </h1>
          <p
            className={cn(
              enter,
              "max-w-[600px] pt-6 text-base leading-[1.55] text-muted-foreground [animation-delay:120ms] md:text-lg",
            )}
          >
            Accessible components built with React, TypeScript and Tailwind CSS.
            Copy-paste ready and fully customizable.
          </p>
          <div
            className={cn(
              enter,
              "flex flex-wrap justify-center gap-2.5 pt-8 [animation-delay:180ms]",
            )}
          >
            <Button asChild>
              <Link href="/docs">
                Get started
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/docs/components">
                <LayoutGrid data-icon="inline-start" />
                View components
              </Link>
            </Button>
          </div>
        </div>
        <div className={cn(enter, "w-full [animation-delay:240ms]")}>
          <KanbanWindow />
        </div>
      </div>
    </section>
  );
}
