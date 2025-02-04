"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as Editable from "@/registry/default/ui/editable";
import * as React from "react";

export default function EditableAutosizeDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Editable.Root
        defaultValue="This input will automatically resize based on content length. Try typing a longer text to see it in action!"
        autosize
      >
        <Editable.Label>Autosize Editable</Editable.Label>
        <Editable.Area>
          <Editable.Preview className="whitespace-pre-wrap" />
          <Editable.Input asChild>
            <Textarea className="min-h-[60px] w-full resize-none overflow-hidden" />
          </Editable.Input>
        </Editable.Area>
        <Editable.Toolbar>
          <Editable.Submit asChild>
            <Button size="sm">Save</Button>
          </Editable.Submit>
          <Editable.Cancel asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Editable.Cancel>
        </Editable.Toolbar>
      </Editable.Root>
    </div>
  );
}
