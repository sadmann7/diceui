"use client";

import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxTrigger,
} from "@/registry/default/ui/combobox";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { useDeferredValue } from "react";

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
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const [value, setValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const deferredInputValue = useDeferredValue(inputValue);

  const filteredItems = React.useMemo(() => {
    if (!deferredInputValue) return items;
    const normalized = deferredInputValue.toLowerCase();
    return items.filter((item) =>
      item.label.toLowerCase().includes(normalized),
    );
  }, [deferredInputValue]);

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => container,
    estimateSize: () => 32,
    overscan: 20,
  });

  const onInputValueChange = React.useCallback(
    (value: string) => {
      setInputValue(value);
      if (container) {
        container.scrollTop = 0; // Reset scroll position
        virtualizer.measure();
      }
    },
    [container, virtualizer],
  );

  // Re-measure virtualizer when filteredItems changes
  React.useEffect(() => {
    if (container) {
      virtualizer.measure();
    }
  }, [container, virtualizer]);

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
        <ComboboxInput placeholder="Search items..." />
        <ComboboxTrigger>
          <ChevronDown className="h-4 w-4" />
        </ComboboxTrigger>
      </ComboboxAnchor>
      <ComboboxContent>
        <div
          ref={(node) => setContainer(node)}
          className="relative max-h-[300px] overflow-y-auto overflow-x-hidden"
        >
          {filteredItems.length > 0 ? (
            <div
              className="relative w-full"
              style={{
                height: `${virtualizer.getTotalSize()}px`,
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const item = filteredItems[virtualItem.index];
                if (!item) return null;

                return (
                  <ComboboxItem
                    key={virtualItem.key}
                    value={item.value}
                    indicatorSide="right"
                    className="absolute top-0 left-0 w-full"
                    style={{
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    {item.label}
                  </ComboboxItem>
                );
              })}
            </div>
          ) : (
            <ComboboxEmpty>No items found.</ComboboxEmpty>
          )}
        </div>
      </ComboboxContent>
    </Combobox>
  );
}
