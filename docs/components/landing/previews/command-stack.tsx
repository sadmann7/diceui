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
  CommandStackShortcut,
} from "@/registry/bases/base/ui/command-stack";

const components = ["Action Bar", "Command Stack", "Data Grid", "Kanban"];

export default function CommandStackPreview() {
  return (
    <div className="flex flex-1 flex-col justify-center p-5">
      <CommandStack className="h-60 w-full border">
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
                <CommandStackShortcut>C</CommandStackShortcut>
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
