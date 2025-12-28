"use client";

import {
  Bold,
  Code,
  Highlighter,
  Italic,
  Strikethrough,
  Underline,
} from "lucide-react";
import * as React from "react";
import {
  SelectionToolbar,
  SelectionToolbarItem,
  SelectionToolbarSeparator,
} from "@/registry/default/ui/selection-toolbar";

export default function SelectionToolbarRichDemo() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const wrapSelection = (tagName: string, className?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    const wrapper = document.createElement(tagName);
    if (className) {
      wrapper.className = className;
    }

    try {
      range.surroundContents(wrapper);
    } catch {
      wrapper.textContent = selectedText;
      range.deleteContents();
      range.insertNode(wrapper);
    }

    selection.removeAllRanges();
  };

  const onBold = () => {
    wrapSelection("strong");
    console.log({ action: "bold" });
  };

  const onItalic = () => {
    wrapSelection("em");
    console.log({ action: "italic" });
  };

  const onUnderline = () => {
    wrapSelection("u");
    console.log({ action: "underline" });
  };

  const onStrikethrough = () => {
    wrapSelection("s");
    console.log({ action: "strikethrough" });
  };

  const onHighlight = () => {
    wrapSelection("mark", "bg-yellow-200 dark:bg-yellow-900/50");
    console.log({ action: "highlight" });
  };

  const onCode = () => {
    wrapSelection(
      "code",
      "rounded bg-muted px-1 py-0.5 font-mono text-sm text-foreground",
    );
    console.log({ action: "code" });
  };

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <div
        ref={containerRef}
        contentEditable
        suppressContentEditableWarning
        className="max-w-2xl space-y-4 rounded-lg border bg-card p-8 text-card-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <h2 className="font-semibold text-2xl">Rich Text Formatting</h2>
        <p className="text-muted-foreground leading-relaxed">
          Select any text to see the rich formatting toolbar with multiple
          options. Try bold, italic, underline, strikethrough, highlight, and
          inline code formatting.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The toolbar provides a comprehensive set of text formatting tools
          similar to popular writing applications. Each action applies semantic
          HTML elements with appropriate styling.
        </p>

        <SelectionToolbar container={containerRef.current}>
          <SelectionToolbarItem onSelect={onBold}>
            <Bold />
          </SelectionToolbarItem>
          <SelectionToolbarItem onSelect={onItalic}>
            <Italic />
          </SelectionToolbarItem>
          <SelectionToolbarItem onSelect={onUnderline}>
            <Underline />
          </SelectionToolbarItem>
          <SelectionToolbarItem onSelect={onStrikethrough}>
            <Strikethrough />
          </SelectionToolbarItem>
          <SelectionToolbarSeparator />
          <SelectionToolbarItem onSelect={onHighlight}>
            <Highlighter />
          </SelectionToolbarItem>
          <SelectionToolbarItem onSelect={onCode}>
            <Code />
          </SelectionToolbarItem>
        </SelectionToolbar>
      </div>
    </div>
  );
}
