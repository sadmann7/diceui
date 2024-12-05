"use client";

import {
  TagsInput,
  TagsInputClear,
  TagsInputContent,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
} from "@/registry/default/ui/tags-input";
import * as React from "react";

import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from "@/registry/default/ui/sortable";

import { MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";

export default function TagsInputSortableDemo() {
  const [fruits, setFruits] = React.useState<string[]>([]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  return (
    <Sortable
      sensors={sensors}
      value={fruits.map((fruit) => ({ id: fruit }))}
      onValueChange={(items) => setFruits(items.map((item) => item.id))}
      orientation="both"
      flatCursor
    >
      <TagsInput value={fruits} onValueChange={setFruits} sortable editable>
        <TagsInputLabel>Sortable</TagsInputLabel>
        <SortableContent>
          <TagsInputContent>
            {fruits.map((fruit) => (
              <SortableItem
                key={fruit}
                value={fruit}
                asChild
                asGrip
                tabIndex={-1}
              >
                <TagsInputItem value={fruit}>{fruit}</TagsInputItem>
              </SortableItem>
            ))}
            <TagsInputInput placeholder="Add fruit..." />
          </TagsInputContent>
        </SortableContent>
        <SortableOverlay>
          <div className="size-full animate-pulse rounded-sm bg-primary/10" />
        </SortableOverlay>
        <TagsInputClear />
      </TagsInput>
    </Sortable>
  );
}
