"use client";

import {
  CircleDot,
  FolderKanban,
  LayoutDashboard,
  Monitor,
  Moon,
  Palette,
  Plus,
  Settings,
  Sun,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/bases/base/ui/button";
import { CommandDialog } from "@/registry/bases/base/ui/command";
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

const projects = ["Marketing Website", "Mobile App", "Design System"];

export default function CommandStackDialogDemo() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "j" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function onRun() {
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Search...
        <kbd className="pointer-events-none rounded-sm border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
          ⌘J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandStack>
          <CommandStackInput placeholder="Type a command or search..." />
          <CommandStackList>
            <CommandStackEmpty>No results found.</CommandStackEmpty>
            <CommandStackPage value="root" label="Home">
              <CommandStackGroup heading="Navigation">
                <CommandStackItem onSelect={onRun}>
                  <LayoutDashboard />
                  Dashboard
                  <CommandStackShortcut>G D</CommandStackShortcut>
                </CommandStackItem>
                <CommandStackItem page="projects">
                  <FolderKanban />
                  Go to project...
                  <CommandStackShortcut>G P</CommandStackShortcut>
                </CommandStackItem>
                <CommandStackItem onSelect={onRun}>
                  <Settings />
                  Settings
                  <CommandStackShortcut>G S</CommandStackShortcut>
                </CommandStackItem>
              </CommandStackGroup>
              <CommandStackGroup heading="Actions">
                <CommandStackItem onSelect={onRun}>
                  <CircleDot />
                  Create issue
                  <CommandStackShortcut>C</CommandStackShortcut>
                </CommandStackItem>
                <CommandStackItem onSelect={onRun}>
                  <Plus />
                  Create project
                </CommandStackItem>
                <CommandStackItem page="theme">
                  <Palette />
                  Change theme...
                </CommandStackItem>
              </CommandStackGroup>
            </CommandStackPage>
            <CommandStackPage
              value="projects"
              label="Projects"
              placeholder="Search projects..."
            >
              {projects.map((project) => (
                <CommandStackItem key={project} onSelect={onRun}>
                  <FolderKanban />
                  {project}
                </CommandStackItem>
              ))}
            </CommandStackPage>
            <CommandStackPage
              value="theme"
              label="Theme"
              placeholder="Change theme..."
            >
              <CommandStackItem onSelect={onRun}>
                <Sun />
                Light
              </CommandStackItem>
              <CommandStackItem onSelect={onRun}>
                <Moon />
                Dark
              </CommandStackItem>
              <CommandStackItem onSelect={onRun}>
                <Monitor />
                System
              </CommandStackItem>
            </CommandStackPage>
          </CommandStackList>
        </CommandStack>
      </CommandDialog>
    </>
  );
}
