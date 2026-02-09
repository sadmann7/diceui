"use client";

import { Textarea } from "@/components/ui/textarea";
import {
  Mention,
  MentionContent,
  MentionInput,
  MentionItem,
} from "@/registry/bases/radix/ui/mention";

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

export default function MentionCustomTriggerDemo() {
  return (
    <Mention trigger="#" className="w-full max-w-[400px]">
      <MentionInput placeholder="Type # to mention a user..." asChild>
        <Textarea />
      </MentionInput>
      <MentionContent>
        {users.map((user) => (
          <MentionItem
            key={user.id}
            value={user.name}
            className="flex-col items-start gap-0.5"
          >
            <span className="text-sm">{user.name}</span>
            <span className="text-muted-foreground text-xs">{user.email}</span>
          </MentionItem>
        ))}
      </MentionContent>
    </Mention>
  );
}
