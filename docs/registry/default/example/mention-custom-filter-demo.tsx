"use client";

import {
  Mention,
  MentionContent,
  MentionInput,
  MentionItem,
} from "@/registry/default/ui/mention";
import * as React from "react";

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
    >
      <MentionInput
        placeholder="Type / to use a command..."
        className="min-h-[100px] font-mono"
      />
      <MentionContent>
        {commands.map((command) => (
          <MentionItem
            key={command.id}
            label={command.name}
            value={command.name}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{command.name}</span>
              <span className="text-muted-foreground text-xs">
                {command.description}
              </span>
            </div>
          </MentionItem>
        ))}
      </MentionContent>
    </Mention>
  );
}
