"use client";

import * as React from "react";

import { Button } from "@/registry/bases/radix/ui/button";
import {
  Faceted,
  FacetedContent,
  FacetedEmpty,
  FacetedGroup,
  FacetedInput,
  FacetedItem,
  FacetedItemIndicator,
  FacetedList,
  FacetedLoading,
  FacetedTrigger,
  FacetedValue,
} from "@/registry/bases/radix/ui/faceted";

interface User {
  label: string;
  value: string;
}

const users: User[] = [
  { label: "Ada Lovelace", value: "ada" },
  { label: "Alan Turing", value: "alan" },
  { label: "Barbara Liskov", value: "barbara" },
  { label: "Dennis Ritchie", value: "dennis" },
  { label: "Donald Knuth", value: "donald" },
  { label: "Edsger Dijkstra", value: "edsger" },
  { label: "Grace Hopper", value: "grace" },
  { label: "Guido van Rossum", value: "guido" },
  { label: "Ken Thompson", value: "ken" },
  { label: "Linus Torvalds", value: "linus" },
  { label: "Margaret Hamilton", value: "margaret" },
  { label: "Tim Berners-Lee", value: "tim" },
];

async function searchUsers(query: string, signal: AbortSignal) {
  // Simulate a network request.
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, 500);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  const normalizedQuery = query.trim().toLowerCase();
  return users.filter((user) =>
    user.label.toLowerCase().includes(normalizedQuery),
  );
}

export default function FacetedAsyncDemo() {
  const [value, setValue] = React.useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState<User[]>([]);
  const [isPending, setIsPending] = React.useState(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Keep the selected users in `items` so their badges stay labeled
  // when they aren't in the current results.
  const items = React.useMemo(() => {
    const selectedValues = new Set(selectedUsers.map((user) => user.value));
    return [
      ...selectedUsers,
      ...results.filter((user) => !selectedValues.has(user.value)),
    ];
  }, [selectedUsers, results]);

  const visibleUsers = search ? results : selectedUsers;

  function onSearchChange(nextSearch: string) {
    setSearch(nextSearch);
    abortControllerRef.current?.abort();

    if (!nextSearch.trim()) {
      setResults([]);
      setIsPending(false);
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsPending(true);

    searchUsers(nextSearch, abortController.signal)
      .then((nextResults) => {
        setResults(nextResults);
        setIsPending(false);
      })
      .catch(() => {
        // The request was replaced by a newer one.
      });
  }

  function onValueChange(nextValue: string[] | undefined) {
    const nextValues = nextValue ?? [];
    setValue(nextValues);
    setSelectedUsers(
      nextValues.flatMap((userValue) => {
        const user = items.find((item) => item.value === userValue);
        return user ? [user] : [];
      }),
    );
  }

  return (
    <Faceted
      items={items}
      value={value}
      onValueChange={onValueChange}
      onOpenChange={(open) => {
        if (!open) onSearchChange("");
      }}
      multiple
    >
      <FacetedTrigger asChild>
        <Button variant="outline" className="w-64">
          <FacetedValue placeholder="Assign users..." />
        </Button>
      </FacetedTrigger>
      <FacetedContent shouldFilter={false} className="w-64">
        <FacetedInput
          placeholder="Search users..."
          value={search}
          onValueChange={onSearchChange}
        />
        <FacetedList>
          {isPending ? (
            <FacetedLoading>Searching...</FacetedLoading>
          ) : (
            <FacetedEmpty>
              {search ? "No users found." : "Type to search users."}
            </FacetedEmpty>
          )}
          {!isPending && visibleUsers.length > 0 && (
            <FacetedGroup heading={search ? "Results" : "Selected"}>
              {visibleUsers.map((user) => (
                <FacetedItem key={user.value} value={user.value}>
                  {user.label}
                  <FacetedItemIndicator />
                </FacetedItem>
              ))}
            </FacetedGroup>
          )}
        </FacetedList>
      </FacetedContent>
    </Faceted>
  );
}
