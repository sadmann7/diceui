"use client";

import { Archive, Bookmark, Copy, Heart, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  SelectionWheel,
  SelectionWheelContent,
  SelectionWheelIndicator,
  SelectionWheelItem,
  SelectionWheelLabel,
} from "@/registry/bases/base/ui/selection-wheel";

const actions = [
  { value: "copy", label: "Copy", icon: Copy },
  { value: "share", label: "Share", icon: Share2 },
  { value: "like", label: "Like", icon: Heart },
  { value: "bookmark", label: "Bookmark", icon: Bookmark },
  { value: "archive", label: "Archive", icon: Archive },
  { value: "delete", label: "Delete", icon: Trash2 },
];

export default function SelectionWheelMenuDemo() {
  return (
    <SelectionWheel type="menu">
      <SelectionWheelContent aria-label="Quick actions" size={200}>
        <SelectionWheelIndicator />
        {actions.map((action) => (
          <SelectionWheelItem
            key={action.value}
            value={action.value}
            label={action.label}
            onSelect={() => toast.success(action.label)}
          >
            <action.icon />
          </SelectionWheelItem>
        ))}
        <SelectionWheelLabel>Pick</SelectionWheelLabel>
      </SelectionWheelContent>
    </SelectionWheel>
  );
}
