"use client";

import { Shell } from "@/components/shell";
import { ClientOnly } from "@/registry/default/components/client-only";
import * as Masonry from "@/registry/default/ui/masonry";
import * as React from "react";
import { z } from "zod";

const imageSchema = z.object({
  id: z.string(),
  author: z.string(),
  width: z.number(),
  height: z.number(),
  url: z.string(),
  download_url: z.string(),
});

type PicsumImage = z.infer<typeof imageSchema> & {
  aspectRatio: string;
};

export default function MasonryPage() {
  // const [images, setImages] = React.useState<PicsumImage[]>([]);

  // React.useEffect(() => {
  //   async function fetchImages() {
  //     try {
  //       const response = await fetch(
  //         "https://picsum.photos/v2/list?page=1&limit=100",
  //       );
  //       const data: unknown = await response.json();

  //       const parsedData = imageSchema.array().safeParse(data);

  //       if (!parsedData.success) {
  //         throw new Error("Invalid data");
  //       }

  //       const images = parsedData.data.map((image) => ({
  //         ...image,
  //         aspectRatio:
  //           ["1/1", "4/3", "16/9", "1/2", "2/1"][
  //             Math.floor(Math.random() * 5)
  //           ] ?? "1/1",
  //       }));

  //       setImages(images);
  //     } catch (error) {
  //       console.error({ error });
  //     }
  //   }

  //   fetchImages();
  // }, []);

  const items = React.useMemo(() => {
    return Array.from({ length: 1000 }, (_, index) => ({
      id: index,
      height: Math.random() * 100 + 100,
    }));
  }, []);

  return (
    <Shell>
      <ClientOnly fallback={<div>Loading...</div>}>
        {/* <MasonryAlt
          items={items}
          columnGutter={12}
          overscanBy={6}
          render={({ data }) => (
            <div className="bg-accent" style={{ height: data.height }}>
              {data.id}
            </div>
          )}
        /> */}
        {/* <Masonry.Root
          columnCount={{ initial: 1, sm: 2, md: 3, lg: 4 }}
          gap={12}
          overscan={6}
          itemHeight={300}
        >
          {images.map((image) => (
            <Masonry.Item key={image.id}>
              <div
                className="relative overflow-hidden rounded-lg"
                style={{ aspectRatio: image.aspectRatio }}
              >
                <Image
                  src={image.download_url}
                  alt={image.author}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={85}
                  className="object-cover transition-all duration-300 hover:scale-105"
                  placeholder="blur"
                  blurDataURL={`https://picsum.photos/id/${image.id}/100/100`}
                />
              </div>
            </Masonry.Item>
          ))}
        </Masonry.Root> */}
        <Masonry.Root
          columnCount={{ initial: 1, sm: 2, md: 3, lg: 4 }}
          gap={10}
          overscan={6}
        >
          {items.map((item) => (
            <Masonry.Item key={item.id} asChild>
              <div className="bg-accent" style={{ height: item.height }}>
                {item.id}
              </div>
            </Masonry.Item>
          ))}
        </Masonry.Root>
      </ClientOnly>
    </Shell>
  );
}
