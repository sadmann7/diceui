"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxLoading,
  ComboboxTrigger,
} from "@/registry/bases/radix/ui/combobox";

const tricks = [
  { label: "Kickflip", value: "kickflip" },
  { label: "Heelflip", value: "heelflip" },
  { label: "Tre Flip", value: "tre-flip" },
  { label: "FS 540", value: "fs-540" },
  { label: "Casper flip 360 flip", value: "casper-flip-360-flip" },
  { label: "Kickflip Backflip", value: "kickflip-backflip" },
  { label: "360 Varial McTwist", value: "360-varial-mc-twist" },
  { label: "The 900", value: "the-900" },
];

export default function ComboboxDebouncedDemo() {
  const [value, setValue] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [filteredItems, setFilteredItems] = React.useState(tricks);

  // Debounce search with loading simulation
  const debouncedSearch = React.useCallback(
    debounce(async (searchTerm: string) => {
      setIsLoading(true);
      setProgress(0);

      // Simulate a more realistic progress pattern
      const progressSteps = [15, 35, 65, 85, 95] as const;
      let currentStepIndex = 0;

      const interval = setInterval(() => {
        if (currentStepIndex < progressSteps.length) {
          setProgress(progressSteps[currentStepIndex] ?? 0);
          currentStepIndex++;
        }
      }, 150);

      // Simulate API delay with variable timing
      const delay = Math.random() * 300 + 400; // Random delay between 400-700ms
      await new Promise((resolve) => setTimeout(resolve, delay));

      const results = tricks.filter((trick) =>
        trick.label.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      setFilteredItems(results);
      setProgress(100);
      setIsLoading(false);
      clearInterval(interval);
    }, 300),
    [],
  );

  const onInputValueChange = React.useCallback(
    (value: string) => {
      setSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  return (
    <Combobox
      value={value}
      onValueChange={setValue}
      inputValue={search}
      onInputValueChange={onInputValueChange}
      manualFiltering
    >
      <ComboboxLabel>Trick</ComboboxLabel>
      <ComboboxAnchor>
        <ComboboxInput placeholder="Search trick..." />
        <ComboboxTrigger>
          <ChevronDown className="h-4 w-4" />
        </ComboboxTrigger>
      </ComboboxAnchor>
      <ComboboxContent>
        {isLoading ? (
          <ComboboxLoading value={progress} label="Searching tricks..." />
        ) : null}
        <ComboboxEmpty keepVisible={!isLoading && filteredItems.length === 0}>
          No trick found.
        </ComboboxEmpty>
        {!isLoading &&
          filteredItems.map((trick) => (
            <ComboboxItem key={trick.value} value={trick.value} outset>
              {trick.label}
            </ComboboxItem>
          ))}
      </ComboboxContent>
    </Combobox>
  );
}

function debounce<TFunction extends (...args: never[]) => unknown>(
  func: TFunction,
  wait: number,
): (...args: Parameters<TFunction>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: unknown, ...args: Parameters<TFunction>): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}
