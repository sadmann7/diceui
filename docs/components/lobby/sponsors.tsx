import { ArrowUpRight, Plus } from "lucide-react";
import Image from "next/image";

import { SPONSOR_URL } from "@/lib/site";

const sponsors = [
  {
    name: "Shadcn Space",
    url: "https://shadcnspace.com",
    logo: "/sponsors/shadcnspace.svg",
    darkLogo: "/sponsors/shadcnspace-white.svg",
  },
];

const slotCount = 3;

export function Sponsors() {
  const openSlotCount = Math.max(slotCount - sponsors.length, 0);

  return (
    <section className="border-t bg-muted/40 dark:bg-transparent">
      <div className="mx-auto flex max-w-[1248px] flex-col gap-12 px-6 pt-[88px] pb-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3.5">
            <span className="font-mono text-xs tracking-[0.1em] text-muted-foreground">
              SPONSORS
            </span>
            <h2 className="text-3xl leading-[1.12] font-semibold tracking-[-0.035em] md:text-[40px]">
              Backed by the teams
              <br />
              who build with it.
            </h2>
          </div>
          <div className="flex flex-col gap-2.5 md:items-end">
            <p className="text-[15px] leading-normal text-muted-foreground md:text-right">
              Sponsorship funds new components,
              <br />
              accessibility work and docs.
            </p>
            <a
              href={SPONSOR_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-1.5 font-mono text-xs underline decoration-muted-foreground underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Become a sponsor
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>
        <ul className="grid divide-y overflow-hidden rounded-[14px] border md:grid-cols-3 md:divide-x md:divide-y-0">
          {sponsors.map((sponsor) => (
            <li key={sponsor.name} className="bg-card">
              <a
                href={sponsor.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-[148px] items-center justify-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
              >
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={147}
                  height={40}
                  className="h-10 w-auto dark:hidden"
                />
                <Image
                  src={sponsor.darkLogo}
                  alt={sponsor.name}
                  width={147}
                  height={40}
                  className="hidden h-10 w-auto dark:block"
                />
              </a>
            </li>
          ))}
          {Array.from({ length: openSlotCount }, (_, index) => (
            <li key={index}>
              <a
                href={SPONSOR_URL}
                target="_blank"
                rel="noreferrer"
                className="flex h-[148px] flex-col items-center justify-center gap-2 text-muted-foreground transition-colors outline-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
              >
                <span className="flex items-center gap-2 text-lg font-medium tracking-tight">
                  <Plus className="size-4" />
                  Your logo here
                </span>
                <span className="font-mono text-xs">Open sponsor slot</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
