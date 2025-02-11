"use client";

import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { Textarea } from "@/components/ui/textarea";
import { tricks } from "@/lib/data";
import { ClientOnly } from "@/registry/default/components/client-only";
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
import Image from "next/image";
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

export default function PlaygroundPage() {
  const [images, setImages] = React.useState<PicsumImage[]>([]);

  React.useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch(
          "https://picsum.photos/v2/list?page=1&limit=20",
        );
        const data: unknown = await response.json();

        const parsedData = imageSchema.array().safeParse(data);

        if (!parsedData.success) {
          throw new Error("Invalid data");
        }

        const images = parsedData.data.map((image) => ({
          ...image,
          aspectRatio:
            ["1/1", "4/3", "16/9", "1/2", "2/1"][
              Math.floor(Math.random() * 5)
            ] ?? "1/1",
        }));

        setImages(images);
      } catch (error) {
        console.error({ error });
      }
    }

    fetchImages();
  }, []);

  return (
    <Shell>
      <ClientOnly fallback={<div>Loading...</div>}>
        <Masonry.Root>
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
        </Masonry.Root>
      </ClientOnly>
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
      <Command className="max-w-[15rem] border">
        <CommandInput placeholder="Search tricks..." />
        <CommandEmpty>No tricks found.</CommandEmpty>
        <CommandList>
          <CommandGroup heading="Tricks">
            {tricks.map((trick) => (
              <CommandItem key={trick.value} value={trick.value}>
                {trick.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
      <Textarea
        placeholder="Type here..."
        className="min-h-[80px] max-w-[40rem]"
      />
      <Mention.Root className="flex max-w-[40rem] flex-col gap-2 **:data-tag:rounded **:data-tag:bg-blue-200 **:data-tag:py-px **:data-tag:text-blue-950 dark:**:data-tag:bg-blue-800 dark:**:data-tag:text-blue-50">
        <Mention.Label>Tricks</Mention.Label>
        <Mention.Input
          placeholder="Enter @ to mention a trick..."
          className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-zinc-500 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
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
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50"
              >
                {trick.label}
              </Mention.Item>
            ))}
          </Mention.Content>
        </Mention.Portal>
      </Mention.Root>
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
    </Shell>
  );
}
