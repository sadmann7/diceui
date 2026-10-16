"use client";

import { GitBranch, Loader2 } from "lucide-react";
import * as React from "react";

import {
  CommandStack,
  CommandStackEmpty,
  CommandStackGroup,
  CommandStackInput,
  CommandStackItem,
  CommandStackList,
  CommandStackLoading,
  CommandStackPage,
  useCommandStack,
} from "@/registry/bases/radix/ui/command-stack";

const branchesByRepository: Record<string, string[]> = {
  "acme/web": [
    "main",
    "develop",
    "feat/checkout-redesign",
    "fix/login-redirect",
  ],
  "acme/api": ["main", "release/2.4", "feat/rate-limits", "chore/upgrade-node"],
  "acme/mobile": ["main", "develop", "feat/offline-sync", "fix/push-badges"],
};

const repositories = Object.keys(branchesByRepository);

async function fetchBranches(repository: string, signal: AbortSignal) {
  // Simulate a network request.
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, 600);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  return branchesByRepository[repository] ?? [];
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
      <CommandStackLoading>
        <Loader2 className="size-4 animate-spin" />
        Loading branches...
      </CommandStackLoading>
    );
  }

  return (
    <CommandStackGroup heading="Branches">
      {branches.map((branch) => (
        <CommandStackItem key={branch}>
          <GitBranch />
          {branch}
        </CommandStackItem>
      ))}
    </CommandStackGroup>
  );
}

function RepositoryPages() {
  const { activePage } = useCommandStack();

  return repositories.map((repository) => (
    <CommandStackPage
      key={repository}
      value={repository}
      label={repository}
      placeholder="Search branches..."
    >
      {activePage === repository && <BranchesPage repository={repository} />}
    </CommandStackPage>
  ));
}

export default function CommandStackAsyncDemo() {
  return (
    <CommandStack className="w-full max-w-md border shadow-md">
      <CommandStackInput placeholder="Search repositories..." />
      <CommandStackList>
        <CommandStackEmpty>No results found.</CommandStackEmpty>
        <CommandStackPage value="root" label="Repositories">
          {repositories.map((repository) => (
            <CommandStackItem key={repository} page={repository}>
              {repository}
            </CommandStackItem>
          ))}
        </CommandStackPage>
        <RepositoryPages />
      </CommandStackList>
    </CommandStack>
  );
}
