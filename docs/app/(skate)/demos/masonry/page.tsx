"use client";

import { Check, ChevronDown, Loader } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Masonry, MasonryItem } from "@/registry/bases/radix/ui/masonry";

const DEFAULT_ITEMS_PER_PAGE = 100;
const DEFAULT_MAX_ITEM_COUNT = 5000;

const ITEMS_PER_PAGE_OPTIONS = [50, 100, 500, 1000];
const MAX_ITEMS_OPTIONS = [1000, 5000, 10000, 20000];

export default function MasonryPage() {
  const [linear, setLinear] = React.useState(false);
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

  const onLoadMore = React.useCallback(() => {
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
          onLoadMore();
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
  }, [onLoadMore]);

  return (
    <div className="container grid items-center gap-4 pt-6 pb-8 md:py-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="sticky top-8 z-10 ml-auto w-fit"
          >
            Layout
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Layout</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLinear(!linear)}>
            <span>Linear mode</span>
            {linear && <Check className="ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Items per page</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => setItemsPerPage(option)}
                  >
                    <span>{option} items</span>
                    {itemsPerPage === option && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Max items</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {MAX_ITEMS_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => setMaxItemCount(option)}
                  >
                    <span>{option} items</span>
                    {maxItemCount === option && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-col gap-8">
        <Masonry
          gap={10}
          overscan={6}
          linear={linear}
          fallback={<Skeleton className="h-dvh w-full" />}
        >
          {items.map((item) => (
            <MasonryItem key={item.id} asChild>
              <div
                className="flex items-center justify-center rounded-md bg-accent p-4"
                style={{ height: item.height }}
              >
                {item.id + 1}
              </div>
            </MasonryItem>
          ))}
        </Masonry>
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
    </div>
  );
}
