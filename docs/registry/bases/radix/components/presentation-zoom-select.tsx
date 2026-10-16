"use client";

import { useZoom } from "@diceui/pptx";
import { cn } from "cn";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/bases/radix/ui/select";

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.5, 2];

interface PresentationZoomSelectProps extends Omit<
  React.ComponentProps<typeof SelectTrigger>,
  "value" | "onValueChange"
> {
  levels?: number[];
}

function PresentationZoomSelect({
  levels = ZOOM_LEVELS,
  className,
  ...props
}: PresentationZoomSelectProps) {
  const { zoom, isAutoFit, setZoom, setAutoFit } = useZoom();
  const percentage = `${Math.round(zoom * 100)}%`;

  return (
    <Select
      value={isAutoFit ? "fit" : String(zoom)}
      onValueChange={(value) => {
        if (value === "fit") setAutoFit(true);
        else setZoom(Number(value));
      }}
    >
      <SelectTrigger
        size="sm"
        className={cn("cn-presentation-zoom-select-trigger", className)}
        {...props}
      >
        <SelectValue>
          {isAutoFit ? `Fit · ${percentage}` : percentage}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="cn-presentation-zoom-select-content">
        <SelectItem value="fit" className="cn-presentation-zoom-select-item">
          Fit
        </SelectItem>
        {levels.map((level) => (
          <SelectItem
            key={level}
            value={String(level)}
            className="cn-presentation-zoom-select-item"
          >
            {`${level * 100}%`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { PresentationZoomSelect };
