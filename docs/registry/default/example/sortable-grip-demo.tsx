"use client";

import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemGrip,
} from "@/registry/default/ui/sortable";
import { GripVertical } from "lucide-react";
import * as React from "react";

export default function SortableGripDemo() {
  const [items, setItems] = React.useState([
    { id: "1", content: "Item 1" },
    { id: "2", content: "Item 2" },
    { id: "3", content: "Item 3" },
  ]);

  return (
    <Sortable value={items} onValueChange={setItems}>
      <SortableContent>
        {items.map((item) => (
          <SortableItem key={item.id} value={item.id}>
            <div className="flex items-center gap-2 rounded-md border p-4">
              <SortableItemGrip>
                <GripVertical className="h-4 w-4" />
              </SortableItemGrip>
              {item.content}
            </div>
          </SortableItem>
        ))}
      </SortableContent>
    </Sortable>
  );
}
