"use client";

import { GitBranch, Loader2 } from "lucide-react";
import * as React from "react";

import {
  CommandPalette,
  CommandPaletteBreadcrumb,
  CommandPaletteEmpty,
  CommandPaletteGroup,
  CommandPaletteInput,
  CommandPaletteItem,
  CommandPaletteList,
  CommandPaletteLoading,
  CommandPalettePage,
  useCommandPalette,
} from "@/registry/bases/radix/ui/command-palette";

const repositories = ["diceui", "tablecn", "pptx"];

async function fetchBranches(repository: string, signal: AbortSignal) {
  // Simulate a network request.
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, 600);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  return ["main", "develop", `${repository}/next`, `${repository}/docs`];
}

function BranchesPage({ repository }: { repository: string }) {
  const [branches, setBranches] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    const abortController = new AbortController();

    fetchBranches(repository, abortController.signal)
      .then(setBranches)
      .catch(() => {
        // The page closed before the request finished.
      });

    return () => abortController.abort();
  }, [repository]);

  if (!branches) {
    return (
      <CommandPaletteLoading>
        <Loader2 className="size-4 animate-spin" />
        Loading branches...
      </CommandPaletteLoading>
    );
  }

  return (
    <CommandPaletteGroup heading="Branches">
      {branches.map((branch) => (
        <CommandPaletteItem key={branch}>
          <GitBranch />
          {branch}
        </CommandPaletteItem>
      ))}
    </CommandPaletteGroup>
  );
}

function RepositoryPages() {
  const { activePage } = useCommandPalette();

  return repositories.map((repository) => (
    <CommandPalettePage key={repository} value={repository} label={repository}>
      {activePage === repository && <BranchesPage repository={repository} />}
    </CommandPalettePage>
  ));
}

export default function CommandPaletteAsyncDemo() {
  return (
    <CommandPalette className="w-full max-w-md rounded-lg border shadow-md">
      <CommandPaletteBreadcrumb />
      <CommandPaletteInput placeholder="Search repositories..." />
      <CommandPaletteList>
        <CommandPaletteEmpty>No results found.</CommandPaletteEmpty>
        <CommandPalettePage value="root" label="Repositories">
          {repositories.map((repository) => (
            <CommandPaletteItem key={repository} page={repository}>
              {repository}
            </CommandPaletteItem>
          ))}
        </CommandPalettePage>
        <RepositoryPages />
      </CommandPaletteList>
    </CommandPalette>
  );
}
