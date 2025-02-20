"use client";

import { Shell } from "@/components/shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as MasonryTwo from "@/registry/default/ui/masonry/masonry-alt";
import * as MasonryThree from "@/registry/default/ui/masonry/masonry-combined";
import { Loader } from "lucide-react";
import { Masonry as MasonryOne } from "masonic";
import * as React from "react";

const DEFAULT_ITEMS_PER_PAGE = 100;
const DEFAULT_MAX_ITEM_COUNT = 5000;

const ITEMS_PER_PAGE_OPTIONS = [50, 100, 500, 1000];
const MAX_ITEMS_OPTIONS = [1000, 5000, 10000, 20000];

export default function MasonryPage() {
  const [itemsPerPage, setItemsPerPage] = React.useState(
    DEFAULT_ITEMS_PER_PAGE,
  );
  const [maxItemCount, setMaxItemCount] = React.useState(
    DEFAULT_MAX_ITEM_COUNT,
  );
  const [items, setItems] = React.useState(() =>
    Array.from({ length: itemsPerPage }, (_, index) => ({
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
    setTimeout(() => {
      setItems((currentItems) => {
        console.log("Current items length:", currentItems.length);
        const newItems = Array.from({ length: itemsPerPage }, (_, index) => ({
          id: currentItems.length + index,
          height: Math.random() * 100 + 100,
        }));

        const updatedItems = [...currentItems, ...newItems];
        console.log("Updated items length:", updatedItems.length);

        if (updatedItems.length >= maxItemCount) {
          setHasMore(false);
        }

        return updatedItems.slice(0, maxItemCount);
      });
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, itemsPerPage, maxItemCount]);

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
        <div className="flex items-center gap-2 self-end">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              const numValue = Number.parseInt(value);
              setItemsPerPage(numValue);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select items per page" />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option} items/page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={maxItemCount.toString()}
            onValueChange={(value) => {
              const numValue = Number.parseInt(value);
              setMaxItemCount(numValue);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select max items" />
            </SelectTrigger>
            <SelectContent>
              {MAX_ITEMS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option} items
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
        {/* <MasonryTwo.Masonry
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
        <MasonryThree.Root gap={10} overscan={6}>
          {items.map((item) => (
            <MasonryThree.Item key={item.id} asChild>
              <div
                className="rounded-md bg-accent p-4"
                style={{ height: item.height }}
              >
                {item.id + 1}
              </div>
            </MasonryThree.Item>
          ))}
        </MasonryThree.Root>
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
