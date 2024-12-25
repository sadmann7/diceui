"use client";

import {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupItem,
  CheckboxGroupLabel,
  CheckboxGroupList,
} from "@/registry/default/ui/checkbox-group";
import * as React from "react";

const tricks = [
  { label: "Kickflip", value: "kickflip" },
  { label: "Heelflip", value: "heelflip" },
  { label: "Tre Flip", value: "tre-flip" },
  { label: "FS 540", value: "fs-540" },
  { label: "The 900", value: "the-900" },
  { label: "Pizza Guy", value: "pizza-guy" },
];

export default function CheckboxGroupMultiSelectionDemo() {
  const [selectedTricks, setSelectedTricks] = React.useState<string[]>([]);
  const [lastSelected, setLastSelected] = React.useState<number | null>(null);
  const isShiftPressedRef = React.useRef(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Shift") {
        isShiftPressedRef.current = true;
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key === "Shift") {
        isShiftPressedRef.current = false;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const onValueChange = React.useCallback(
    (newValue: string[]) => {
      // Handle single selection
      if (!isShiftPressedRef.current || lastSelected === null) {
        setSelectedTricks(newValue);
        const clickedValue =
          newValue.find((v) => !selectedTricks.includes(v)) ??
          selectedTricks.find((v) => !newValue.includes(v));
        if (clickedValue) {
          const newIndex = tricks.findIndex((t) => t.value === clickedValue);
          if (newIndex !== -1) {
            setLastSelected(newIndex);
          }
        }
        return;
      }

      // Find the currently clicked item
      const clickedValue =
        newValue.find((v) => !selectedTricks.includes(v)) ??
        selectedTricks.find((v) => !newValue.includes(v));
      if (!clickedValue) return;

      const currentIndex = tricks.findIndex((t) => t.value === clickedValue);
      if (currentIndex === -1) return;

      // Handle shift-click selection
      const start = Math.min(lastSelected, currentIndex);
      const end = Math.max(lastSelected, currentIndex);
      const rangeValues = tricks.slice(start, end + 1).map((t) => t.value);

      const newSelectedTricks = new Set(selectedTricks);
      const currentTrick = tricks[currentIndex];
      const isSelecting =
        currentTrick && !selectedTricks.includes(currentTrick.value);

      for (const value of rangeValues) {
        if (isSelecting) {
          newSelectedTricks.add(value);
        } else {
          newSelectedTricks.delete(value);
        }
      }

      setSelectedTricks(Array.from(newSelectedTricks));
      setLastSelected(currentIndex);
    },
    [lastSelected, selectedTricks],
  );

  return (
    <CheckboxGroup value={selectedTricks} onValueChange={onValueChange}>
      <CheckboxGroupLabel>Skateboarding Tricks</CheckboxGroupLabel>
      <CheckboxGroupDescription>
        Hold Shift and click to select multiple tricks
      </CheckboxGroupDescription>
      <CheckboxGroupList className="mt-1">
        {tricks.map((trick) => (
          <CheckboxGroupItem key={trick.value} value={trick.value}>
            {trick.label}
          </CheckboxGroupItem>
        ))}
      </CheckboxGroupList>
    </CheckboxGroup>
  );
}
