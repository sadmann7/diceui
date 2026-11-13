import { ArrowRight, LayoutGrid } from "lucide-react";
import Link from "next/link";

import { KanbanWindow } from "@/components/lobby/kanban-window";
import { SITE_DESCRIPTION } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/styles/radix-nova/ui/button";

const FADE_UP =
  "animate-fade-up opacity-0 [animation-duration:400ms] [animation-fill-mode:forwards] [animation-timing-function:cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none motion-reduce:opacity-100";

export function Hero() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto flex max-w-[1248px] flex-col items-center gap-16 px-6 pt-16 pb-[72px] md:pt-24">
        <div className="flex flex-col items-center text-center">
          <Link
            href="/docs/components/base/query-builder"
            className={cn(
              FADE_UP,
              "group flex items-center gap-2 rounded-full border bg-card py-1 ps-1 pe-3 text-[13px] whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
            )}
          >
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              New
            </span>
            <span>
              Query Builder and Presentation
              <span className="hidden sm:inline"> just landed</span>
            </span>
            <ArrowRight className="size-[13px] text-muted-foreground/70 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
          <h1
            className={cn(
              FADE_UP,
              "pt-7 text-[40px] leading-[1.06] font-semibold tracking-[-0.04em] [animation-delay:60ms] sm:text-5xl md:text-[66px]",
            )}
          >
            Composable components
            <br />
            <span className="text-muted-foreground">for shadcn/ui</span>
          </h1>
          <p
            className={cn(
              FADE_UP,
              "max-w-[600px] pt-6 text-base leading-[1.55] text-muted-foreground [animation-delay:120ms] md:text-lg",
            )}
          >
            {SITE_DESCRIPTION}
          </p>
          <div
            className={cn(
              FADE_UP,
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
        <div className={cn(FADE_UP, "w-full [animation-delay:240ms]")}>
          <KanbanWindow />
        </div>
      </div>
    </section>
  );
}
