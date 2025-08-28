"use client";

import { GroupedInput } from "@/registry/default/ui/grouped-input";
import * as React from "react";

export default function GroupedInputDemo() {
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
    <div className="flex w-full max-w-sm items-center space-x-0">
      <GroupedInput
        position="first"
        placeholder="First"
        value={values.first}
        onChange={onValueChange("first")}
      />
      <GroupedInput
        position="middle"
        placeholder="Second"
        value={values.second}
        onChange={onValueChange("second")}
      />
      <GroupedInput
        position="last"
        placeholder="Third"
        value={values.third}
        onChange={onValueChange("third")}
      />
    </div>
  );
}
