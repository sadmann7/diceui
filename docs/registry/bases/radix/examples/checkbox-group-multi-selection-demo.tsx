"use client";

import * as React from "react";
import {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupItem,
  CheckboxGroupLabel,
  CheckboxGroupList,
} from "@/registry/bases/radix/ui/checkbox-group";

const tricks = [
  { label: "Kickflip", value: "kickflip" },
  { label: "Heelflip", value: "heelflip" },
  { label: "Tre Flip", value: "tre-flip" },
  { label: "Pizza Guy", value: "pizza-guy" },
  { label: "FS 540", value: "fs-540" },
  { label: "The 900", value: "the-900" },
];

export default function CheckboxGroupMultiSelectionDemo() {
  const { value, onValueChange, onShiftKeyDown } = useShiftMultiSelect({
    items: tricks,
    getItemValue: (item) => item.value,
  });

  return (
    <CheckboxGroup value={value} onValueChange={onValueChange}>
      <CheckboxGroupLabel>Tricks</CheckboxGroupLabel>
      <CheckboxGroupDescription>
        Hold Shift and click to select multiple items
      </CheckboxGroupDescription>
      <CheckboxGroupList
        className="mt-1"
        onKeyDown={onShiftKeyDown}
        onKeyUp={onShiftKeyDown}
      >
        {tricks.map((trick) => (
          <CheckboxGroupItem key={trick.value} value={trick.value}>
            {trick.label}
          </CheckboxGroupItem>
        ))}
      </CheckboxGroupList>
    </CheckboxGroup>
  );
}

interface UseShiftMultiSelectProps<T> {
  /** The items for selection. */
  items: T[];

  /** The value of the item. */
  getItemValue: (item: T) => string;
}

function useShiftMultiSelect<T>({
  items,
  getItemValue,
}: UseShiftMultiSelectProps<T>) {
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);
  const [lastSelected, setLastSelected] = React.useState<number | null>(null);
  const isShiftPressedRef = React.useRef(false);

  const onShiftKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Shift") {
        isShiftPressedRef.current = event.type === "keydown";
      }
    },
    [],
  );

  const onValueChange = React.useCallback(
    (newValue: string[]) => {
      // Handle single selection
      if (!isShiftPressedRef.current || lastSelected === null) {
        setSelectedValues(newValue);
        const clickedValue =
          newValue.find((v) => !selectedValues.includes(v)) ??
          selectedValues.find((v) => !newValue.includes(v));
        if (clickedValue) {
          const newIndex = items.findIndex(
            (item) => getItemValue(item) === clickedValue,
          );
          if (newIndex !== -1) {
            setLastSelected(newIndex);
          }
        }
        return;
      }

      // Find the currently clicked item
      const clickedValue =
        newValue.find((v) => !selectedValues.includes(v)) ??
        selectedValues.find((v) => !newValue.includes(v));
      if (!clickedValue) return;

      const currentIndex = items.findIndex(
        (item) => getItemValue(item) === clickedValue,
      );
      if (currentIndex === -1) return;

      // Handle shift-click selection
      const start = Math.min(lastSelected, currentIndex);
      const end = Math.max(lastSelected, currentIndex);
      const rangeValues = items
        .slice(start, end + 1)
        .map((item) => getItemValue(item));

      const newSelectedValues = new Set(selectedValues);
      const currentItem = items[currentIndex];
      const isSelecting =
        currentItem && !selectedValues.includes(getItemValue(currentItem));

      for (const value of rangeValues) {
        if (isSelecting) {
          newSelectedValues.add(value);
        } else {
          newSelectedValues.delete(value);
        }
      }

      setSelectedValues(Array.from(newSelectedValues));
      setLastSelected(currentIndex);
    },
    [lastSelected, selectedValues, items, getItemValue],
  );

  return {
    value: selectedValues,
    onValueChange,
    onShiftKeyDown,
  };
}
