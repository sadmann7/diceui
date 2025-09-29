import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/registry/default/ui/marquee";

const images = [
  "https://picsum.photos/300/400?random=1",
  "https://picsum.photos/300/400?random=2",
  "https://picsum.photos/300/400?random=3",
  "https://picsum.photos/300/400?random=4",
  "https://picsum.photos/300/400?random=5",
  "https://picsum.photos/300/400?random=6",
  "https://picsum.photos/300/400?random=7",
  "https://picsum.photos/300/400?random=8",
];

export default function Marquee3DDemo() {
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <Marquee
        pauseOnHover
        className="[--duration:20s] [perspective:1000px] [transform-style:preserve-3d]"
      >
        <MarqueeContent>
          {images.map((src, index) => (
            <MarqueeItem key={index}>
              <div
                className="relative h-60 w-40 cursor-pointer overflow-hidden rounded-xl border shadow-2xl transition-all duration-300 hover:scale-[1.05] hover:[transform:rotateY(15deg)_rotateX(15deg)]"
                style={{
                  transform: `rotateY(${index * 2}deg) rotateX(${index}deg)`,
                }}
              >
                {/** biome-ignore lint/performance/noImgElement: dynamic image */}
                <img
                  src={src}
                  alt={`${index + 1} alt`}
                  className="h-full w-full object-cover"
                />
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
