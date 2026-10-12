import * as React from "react";

import { Button } from "@/registry/bases/base/ui/button";
import {
  Faceted,
  FacetedContent,
  FacetedEmpty,
  FacetedGroup,
  FacetedInput,
  FacetedItem,
  FacetedItemIndicator,
  FacetedList,
  FacetedSeparator,
  FacetedTrigger,
  FacetedValue,
} from "@/registry/bases/base/ui/faceted";

const groups = [
  {
    heading: "Fruits",
    items: [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
      { label: "Mango", value: "mango" },
    ],
  },
  {
    heading: "Vegetables",
    items: [
      { label: "Carrot", value: "carrot" },
      { label: "Broccoli", value: "broccoli" },
      { label: "Spinach", value: "spinach" },
    ],
  },
];

const items = groups.flatMap((group) => group.items);

export default function FacetedGroupsDemo() {
  return (
    <Faceted items={items} multiple>
      <FacetedTrigger render={<Button variant="outline" className="w-48" />}>
        <FacetedValue placeholder="Select produce..." />
      </FacetedTrigger>
      <FacetedContent>
        <FacetedInput placeholder="Search produce..." />
        <FacetedList>
          <FacetedEmpty>No produce found.</FacetedEmpty>
          {groups.map((group, index) => (
            <React.Fragment key={group.heading}>
              {index > 0 && <FacetedSeparator />}
              <FacetedGroup heading={group.heading}>
                {group.items.map((item) => (
                  <FacetedItem key={item.value} value={item.value}>
                    {item.label}
                    <FacetedItemIndicator />
                  </FacetedItem>
                ))}
              </FacetedGroup>
            </React.Fragment>
          ))}
        </FacetedList>
      </FacetedContent>
    </Faceted>
  );
}
