"use client";

import {
  Mention,
  MentionContent,
  MentionInput,
  MentionItem,
} from "@/registry/default/ui/mention";
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
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <Mention value={value} onValueChange={setValue}>
      <MentionInput placeholder="Type @ to mention someone..." />
      <MentionContent>
        {users.map((user) => (
          <MentionItem key={user.id} value={user.name}>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted font-medium text-xs">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="flex flex-col">
                <span className="text-sm">{user.name}</span>
                <span className="text-muted-foreground text-xs">
                  {user.email}
                </span>
              </div>
            </div>
          </MentionItem>
        ))}
      </MentionContent>
    </Mention>
  );
}
