"use client";

import * as Mention from "@diceui/mention";
import * as React from "react";

const users = [
  {
    id: "1",
    name: "Olivia Martin",
    email: "olivia@email.com",
  },
  {
    id: "2",
    name: "Isabella Nguyen",
    email: "isabella@email.com",
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma@email.com",
  },
  {
    id: "4",
    name: "Jackson Lee",
    email: "jackson@email.com",
  },
  {
    id: "5",
    name: "William Kim",
    email: "will@email.com",
  },
];

export default function MentionDemo() {
  return (
    <Mention.MentionRoot className="w-full max-w-[400px] **:data-tag:rounded **:data-tag:bg-blue-200 **:data-tag:py-px **:data-tag:text-blue-950 dark:**:data-tag:bg-blue-800 dark:**:data-tag:text-blue-50">
      <Mention.MentionLabel className="font-medium text-sm text-zinc-950 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-zinc-50">
        Mention users
      </Mention.MentionLabel>
      <Mention.MentionInput
        placeholder="Type @ to mention someone..."
        className="flex min-h-[60px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
        asChild
      >
        <textarea />
      </Mention.MentionInput>
      <Mention.MentionPortal>
        <Mention.MentionContent className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 min-w-[var(--dice-anchor-width)] overflow-hidden rounded-md border border-zinc-200 bg-white p-1 text-zinc-950 shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
          {users.map((user) => (
            <Mention.MentionItem
              key={user.id}
              value={user.name}
              className="relative flex w-full cursor-default select-none flex-col rounded-sm px-2 py-1.5 text-sm outline-hidden data-disabled:pointer-events-none data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900 data-disabled:opacity-50 dark:data-highlighted:bg-zinc-800 dark:data-highlighted:text-zinc-50"
            >
              <span className="text-sm">{user.name}</span>
              <span className="text-muted-foreground text-xs">
                {user.email}
              </span>
            </Mention.MentionItem>
          ))}
        </Mention.MentionContent>
      </Mention.MentionPortal>
    </Mention.MentionRoot>
  );
}
