"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { useDeferredValue } from "react";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxTrigger,
} from "@/registry/bases/radix/ui/combobox";

interface Option {
  label: string;
  value: string;
}

const categories = [
  "Flip",
  "Grind",
  "Slide",
  "Grab",
  "Manual",
  "Transition",
  "Old School",
] as const;

const variations = [
  "Regular",
  "Switch",
  "Nollie",
  "Fakie",
  "360",
  "Double",
  "Late",
] as const;

type Category = (typeof categories)[number];
type Variation = (typeof variations)[number];

const generateItems = (count: number): Option[] => {
  return Array.from({ length: count }, (_, i) => {
    const category: Category = categories[i % categories.length] ?? "Flip";
    const variation: Variation = variations[i % variations.length] ?? "Regular";
    const trickNumber = Math.floor(i / categories.length) + 1;

    return {
      label: `${variation} ${category} ${trickNumber}`,
      value: `trick-${i + 1}`,
    };
  });
};

const items = generateItems(10000);

export default function ComboboxVirtualizedDemo() {
  const [content, setContent] =
    React.useState<React.ComponentRef<"div"> | null>(null);
  const [value, setValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const deferredInputValue = useDeferredValue(inputValue);

  const filteredTricks = React.useMemo(() => {
    if (!deferredInputValue) return items;
    const normalized = deferredInputValue.toLowerCase();
    return items.filter((item) =>
      item.label.toLowerCase().includes(normalized),
    );
  }, [deferredInputValue]);

  const virtualizer = useVirtualizer({
    count: filteredTricks.length,
    getScrollElement: () => content,
    estimateSize: () => 32,
    overscan: 20,
  });

  const onInputValueChange = React.useCallback(
    (value: string) => {
      setInputValue(value);
      if (content) {
        content.scrollTop = 0; // Reset scroll position
        virtualizer.measure();
      }
    },
    [content, virtualizer],
  );

  // Re-measure virtualizer when filteredItems changes
  React.useEffect(() => {
    if (content) {
      virtualizer.measure();
    }
  }, [content, virtualizer]);

  return (
    <Combobox
      value={value}
      onValueChange={setValue}
      inputValue={inputValue}
      onInputValueChange={onInputValueChange}
      manualFiltering
    >
      <ComboboxLabel>Trick</ComboboxLabel>
      <ComboboxAnchor>
        <ComboboxInput placeholder="Search tricks..." />
        <ComboboxTrigger>
          <ChevronDown className="h-4 w-4" />
        </ComboboxTrigger>
      </ComboboxAnchor>
      <ComboboxContent
        ref={(node) => setContent(node)}
        className="relative max-h-[300px] overflow-y-auto overflow-x-hidden"
      >
        <ComboboxEmpty>No tricks found.</ComboboxEmpty>
        <div
          className="relative w-full"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const trick = filteredTricks[virtualItem.index];
            if (!trick) return null;

            return (
              <ComboboxItem
                key={virtualItem.key}
                value={trick.value}
                className="absolute top-0 left-0 w-full"
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                outset
              >
                {trick.label}
              </ComboboxItem>
            );
          })}
        </div>
      </ComboboxContent>
    </Combobox>
  );
}
