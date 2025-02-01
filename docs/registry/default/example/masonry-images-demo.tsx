"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import * as Masonry from "@/registry/default/ui/masonry";
import Image from "next/image";
import * as React from "react";

const images = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1682687982501-1e58ab814714",
    alt: "Skateboarder doing a trick",
    width: 1920,
    height: 2880,
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1621544402532-78c290378588",
    alt: "Skateboarder on a ramp",
    width: 1920,
    height: 1280,
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1621544402532-78c290378588",
    alt: "Skateboarder in the air",
    width: 1920,
    height: 2400,
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e",
    alt: "Skateboarder doing a grind",
    width: 1920,
    height: 1440,
  },
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1513183881046-a5fa074c681d",
    alt: "Skateboarder at sunset",
    width: 1920,
    height: 3200,
  },
  {
    id: "6",
    src: "https://images.unsplash.com/photo-1621544402532-78c290378588",
    alt: "Skateboarder in motion",
    width: 1920,
    height: 1920,
  },
];

export default function MasonryImagesDemo() {
  const [loadedImages, setLoadedImages] = React.useState<Set<string>>(
    new Set(),
  );

  const onLoad = React.useCallback((id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  }, []);

  return (
    <Masonry.Root
      columnCount={{
        initial: 2,
        sm: 2,
        md: 3,
        lg: 4,
      }}
      gap={16}
    >
      {images.map((image) => (
        <Masonry.Item
          key={image.id}
          fallback={
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
              <Skeleton className="absolute inset-0" />
            </div>
          }
        >
          <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={image.src}
              alt={image.alt}
              className={cn(
                "object-cover transition-all duration-300 group-hover:scale-105",
                loadedImages.has(image.id) ? "opacity-100" : "opacity-0",
              )}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              onLoad={() => onLoad(image.id)}
              priority={Number.parseInt(image.id) <= 4}
            />
          </div>
        </Masonry.Item>
      ))}
    </Masonry.Root>
  );
}
