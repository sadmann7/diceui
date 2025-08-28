"use client";

import * as React from "react";
import * as InputGroup from "@/registry/default/ui/input-group";

export default function InputGroupDemo() {
  const [values, setValues] = React.useState({
    first: "",
    second: "",
    third: "",
  });

  const onValueChange =
    (field: keyof typeof values) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-sm leading-none">
        Enter your details
      </label>
      <InputGroup.Root className="w-full max-w-sm">
        <InputGroup.Item
          position="first"
          placeholder="First"
          value={values.first}
          onChange={onValueChange("first")}
          aria-label="First name"
        />
        <InputGroup.Item
          position="middle"
          placeholder="Second"
          value={values.second}
          onChange={onValueChange("second")}
          aria-label="Middle name"
        />
        <InputGroup.Item
          position="last"
          placeholder="Third"
          value={values.third}
          onChange={onValueChange("third")}
          aria-label="Last name"
        />
      </InputGroup.Root>
    </div>
  );
}
