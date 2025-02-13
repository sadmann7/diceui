"use client";

import { Shell } from "@/components/shell";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientOnly } from "@/registry/default/components/client-only";
import * as Masonry from "@/registry/default/ui/masonry";
import * as React from "react";

const ITEMS_PER_PAGE = 50;
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
      { root: null, rootMargin: "0px", threshold: 0.1 },
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

  console.log({ isLoading, hasMore, items });

  return (
    <Shell className="relative min-h-screen">
      <ClientOnly fallback={<Skeleton className="size-full" />}>
        <div className="flex flex-col gap-8">
          <Masonry.Root
            columnCount={{ initial: 1, sm: 2, md: 3, lg: 4 }}
            gap={10}
            overscan={6}
          >
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
          </Masonry.Root>
          {hasMore && (
            <div
              ref={loaderRef}
              className="flex w-full items-center justify-center py-8"
            >
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <div className="h-6 w-6" />
              )}
            </div>
          )}
        </div>
      </ClientOnly>
    </Shell>
  );
}
