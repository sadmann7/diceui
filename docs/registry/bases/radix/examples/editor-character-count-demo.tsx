"use client";

import {
  Editor,
  EditorCharacterCount,
  EditorContent,
  EditorMark,
  EditorToolbar,
} from "@/registry/bases/radix/ui/editor";

export default function EditorCharacterCountDemo() {
  return (
    <Editor
      limit={280}
      placeholder="What's happening?"
      className="w-full max-w-lg"
    >
      <EditorContent />
      <EditorToolbar className="justify-between">
        <div className="flex items-center gap-1">
          <EditorMark mark="bold" />
          <EditorMark mark="italic" />
        </div>
        <EditorCharacterCount className="px-2" />
      </EditorToolbar>
    </Editor>
  );
}
