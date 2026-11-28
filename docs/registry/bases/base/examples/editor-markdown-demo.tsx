"use client";

import * as React from "react";

import {
  Editor,
  EditorBlock,
  EditorContent,
  EditorMark,
  EditorSlashMenu,
  EditorToolbar,
  EditorToolbarSeparator,
} from "@/registry/bases/base/ui/editor";

export default function EditorMarkdownDemo() {
  const [value, setValue] = React.useState(
    "## Weekly sync\n\n- [x] Review the **roadmap**\n- [ ] Draft the `v2` changelog\n\n> Decisions go in the notes.",
  );

  return (
    <div className="grid w-full max-w-4xl gap-4 md:grid-cols-2">
      <Editor format="markdown" value={value} onValueChange={setValue}>
        <EditorToolbar>
          <EditorMark mark="bold" />
          <EditorMark mark="italic" />
          <EditorMark mark="code" />
          <EditorToolbarSeparator />
          <EditorBlock block="heading2" />
          <EditorBlock block="bulletList" />
          <EditorBlock block="taskList" />
          <EditorBlock block="blockquote" />
        </EditorToolbar>
        <EditorContent />
        <EditorSlashMenu />
      </Editor>
      <pre className="overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-xs whitespace-pre-wrap">
        {value}
      </pre>
    </div>
  );
}
