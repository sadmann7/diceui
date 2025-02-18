"use client";

import { Shell } from "@/components/shell";
import * as Masonry from "@/registry/default/ui/masonry";
import { Masonry as MasonryThree } from "@/registry/default/ui/masonry/masonry";
import * as MasonryFour from "@/registry/default/ui/masonry/masonry-combined";
import { Loader } from "lucide-react";
import { Masonry as MasonryTwo } from "masonic";
import * as React from "react";

const ITEMS_PER_PAGE = 2000;
const MAX_ITEMS = 2000;

export default function MasonryPage() {
  const [items, setItems] = React.useState(() =>
    Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({
      id: index,
      height: Math.random() * 100 + 100,
    })),
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const loaderRef = React.useRef<HTMLDivElement>(null);

  const loadMore = React.useCallback(() => {
    if (isLoading || !hasMore) return;
    console.log("Loading more items...");

    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setItems((currentItems) => {
        console.log("Current items length:", currentItems.length);
        const newItems = Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({
          id: currentItems.length + index,
          height: Math.random() * 100 + 100,
        }));

        const updatedItems = [...currentItems, ...newItems];
        console.log("Updated items length:", updatedItems.length);

        if (updatedItems.length >= MAX_ITEMS) {
          setHasMore(false);
        }

        return updatedItems.slice(0, MAX_ITEMS);
      });
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting) {
          loadMore();
        }
      },
      { root: null, rootMargin: "60px", threshold: 0.1 },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loadMore]);

  return (
    <Shell>
      <div className="flex flex-col gap-8">
        {/* <Masonry.Root columnCount={4} gap={10} overscan={6}>
          {items.map((item) => (
            <Masonry.Item key={item.id} asChild>
              <div
                className="rounded-md bg-accent p-4"
                style={{ height: item.height }}
              >
                {item.id + 1}
              </div>
            </Masonry.Item>
          ))}
        </Masonry.Root> */}
        {/* <MasonryTwo
          items={items}
          overscanBy={6}
          columnGutter={10}
          render={({ data }) => (
            <div
              className="rounded-md bg-accent p-4"
              style={{ height: data.height }}
            >
              {data.id + 1}
            </div>
          )}
        /> */}
        {/* <MasonryThree
          items={items}
          columnWidth={200}
          columnGutter={10}
          overscanBy={6}
          render={({ data }) => (
            <div
              className="rounded-md bg-accent p-4"
              style={{ height: data.height }}
            >
              {data.id + 1}
            </div>
          )}
        /> */}
        {/* <MasonryFour.Masonry
          items={items}
          columnWidth={200}
          columnGutter={10}
          overscanBy={6}
          render={({ data }) => (
            <div
              className="rounded-md bg-accent p-4"
              style={{ height: data.height }}
            >
              {data.id + 1}
            </div>
          )}
        /> */}
        <MasonryFour.Root columnGutter={10} overscanBy={6}>
          <MasonryFour.Viewport>
            {items.map((item, index) => (
              <MasonryFour.Item key={item.id} index={index}>
                <div
                  className="rounded-md bg-accent p-4"
                  style={{ height: item.height }}
                >
                  {item.id + 1}
                </div>
              </MasonryFour.Item>
            ))}
          </MasonryFour.Viewport>
        </MasonryFour.Root>
        {hasMore && (
          <div
            ref={loaderRef}
            className="flex w-full items-center justify-center py-8"
          >
            {isLoading ? (
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="h-6 w-6" />
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
