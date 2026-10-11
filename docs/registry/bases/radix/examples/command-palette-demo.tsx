import {
  FileText,
  FolderKanban,
  LifeBuoy,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";

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

const projects = ["Dice UI", "tablecn", "pptx", "Docs", "Playground"];
const teams = ["Design", "Engineering", "Marketing"];

export default function CommandPaletteDemo() {
  return (
    <CommandPalette className="w-full max-w-md rounded-lg border shadow-md">
      <CommandPaletteBreadcrumb />
      <CommandPaletteInput placeholder="What do you need?" />
      <CommandPaletteList>
        <CommandPaletteEmpty>No results found.</CommandPaletteEmpty>
        <CommandPalettePage value="root" label="Home">
          <CommandPaletteGroup heading="Projects">
            <CommandPaletteItem page="projects">
              <FolderKanban />
              Search projects...
              <CommandPaletteShortcut>S P</CommandPaletteShortcut>
            </CommandPaletteItem>
            <CommandPaletteItem>
              <Plus />
              Create new project...
            </CommandPaletteItem>
          </CommandPaletteGroup>
          <CommandPaletteGroup heading="Teams">
            <CommandPaletteItem page="teams">
              <Users />
              Search teams...
              <CommandPaletteShortcut>⇧ T</CommandPaletteShortcut>
            </CommandPaletteItem>
          </CommandPaletteGroup>
          <CommandPaletteGroup heading="Help">
            <CommandPaletteItem>
              <FileText />
              Search docs...
            </CommandPaletteItem>
            <CommandPaletteItem>
              <MessageSquare />
              Send feedback...
            </CommandPaletteItem>
            <CommandPaletteItem>
              <LifeBuoy />
              Contact support
            </CommandPaletteItem>
          </CommandPaletteGroup>
        </CommandPalettePage>
        <CommandPalettePage value="projects" label="Projects">
          {projects.map((project) => (
            <CommandPaletteItem key={project}>{project}</CommandPaletteItem>
          ))}
        </CommandPalettePage>
        <CommandPalettePage value="teams" label="Teams">
          {teams.map((team) => (
            <CommandPaletteItem key={team}>{team}</CommandPaletteItem>
          ))}
        </CommandPalettePage>
      </CommandPaletteList>
    </CommandPalette>
  );
}
