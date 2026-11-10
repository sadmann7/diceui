"use client";

import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorLink,
  EditorMark,
  EditorSlashMenu,
  EditorToolbarSeparator,
} from "@/registry/bases/radix/ui/editor";

export default function EditorMinimalDemo() {
  return (
    <Editor
      placeholder="Press / for commands…"
      className="w-full max-w-2xl border-none shadow-none focus-within:ring-0 dark:bg-transparent"
    >
      <EditorContent className="*:min-h-40" />
      <EditorBubbleMenu>
        <EditorMark mark="bold" />
        <EditorMark mark="italic" />
        <EditorMark mark="strike" />
        <EditorMark mark="code" />
        <EditorToolbarSeparator />
        <EditorLink />
      </EditorBubbleMenu>
      <EditorSlashMenu
        items={(items) =>
          items.map((item) => ({
            ...item,
            description: descriptions[item.value],
          }))
        }
      />
    </Editor>
  );
}

const descriptions: Record<string, string> = {
  paragraph: "Plain text",
  heading1: "Large section heading",
  heading2: "Medium section heading",
  heading3: "Small section heading",
  bulletList: "A simple bulleted list",
  orderedList: "A list with numbering",
  taskList: "Track tasks with checkboxes",
  blockquote: "Capture a quote",
  codeBlock: "A block of code",
  horizontalRule: "Separate sections",
};
