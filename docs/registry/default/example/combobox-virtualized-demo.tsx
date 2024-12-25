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

const tricks = Array.from({ length: 10000 }, (_, i) => ({
  label: `Trick ${i + 1}`,
  value: `trick-${i + 1}`,
}));

export default function ComboboxVirtualizedDemo() {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const [value, setValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const deferredInputValue = useDeferredValue(inputValue);

  const filteredTricks = React.useMemo(() => {
    if (!deferredInputValue) return tricks;
    const normalized = deferredInputValue.toLowerCase();
    return tricks.filter((trick) =>
      trick.label.toLowerCase().includes(normalized),
    );
  }, [deferredInputValue]);

  const virtualizer = useVirtualizer({
    count: filteredTricks.length,
    getScrollElement: () => container,
    estimateSize: () => 36,
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

  // Re-measure virtualizer when filteredTricks changes
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
      shouldFilter={false}
    >
      <ComboboxLabel>
        Trick ({filteredTricks.length.toLocaleString()})
      </ComboboxLabel>
      <ComboboxAnchor>
        <ComboboxInput placeholder="Search tricks..." />
        <ComboboxTrigger>
          <ChevronDown className="h-4 w-4" />
        </ComboboxTrigger>
      </ComboboxAnchor>
      <ComboboxContent>
        <div
          ref={setContainer}
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
                  <ComboboxItem
                    key={virtualItem.key}
                    value={trick.value}
                    indicatorSide="right"
                    className="absolute top-0 left-0 w-full"
                    style={{
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    {trick.label}
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
