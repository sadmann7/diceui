import { HomeLayout } from "fumadocs-ui/layouts/home";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";

export default function IndexPage() {
  return (
    <HomeLayout
      nav={{
        title: siteConfig.name,
        url: siteConfig.links.github,
      }}
      links={[{ text: "Docs", url: siteConfig.links.docs }]}
    >
      <section className="container flex flex-col items-center justify-center gap-6 pt-6 pb-8 md:py-10">
        <div className="max-w-5xl space-y-8">
          <h1
            className="animate-fade-up text-balance bg-gradient-to-br from-foreground/80 to-muted-foreground bg-clip-text text-center font-bold font-heading text-5xl/[3rem] text-transparent opacity-0 drop-shadow-sm md:text-7xl/[5rem]"
            style={{ animationDelay: "0.20s", animationFillMode: "forwards" }}
          >
            {siteConfig.name}
          </h1>
          <p
            className="animate-fade-up text-balance text-center text-muted-foreground/80 opacity-0 md:text-xl"
            style={{ animationDelay: "0.30s", animationFillMode: "forwards" }}
          >
            {siteConfig.description}
          </p>
          <div
            className="flex animate-fade-up justify-center gap-4 opacity-0"
            style={{ animationDelay: "0.40s", animationFillMode: "forwards" }}
          >
            <Button asChild>
              <Link href={siteConfig.links.docs}>Documentation</Link>
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
    </HomeLayout>
  );
}
