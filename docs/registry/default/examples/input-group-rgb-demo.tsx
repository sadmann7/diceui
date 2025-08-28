"use client";

import * as React from "react";
import * as InputGroup from "@/registry/default/ui/input-group";

export default function InputGroupRgbDemo() {
  const [rgb, setRgb] = React.useState({
    r: 255,
    g: 128,
    b: 0,
  });

  const onChannelChange = React.useCallback(
    (channel: keyof typeof rgb) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(event.target.value, 10);
        if (!Number.isNaN(value) && value >= 0 && value <= 255) {
          setRgb((prev) => ({
            ...prev,
            [channel]: value,
          }));
        }
      },
    [],
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-sm leading-none">RGB Color</label>
      <InputGroup.Root className="w-fit" aria-label="RGB color input">
        <InputGroup.Item
          position="first"
          placeholder="255"
          value={rgb.r}
          onChange={onChannelChange("r")}
          className="w-16"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          max="255"
          aria-label="Red channel (0-255)"
        />
        <InputGroup.Item
          position="middle"
          placeholder="128"
          value={rgb.g}
          onChange={onChannelChange("g")}
          className="w-16"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          max="255"
          aria-label="Green channel (0-255)"
        />
        <InputGroup.Item
          position="last"
          placeholder="0"
          value={rgb.b}
          onChange={onChannelChange("b")}
          className="w-16"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          max="255"
          aria-label="Blue channel (0-255)"
        />
      </InputGroup.Root>
    </div>
  );
}
