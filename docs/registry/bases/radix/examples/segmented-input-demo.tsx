"use client";

import * as React from "react";
import {
  SegmentedInput,
  SegmentedInputItem,
} from "@/registry/bases/radix/ui/segmented-input";

export default function SegmentedInputDemo() {
  const [values, setValues] = React.useState({
    first: "",
    second: "",
    third: "",
  });

  const onValueChange = React.useCallback(
    (field: keyof typeof values) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
      },
    [],
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-sm leading-none">
        Enter your details
      </label>
      <SegmentedInput className="w-full max-w-sm">
        <SegmentedInputItem
          placeholder="First"
          value={values.first}
          onChange={onValueChange("first")}
          aria-label="First name"
        />
        <SegmentedInputItem
          placeholder="Second"
          value={values.second}
          onChange={onValueChange("second")}
          aria-label="Middle name"
        />
        <SegmentedInputItem
          placeholder="Third"
          value={values.third}
          onChange={onValueChange("third")}
          aria-label="Last name"
        />
      </SegmentedInput>
    </div>
  );
}
