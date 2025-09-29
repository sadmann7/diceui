import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/registry/default/ui/marquee";

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Netflix",
  "YouTube",
  "Instagram",
  "Uber",
  "Spotify",
];

export default function MarqueeLogoDemo() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background py-20 md:shadow-xl">
      <div className="mb-8 flex flex-col items-center gap-4">
        <h3 className="font-semibold text-xl">Trusted by industry leaders</h3>
        <p className="max-w-md text-center text-muted-foreground">
          Join thousands of companies that rely on our platform for their
          business needs.
        </p>
      </div>

      <Marquee pauseOnHover className="[--duration:20s]">
        <MarqueeContent>
          {companies.map((company) => (
            <MarqueeItem key={company}>
              <div className="flex h-16 w-40 items-center justify-center rounded-xl border bg-white px-8 shadow-md dark:bg-gray-800">
                <span className="font-semibold text-gray-800 text-lg dark:text-gray-200">
                  {company}
                </span>
              </div>
            </MarqueeItem>
          ))}
        </MarqueeContent>
        <MarqueeFade side="left" />
        <MarqueeFade side="right" />
      </Marquee>
    </div>
  );
}
