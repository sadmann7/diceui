"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Mention,
  MentionContent,
  MentionInput,
  MentionItem,
} from "@/registry/bases/radix/ui/mention";

const commands = [
  {
    id: "1",
    name: "help",
    description: "Show available commands",
  },
  {
    id: "2",
    name: "clear",
    description: "Clear the console",
  },
  {
    id: "3",
    name: "restart",
    description: "Restart the application",
  },
  {
    id: "4",
    name: "reload",
    description: "Reload the current page",
  },
  {
    id: "5",
    name: "quit",
    description: "Exit the application",
  },
];

export default function MentionCustomFilterDemo() {
  const [value, setValue] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState("");

  // Custom filter that matches commands starting with the search term
  function onFilter(options: string[], term: string) {
    return options.filter((option) =>
      option.toLowerCase().startsWith(term.toLowerCase()),
    );
  }

  return (
    <Mention
      value={value}
      onValueChange={setValue}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      trigger="/"
      onFilter={onFilter}
      className="w-full max-w-[400px]"
    >
      <MentionInput placeholder="Type / to use a command..." asChild>
        <Textarea />
      </MentionInput>
      <MentionContent>
        {commands.map((command) => (
          <MentionItem
            key={command.id}
            label={command.name}
            value={command.name}
          >
            <span className="font-mono text-sm">{command.name}</span>
            <span className="text-muted-foreground text-xs">
              {command.description}
            </span>
          </MentionItem>
        ))}
      </MentionContent>
    </Mention>
  );
}
