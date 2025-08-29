"use client";

import * as React from "react";
import { InputGroup, InputGroupItem } from "@/registry/default/ui/input-group";

export default function InputGroupDemo() {
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
      <InputGroup className="w-full max-w-sm">
        <InputGroupItem
          position="first"
          placeholder="First"
          value={values.first}
          onChange={onValueChange("first")}
          aria-label="First name"
        />
        <InputGroupItem
          position="middle"
          placeholder="Second"
          value={values.second}
          onChange={onValueChange("second")}
          aria-label="Middle name"
        />
        <InputGroupItem
          position="last"
          placeholder="Third"
          value={values.third}
          onChange={onValueChange("third")}
          aria-label="Last name"
        />
      </InputGroup>
    </div>
  );
}
