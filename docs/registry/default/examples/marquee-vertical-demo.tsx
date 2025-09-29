import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/registry/default/ui/marquee";

const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "This is amazing!",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "Love the design.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "So smooth and clean.",
    img: "https://avatar.vercel.sh/john",
  },
];

function ReviewCard({ img, name, username, body }: (typeof reviews)[number]) {
  return (
    <figure className="relative w-64 cursor-pointer overflow-hidden rounded-xl border border-gray-950/[.1] bg-gray-950/[.01] p-4 hover:bg-gray-950/[.05] dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]">
      <div className="flex flex-row items-center gap-2">
        {/** biome-ignore lint/performance/noImgElement: dynamic image */}
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="font-medium text-sm dark:text-white">
            {name}
          </figcaption>
          <p className="font-medium text-xs dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
}

export default function MarqueeVerticalDemo() {
  return (
    <div className="relative flex h-[500px] w-full flex-row items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <Marquee
        direction="up"
        pauseOnHover
        className="h-full justify-center [--duration:20s]"
      >
        <MarqueeContent>
          {reviews.map((review) => (
            <MarqueeItem key={review.username}>
              <ReviewCard {...review} />
            </MarqueeItem>
          ))}
        </MarqueeContent>
        <MarqueeFade side="top" />
        <MarqueeFade side="bottom" />
      </Marquee>

      <Marquee
        direction="down"
        pauseOnHover
        reverse
        className="h-full justify-center [--duration:20s]"
      >
        <MarqueeContent>
          {reviews.map((review) => (
            <MarqueeItem key={review.username}>
              <ReviewCard {...review} />
            </MarqueeItem>
          ))}
        </MarqueeContent>
        <MarqueeFade side="top" />
        <MarqueeFade side="bottom" />
      </Marquee>
    </div>
  );
}
