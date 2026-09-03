"use client";

import * as React from "react";

import { useZoom } from "@diceui/pptx";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/bases/base/ui/select";

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
  const itemClassName =
    "py-0.5 pr-6 pl-1.5 text-xs [&_svg:not([class*='size-'])]:size-3";

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
        className={cn(
          "h-6 w-22 gap-1 rounded-md py-0 pr-1.5 pl-2 text-xs [&_svg:not([class*='size-'])]:size-3",
          className,
        )}
        {...props}
      >
        <SelectValue>
          {isAutoFit ? `Fit · ${percentage}` : percentage}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-22 p-0.5">
        <SelectItem value="fit" className={itemClassName}>
          Fit
        </SelectItem>
        {levels.map((level) => (
          <SelectItem key={level} value={String(level)} className={itemClassName}>
            {`${level * 100}%`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { PresentationZoomSelect };
