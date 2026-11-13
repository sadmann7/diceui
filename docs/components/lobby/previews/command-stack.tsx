"use client";

import { BookOpen, Box, Copy, FolderKanban, Moon } from "lucide-react";

import {
  CommandStack,
  CommandStackEmpty,
  CommandStackGroup,
  CommandStackInput,
  CommandStackItem,
  CommandStackList,
  CommandStackPage,
} from "@/registry/bases/base/ui/command-stack";

const components = ["Action Bar", "Command Stack", "Data Grid", "Kanban"];

export default function CommandStackPreview() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-5">
      <CommandStack className="h-full w-full border">
        <CommandStackInput placeholder="Search commands, pages, actions…" />
        <CommandStackList>
          <CommandStackEmpty>No results found.</CommandStackEmpty>
          <CommandStackPage value="root" label="Home">
            <CommandStackGroup heading="Navigate">
              <CommandStackItem>
                <BookOpen />
                Go to documentation
              </CommandStackItem>
              <CommandStackItem page="components">
                <Box />
                Browse components
              </CommandStackItem>
              <CommandStackItem>
                <Moon />
                Toggle dark theme
              </CommandStackItem>
            </CommandStackGroup>
            <CommandStackGroup heading="Actions">
              <CommandStackItem>
                <Copy />
                Copy install command
              </CommandStackItem>
            </CommandStackGroup>
          </CommandStackPage>
          <CommandStackPage
            value="components"
            label="Components"
            placeholder="Search components…"
          >
            {components.map((component) => (
              <CommandStackItem key={component}>
                <FolderKanban />
                {component}
              </CommandStackItem>
            ))}
          </CommandStackPage>
        </CommandStackList>
      </CommandStack>
    </div>
  );
}
