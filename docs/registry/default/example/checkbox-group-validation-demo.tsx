"use client";

import {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupItem,
  CheckboxGroupLabel,
  CheckboxGroupList,
} from "@/registry/default/ui/checkbox-group";
import * as React from "react";

export default function CheckboxGroupValidationDemo() {
  const [tricks, setTricks] = React.useState<string[]>([]);

  return (
    <CheckboxGroup
      value={tricks}
      onValueChange={setTricks}
      invalid={tricks.includes("stalefish")}
    >
      <CheckboxGroupLabel>Tricks</CheckboxGroupLabel>
      <CheckboxGroupList>
        <CheckboxGroupItem value="indy">Indy</CheckboxGroupItem>
        <CheckboxGroupItem value="judo">Judo</CheckboxGroupItem>
        <CheckboxGroupItem value="stalefish">Stalefish</CheckboxGroupItem>
        <CheckboxGroupItem value="fs-540">FS 540</CheckboxGroupItem>
      </CheckboxGroupList>
      <CheckboxGroupDescription>
        Select any tricks except Stalefish
      </CheckboxGroupDescription>
    </CheckboxGroup>
  );
}
