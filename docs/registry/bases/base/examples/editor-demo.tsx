"use client";

import {
  Editor,
  EditorBlock,
  EditorBlockSelect,
  EditorBubbleMenu,
  EditorContent,
  EditorLink,
  EditorMark,
  EditorRedo,
  EditorSlashMenu,
  EditorToolbar,
  EditorToolbarSeparator,
  EditorUndo,
} from "@/registry/bases/base/ui/editor";

const content = `
<h2>Release notes</h2>
<p>Type <code>/</code> for blocks, or select text to format it. Press <strong>Ctrl</strong> + <strong>K</strong> to add a link.</p>
<ul>
  <li><p>Faster search across <em>every</em> workspace</p></li>
  <li><p>Shared views with <a href="https://diceui.com">read-only links</a></p></li>
</ul>
<blockquote><p>Ship small, ship often.</p></blockquote>
`;

export default function EditorDemo() {
  return (
    <Editor
      defaultValue={content}
      placeholder="Write something, or press / for commands…"
      className="w-full max-w-2xl"
    >
      <EditorToolbar>
        <EditorUndo />
        <EditorRedo />
        <EditorToolbarSeparator />
        <EditorBlockSelect />
        <EditorToolbarSeparator />
        <EditorMark mark="bold" />
        <EditorMark mark="italic" />
        <EditorMark mark="underline" />
        <EditorMark mark="strike" />
        <EditorMark mark="code" />
        <EditorLink />
        <EditorToolbarSeparator />
        <EditorBlock block="bulletList" />
        <EditorBlock block="orderedList" />
        <EditorBlock block="taskList" />
        <EditorBlock block="blockquote" />
      </EditorToolbar>
      <EditorContent className="max-h-96" />
      <EditorBubbleMenu>
        <EditorMark mark="bold" />
        <EditorMark mark="italic" />
        <EditorMark mark="underline" />
        <EditorMark mark="strike" />
        <EditorMark mark="code" />
        <EditorLink />
      </EditorBubbleMenu>
      <EditorSlashMenu />
    </Editor>
  );
}
