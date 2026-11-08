"use client";

import { Angry, Frown, Laugh, Meh, Smile } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/bases/base/ui/button";
import {
  SelectionWheel,
  SelectionWheelContent,
  SelectionWheelIndicator,
  SelectionWheelItem,
  SelectionWheelLabel,
} from "@/registry/bases/base/ui/selection-wheel";

const moods = [
  { value: "laugh", label: "Laughing", icon: Laugh },
  { value: "smile", label: "Happy", icon: Smile },
  { value: "meh", label: "Meh", icon: Meh },
  { value: "frown", label: "Sad", icon: Frown },
  { value: "angry", label: "Angry", icon: Angry },
];

export default function SelectionWheelControlledDemo() {
  const [value, setValue] = React.useState("smile");

  const index = moods.findIndex((mood) => mood.value === value);

  const step = (delta: number) => {
    const next = (index + delta + moods.length) % moods.length;
    setValue(moods[next]!.value);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <SelectionWheel value={value} onValueChange={setValue}>
        <SelectionWheelContent aria-label="Mood" size={200}>
          <SelectionWheelIndicator />
          {moods.map((mood) => (
            <SelectionWheelItem
              key={mood.value}
              value={mood.value}
              label={mood.label}
            >
              <mood.icon />
            </SelectionWheelItem>
          ))}
          <SelectionWheelLabel />
        </SelectionWheelContent>
      </SelectionWheel>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => step(-1)}>
          Previous
        </Button>
        <span className="min-w-20 text-center text-sm tabular-nums">
          {index + 1} / {moods.length}
        </span>
        <Button variant="outline" size="sm" onClick={() => step(1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
