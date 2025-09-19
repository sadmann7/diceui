import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function IndexPage() {
  return (
    <section className="container flex flex-col items-center justify-center gap-6 pt-6 pb-8 md:py-10">
      <div className="flex max-w-5xl flex-col items-center gap-4">
        <h1
          className="animate-fade-up text-balance bg-linear-to-br from-foreground/80 to-muted-foreground bg-clip-text text-center font-bold text-4xl/tight text-transparent leading-tight tracking-tighter opacity-0 drop-shadow-xs md:text-5xl/tight"
          style={{ animationDelay: "0.20s", animationFillMode: "forwards" }}
        >
          Accessible components for shadcn/ui
        </h1>
        <p
          className="max-w-2xl animate-fade-up text-balance text-center font-light text-lg text-muted-foreground opacity-0 md:text-xl"
          style={{ animationDelay: "0.30s", animationFillMode: "forwards" }}
        >
          {siteConfig.description}
        </p>
        <div
          className="flex animate-fade-up justify-center gap-4 pt-2 opacity-0"
          style={{ animationDelay: "0.40s", animationFillMode: "forwards" }}
        >
          <Button asChild>
            <Link href="/docs/components/angle-slider">View Components</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              target="_blank"
              rel="noreferrer"
              href={siteConfig.links.github}
            >
              GitHub
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
