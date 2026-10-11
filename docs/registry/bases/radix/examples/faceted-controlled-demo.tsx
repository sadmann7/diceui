"use client";

import * as React from "react";

import { Button } from "@/registry/bases/radix/ui/button";
import {
  Faceted,
  FacetedContent,
  FacetedEmpty,
  FacetedGroup,
  FacetedInput,
  FacetedItem,
  FacetedItemIndicator,
  FacetedList,
  FacetedTrigger,
  FacetedValue,
} from "@/registry/bases/radix/ui/faceted";

const priorities = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

export default function FacetedControlledDemo() {
  const [value, setValue] = React.useState<string[]>(["medium"]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Faceted
        items={priorities}
        value={value}
        onValueChange={(nextValue) => setValue(nextValue ?? [])}
        multiple
      >
        <FacetedTrigger asChild>
          <Button variant="outline" className="w-60">
            <FacetedValue placeholder="Select priority..." />
          </Button>
        </FacetedTrigger>
        <FacetedContent>
          <FacetedInput placeholder="Search priority..." />
          <FacetedList>
            <FacetedEmpty>No priority found.</FacetedEmpty>
            <FacetedGroup>
              {priorities.map((priority) => (
                <FacetedItem key={priority.value} value={priority.value}>
                  {priority.label}
                  <FacetedItemIndicator />
                </FacetedItem>
              ))}
            </FacetedGroup>
          </FacetedList>
        </FacetedContent>
      </Faceted>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Selected: {value.length > 0 ? value.join(", ") : "none"}
        </p>
        <Button variant="ghost" size="sm" onClick={() => setValue([])}>
          Reset
        </Button>
      </div>
    </div>
  );
}
