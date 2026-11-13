import { ArrowRight, LayoutGrid } from "lucide-react";
import Link from "next/link";

import { KanbanWindow } from "@/components/landing/kanban-window";
import { Button } from "@/styles/radix-nova/ui/button";

export function Hero() {
  return (
    <section className="overflow-hidden">
      <div className="mx-auto flex max-w-[1248px] flex-col items-center gap-16 px-6 pt-16 pb-[72px] md:pt-24">
        <div className="flex flex-col items-center text-center">
          <Link
            href="/docs/components/base/query-builder"
            className="flex animate-fade-up items-center gap-[9px] rounded-full border bg-card px-[11px] py-1.5 text-[13px] text-muted-foreground opacity-0 transition-colors [animation-fill-mode:forwards] hover:text-foreground"
          >
            <span className="size-[5px] rounded-full bg-emerald-500" />
            <span className="font-mono text-xs tracking-wide text-emerald-700 dark:text-emerald-300">
              NEW
            </span>
            <span className="h-2.5 w-px bg-border" />
            Query Builder and Presentation just landed
            <ArrowRight className="size-[13px]" />
          </Link>
          <h1 className="animate-fade-up pt-7 text-[40px] leading-[1.06] font-semibold tracking-[-0.04em] opacity-0 [animation-delay:0.1s] [animation-fill-mode:forwards] sm:text-5xl md:text-[66px]">
            Composable components
            <br />
            <span className="text-muted-foreground">for shadcn/ui</span>
          </h1>
          <p className="max-w-[600px] animate-fade-up pt-6 text-base leading-[1.55] text-muted-foreground opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards] md:text-lg">
            Accessible components built with React, TypeScript and Tailwind CSS.
            Copy-paste ready and fully customizable.
          </p>
          <div className="flex animate-fade-up flex-wrap justify-center gap-2.5 pt-8 opacity-0 [animation-delay:0.3s] [animation-fill-mode:forwards]">
            <Button size="lg" asChild>
              <Link href="/docs">
                Get started
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs/components">
                <LayoutGrid />
                View components
              </Link>
            </Button>
          </div>
        </div>
        <KanbanWindow />
      </div>
    </section>
  );
}
