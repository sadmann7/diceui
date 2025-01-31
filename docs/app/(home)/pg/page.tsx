"use client";

import { HydrationBoundary } from "@/components/hydration-boundary";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { tricks } from "@/lib/data";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "@/registry/default/ui/combobox";
import * as Masonry from "@/registry/default/ui/masonry";
import * as Mention from "@diceui/mention";
import { ChevronDown } from "lucide-react";
import { Masonry as MasonryAlt } from "masonic";
import * as React from "react";

export default function PlaygroundPage() {
  const items = React.useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i.toString(),
        content: `Item ${i + 1}`,
        height: Math.floor(Math.random() * 100) + 100,
      })),
    [],
  );

  return (
    <Shell>
      <HydrationBoundary fallback={<Skeleton className="h-svh w-full" />}>
        <MasonryAlt
          items={items}
          columnWidth={300}
          columnGutter={16}
          columnCount={3}
          render={({ data }) => (
            <div
              key={data.id}
              className="rounded-lg border bg-card p-4 text-card-foreground shadow"
              style={{
                height: data.height,
              }}
            >
              {data.content}
            </div>
          )}
        />
        <Masonry.Root columnCount={{ sm: 2, md: 3, lg: 4 }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border bg-card p-4 text-card-foreground shadow"
              style={{
                height: item.height,
              }}
            >
              {item.content}
            </div>
          ))}
        </Masonry.Root>
        <Textarea
          placeholder="Type here..."
          className="min-h-[80px] max-w-[40rem]"
        />
        <Mention.Root className="flex max-w-[40rem] flex-col gap-2 [&_[data-tag]]:rounded [&_[data-tag]]:bg-blue-200 [&_[data-tag]]:py-px [&_[data-tag]]:text-blue-950 dark:[&_[data-tag]]:bg-blue-800 dark:[&_[data-tag]]:text-blue-50">
          <Mention.Label>Tricks</Mention.Label>
          <Mention.Input
            placeholder="Enter @ to mention a trick..."
            className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-zinc-800 focus-visible:dark:ring-zinc-300"
            asChild
          >
            <textarea />
          </Mention.Input>
          <Mention.Portal>
            <Mention.Content className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 min-w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in">
              {tricks.map((trick) => (
                <Mention.Item
                  key={trick.value}
                  label={trick.label}
                  value={trick.value}
                  className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50"
                >
                  {trick.label}
                </Mention.Item>
              ))}
            </Mention.Content>
          </Mention.Portal>
        </Mention.Root>
        <Combobox className="w-[15rem]">
          <ComboboxAnchor>
            <ComboboxInput placeholder="Search tricks..." />
            <ComboboxTrigger>
              <ChevronDown className="h-4 w-4" />
            </ComboboxTrigger>
          </ComboboxAnchor>
          <ComboboxContent>
            <ComboboxEmpty>No tricks found</ComboboxEmpty>
            {tricks.map((trick) => (
              <ComboboxItem key={trick.value} value={trick.value}>
                {trick.label}
              </ComboboxItem>
            ))}
          </ComboboxContent>
        </Combobox>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-fit">
              Open
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Apple</DropdownMenuItem>
            <DropdownMenuItem>Banana</DropdownMenuItem>
            <DropdownMenuItem>Blueberry</DropdownMenuItem>
            <DropdownMenuItem>Grapes</DropdownMenuItem>
            <DropdownMenuItem>Pineapple</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Select>
          <SelectTrigger className="w-[11.25rem]">
            <SelectValue placeholder="Select a trick" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tricks</SelectLabel>
              {tricks.map((trick) => (
                <SelectItem key={trick.value} value={trick.value}>
                  {trick.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </HydrationBoundary>
    </Shell>
  );
}
