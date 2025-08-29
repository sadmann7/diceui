"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { InputGroup, InputGroupItem } from "@/registry/default/ui/input-group";

export default function InputGroupArrowNavigationDemo() {
  const [values, setValues] = React.useState({
    red: "255",
    green: "128",
    blue: "64",
  });

  const [arrowNavigation, setArrowNavigation] = React.useState(true);
  const [loop, setLoop] = React.useState(false);

  const onValueChange = React.useCallback(
    (field: keyof typeof values) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value === "" || (Number(value) >= 0 && Number(value) <= 255)) {
          setValues((prev) => ({
            ...prev,
            [field]: value,
          }));
        }
      },
    [],
  );

  const hexColor = React.useMemo(() => {
    const r = parseInt(values.red || "0", 10);
    const g = parseInt(values.green || "0", 10);
    const b = parseInt(values.blue || "0", 10);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }, [values]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <h3 className="font-medium text-sm">Navigation Options</h3>

        <div className="flex items-center space-x-2">
          <Switch
            id="arrow-navigation"
            checked={arrowNavigation}
            onCheckedChange={setArrowNavigation}
          />
          <Label htmlFor="arrow-navigation">Enable arrow navigation</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="loop"
            checked={loop}
            onCheckedChange={setLoop}
            disabled={!arrowNavigation}
          />
          <Label
            htmlFor="loop"
            className={!arrowNavigation ? "opacity-50" : ""}
          >
            Enable looping
          </Label>
        </div>

        {arrowNavigation && (
          <p className="text-muted-foreground text-xs">
            Try navigating with arrow keys when cursor is at the start/end of
            text
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 rounded border-2 border-border"
          style={{ backgroundColor: hexColor }}
        />
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className="font-mono text-xs">
            {hexColor.toUpperCase()}
          </Badge>
          <span className="text-muted-foreground text-xs">
            RGB({values.red}, {values.green}, {values.blue})
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium text-sm leading-none">
          RGB Color Values
        </label>
        <InputGroup
          className="w-full max-w-sm"
          arrowNavigation={arrowNavigation}
          loop={loop}
        >
          <InputGroupItem
            position="first"
            placeholder="R"
            value={values.red}
            onChange={onValueChange("red")}
            aria-label="Red value (0-255)"
            type="number"
            min="0"
            max="255"
          />
          <InputGroupItem
            position="middle"
            placeholder="G"
            value={values.green}
            onChange={onValueChange("green")}
            aria-label="Green value (0-255)"
            type="number"
            min="0"
            max="255"
          />
          <InputGroupItem
            position="last"
            placeholder="B"
            value={values.blue}
            onChange={onValueChange("blue")}
            aria-label="Blue value (0-255)"
            type="number"
            min="0"
            max="255"
          />
        </InputGroup>
        <p className="mt-2 text-muted-foreground text-xs">
          {arrowNavigation
            ? "Use Tab/Shift+Tab for standard navigation, or arrow keys when cursor is at text boundaries"
            : "Use Tab/Shift+Tab to navigate between inputs"}
        </p>
      </div>
    </div>
  );
}
