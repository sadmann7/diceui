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

const tricks = Array.from({ length: 10000 }, (_, i) => ({
  label: `Trick ${i + 1}`,
  value: `trick-${i + 1}`,
}));

type Trick = (typeof tricks)[number];

function useVirtualCombobox(items: Trick[]) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => container,
    estimateSize: () => 36,
    overscan: 10,
    scrollPaddingStart: 8,
    scrollPaddingEnd: 8,
    getItemKey: (index) => items[index]?.value ?? `item-${index}`,
  });

  const scrollToValue = React.useCallback(
    (value: string) => {
      const index = items.findIndex((item) => item.value === value);
      if (index !== -1) {
        virtualizer.scrollToIndex(index, { align: "center" });
      }
    },
    [items, virtualizer],
  );

  const containerRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainer(node);
    }
  }, []);

  React.useEffect(() => {
    if (container) {
      virtualizer.measure();
    }
  }, [container, virtualizer]);

  return { virtualizer, scrollToValue, containerRef };
}

export default function ComboboxVirtualizedDemo() {
  const [value, setValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");

  const filteredTricks = React.useMemo(() => {
    if (!inputValue) return tricks;
    const normalized = inputValue.toLowerCase();
    return tricks.filter((trick) =>
      trick.label.toLowerCase().includes(normalized),
    );
  }, [inputValue]);

  const { virtualizer, scrollToValue, containerRef } =
    useVirtualCombobox(filteredTricks);

  return (
    <Combobox
      value={value}
      onValueChange={(value) => {
        setValue(value);
        requestAnimationFrame(() => {
          scrollToValue(value);
        });
      }}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      shouldFilter={false}
    >
      <ComboboxLabel>
        Virtual List ({filteredTricks.length.toLocaleString()} tricks)
      </ComboboxLabel>
      <ComboboxAnchor>
        <ComboboxInput placeholder="Search tricks..." />
        <ComboboxTrigger>
          <ChevronDown className="h-4 w-4" />
        </ComboboxTrigger>
      </ComboboxAnchor>
      <ComboboxContent>
        <div
          ref={containerRef}
          className="relative max-h-[300px] overflow-y-auto overflow-x-hidden"
        >
          {filteredTricks.length > 0 ? (
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
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    className="absolute top-0 left-0 w-full"
                    style={{
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <ComboboxItem value={trick.value}>
                      {trick.label}
                    </ComboboxItem>
                  </div>
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
