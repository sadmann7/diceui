"use client";

import {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupItem,
  CheckboxGroupLabel,
  CheckboxGroupList,
  CheckboxGroupMessage,
} from "@/registry/default/ui/checkbox-group";
import * as React from "react";

export default function CheckboxGroupValidationDemo() {
  const [tricks, setTricks] = React.useState<string[]>(["stalefish", "fs-540"]);

  const valid =
    tricks.length === 2 &&
    tricks.includes("stalefish") &&
    tricks.includes("fs-540");

  return (
    <CheckboxGroup value={tricks} onValueChange={setTricks} invalid={!valid}>
      <CheckboxGroupLabel>Tricks</CheckboxGroupLabel>
      <CheckboxGroupList>
        <CheckboxGroupItem value="indy">Indy</CheckboxGroupItem>
        <CheckboxGroupItem value="stalefish">Stalefish</CheckboxGroupItem>
        <CheckboxGroupItem value="fs-540">FS 540</CheckboxGroupItem>
      </CheckboxGroupList>
      {valid ? (
        <CheckboxGroupDescription>Select grab tricks</CheckboxGroupDescription>
      ) : (
        <CheckboxGroupMessage>
          {tricks.includes("indy")
            ? "Indy is not allowed"
            : "Select only Stalefish and FS 540"}
        </CheckboxGroupMessage>
      )}
    </CheckboxGroup>
  );
}
