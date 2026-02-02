"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Mention,
  MentionContent,
  MentionInput,
  MentionItem,
} from "@/registry/default/ui/mention";

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

interface Message {
  id: string;
  content: string;
  mentions: string[];
}

function renderMessageContent(content: string, mentions: string[]) {
  if (mentions.length === 0) return content;

  const escaped = mentions.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(@(?:${escaped.join("|")}))`, "g");

  return content.split(pattern).map((part, i) =>
    part.startsWith("@") && mentions.includes(part.slice(1)) ? (
      <span
        key={i}
        className="rounded bg-blue-200 py-px text-blue-950 dark:bg-blue-800 dark:text-blue-50"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
}

export default function MentionControlledDemo() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);

  function onSend() {
    if (!inputValue.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        content: inputValue,
        mentions: value,
      },
    ]);
    setInputValue("");
    setValue([]);
  }

  return (
    <div className="grid h-full w-full max-w-[400px] grid-rows-[1fr_auto_1fr] gap-3">
      <div className="relative flex flex-col justify-end overflow-y-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-linear-to-b from-white to-transparent dark:from-fd-background" />
        {messages.length > 0 && (
          <div className="flex flex-col gap-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
                  {renderMessageContent(message.content, message.mentions)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Mention
          open={open}
          onOpenChange={setOpen}
          value={value}
          onValueChange={setValue}
          inputValue={inputValue}
          onInputValueChange={setInputValue}
        >
          <MentionInput placeholder="Type @ to mention someone..." asChild>
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
                <span className="text-muted-foreground text-xs">
                  {user.email}
                </span>
              </MentionItem>
            ))}
          </MentionContent>
        </Mention>
        <Button onClick={onSend} disabled={!inputValue.trim()}>
          Send
        </Button>
      </div>
      <div />
    </div>
  );
}
