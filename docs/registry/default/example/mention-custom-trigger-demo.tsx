"use client";

import {
  Mention,
  MentionContent,
  MentionInput,
  MentionItem,
} from "@/registry/default/ui/mention";
import * as React from "react";

const emojis = [
  { id: "1", name: "👋 Wave", value: "👋" },
  { id: "2", name: "😊 Smile", value: "😊" },
  { id: "3", name: "🎉 Party", value: "🎉" },
  { id: "4", name: "❤️ Heart", value: "❤️" },
  { id: "5", name: "🔥 Fire", value: "🔥" },
];

export default function MentionCustomTriggerDemo() {
  const [value, setValue] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState("");

  return (
    <Mention
      value={value}
      onValueChange={setValue}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      trigger=":"
    >
      <MentionInput
        placeholder="Type : to add an emoji..."
        className="min-h-[100px]"
      />
      <MentionContent>
        {emojis.map((emoji) => (
          <MentionItem key={emoji.id} label={emoji.name} value={emoji.value}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{emoji.value}</span>
              <span className="text-sm">{emoji.name}</span>
            </div>
          </MentionItem>
        ))}
      </MentionContent>
    </Mention>
  );
}
