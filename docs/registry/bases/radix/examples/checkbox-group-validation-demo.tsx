"use client";

import * as React from "react";
import {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupItem,
  CheckboxGroupLabel,
  CheckboxGroupList,
  CheckboxGroupMessage,
} from "@/registry/bases/radix/ui/checkbox-group";

export default function CheckboxGroupValidationDemo() {
  const [tricks, setTricks] = React.useState<string[]>(["stalefish", "fs-540"]);

  return (
    <CheckboxGroup
      value={tricks}
      onValueChange={setTricks}
      onValidate={(value) =>
        value.includes("indy") ? "Indy is not allowed" : null
      }
    >
      <CheckboxGroupLabel>Tricks</CheckboxGroupLabel>
      <CheckboxGroupList>
        <CheckboxGroupItem value="indy">Indy</CheckboxGroupItem>
        <CheckboxGroupItem value="stalefish">Stalefish</CheckboxGroupItem>
        <CheckboxGroupItem value="fs-540">FS 540</CheckboxGroupItem>
      </CheckboxGroupList>
      <CheckboxGroupDescription hideOnError>
        Select grab tricks
      </CheckboxGroupDescription>
      <CheckboxGroupMessage />
    </CheckboxGroup>
  );
}
