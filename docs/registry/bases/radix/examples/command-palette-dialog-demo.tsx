"use client";

import { FolderKanban, Moon, Sun, Users } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/bases/radix/ui/button";
import { CommandDialog } from "@/registry/bases/radix/ui/command";
import {
  CommandPalette,
  CommandPaletteBreadcrumb,
  CommandPaletteEmpty,
  CommandPaletteGroup,
  CommandPaletteInput,
  CommandPaletteItem,
  CommandPaletteList,
  CommandPalettePage,
  CommandPaletteShortcut,
} from "@/registry/bases/radix/ui/command-palette";

const projects = ["Dice UI", "tablecn", "pptx"];
const teams = ["Design", "Engineering", "Marketing"];

export default function CommandPaletteDialogDemo() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open command palette
        <kbd className="pointer-events-none rounded-sm border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandPalette>
          <CommandPaletteBreadcrumb />
          <CommandPaletteInput placeholder="Type a command or search..." />
          <CommandPaletteList>
            <CommandPaletteEmpty>No results found.</CommandPaletteEmpty>
            <CommandPalettePage value="root" label="Home">
              <CommandPaletteGroup heading="Navigate">
                <CommandPaletteItem page="projects">
                  <FolderKanban />
                  Projects
                </CommandPaletteItem>
                <CommandPaletteItem page="teams">
                  <Users />
                  Teams
                </CommandPaletteItem>
              </CommandPaletteGroup>
              <CommandPaletteGroup heading="Theme">
                <CommandPaletteItem onSelect={() => setOpen(false)}>
                  <Sun />
                  Light
                  <CommandPaletteShortcut>⇧ L</CommandPaletteShortcut>
                </CommandPaletteItem>
                <CommandPaletteItem onSelect={() => setOpen(false)}>
                  <Moon />
                  Dark
                  <CommandPaletteShortcut>⇧ D</CommandPaletteShortcut>
                </CommandPaletteItem>
              </CommandPaletteGroup>
            </CommandPalettePage>
            <CommandPalettePage value="projects" label="Projects">
              {projects.map((project) => (
                <CommandPaletteItem
                  key={project}
                  onSelect={() => setOpen(false)}
                >
                  {project}
                </CommandPaletteItem>
              ))}
            </CommandPalettePage>
            <CommandPalettePage value="teams" label="Teams">
              {teams.map((team) => (
                <CommandPaletteItem key={team} onSelect={() => setOpen(false)}>
                  {team}
                </CommandPaletteItem>
              ))}
            </CommandPalettePage>
          </CommandPaletteList>
        </CommandPalette>
      </CommandDialog>
    </>
  );
}
