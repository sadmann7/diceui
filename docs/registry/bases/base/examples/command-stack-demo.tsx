import {
  BookOpen,
  FolderKanban,
  LifeBuoy,
  MessageSquare,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";

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

const projects = [
  "Marketing Website",
  "Mobile App",
  "Design System",
  "Billing Service",
  "Customer Portal",
];

const teams = ["Design", "Engineering", "Product", "Customer Success"];

export default function CommandStackDemo() {
  return (
    <CommandStack className="w-full max-w-md border shadow-md">
      <CommandStackInput placeholder="What do you need?" />
      <CommandStackList>
        <CommandStackEmpty>No results found.</CommandStackEmpty>
        <CommandStackPage value="root" label="Home">
          <CommandStackGroup heading="Projects">
            <CommandStackItem page="projects">
              <FolderKanban />
              Search projects...
              <CommandStackShortcut>P</CommandStackShortcut>
            </CommandStackItem>
            <CommandStackItem>
              <Plus />
              Create new project...
            </CommandStackItem>
          </CommandStackGroup>
          <CommandStackGroup heading="Teams">
            <CommandStackItem page="teams">
              <Users />
              Search teams...
              <CommandStackShortcut>T</CommandStackShortcut>
            </CommandStackItem>
            <CommandStackItem>
              <UserPlus />
              Invite teammates...
            </CommandStackItem>
          </CommandStackGroup>
          <CommandStackGroup heading="Help">
            <CommandStackItem>
              <BookOpen />
              Documentation
            </CommandStackItem>
            <CommandStackItem>
              <MessageSquare />
              Send feedback...
            </CommandStackItem>
            <CommandStackItem>
              <LifeBuoy />
              Contact support
            </CommandStackItem>
          </CommandStackGroup>
        </CommandStackPage>
        <CommandStackPage
          value="projects"
          label="Projects"
          placeholder="Search projects..."
        >
          {projects.map((project) => (
            <CommandStackItem key={project}>
              <FolderKanban />
              {project}
            </CommandStackItem>
          ))}
        </CommandStackPage>
        <CommandStackPage
          value="teams"
          label="Teams"
          placeholder="Search teams..."
        >
          {teams.map((team) => (
            <CommandStackItem key={team}>
              <Users />
              {team}
            </CommandStackItem>
          ))}
        </CommandStackPage>
      </CommandStackList>
    </CommandStack>
  );
}
