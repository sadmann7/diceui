import "@testing-library/jest-dom/vitest";
import type { Editor as TiptapEditor } from "@tiptap/core";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import * as BaseEditor from "@/registry/bases/base/ui/editor";
import * as RadixEditor from "@/registry/bases/radix/ui/editor";

afterEach(cleanup);

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  const rect = () => new DOMRect(0, 0, 0, 0);
  Range.prototype.getBoundingClientRect ??= rect;
  Range.prototype.getClientRects ??= () => {
    const rects: DOMRect[] = [];
    return Object.assign(rects, { item: () => null });
  };
  document.elementFromPoint ??= () => null;
  Element.prototype.scrollIntoView ??= () => {};
});

function getTiptap() {
  const dom = screen.getByRole("textbox") as HTMLElement & {
    editor?: TiptapEditor;
  };
  if (!dom.editor) throw new Error("Editor isn't mounted");
  return dom.editor;
}

describe.each([
  ["base", BaseEditor],
  ["radix", RadixEditor],
])("Editor (%s)", (_base, Editor) => {
  test("names the editable area and renders the default value", async () => {
    render(
      <Editor.Editor defaultValue="<p>Hello <strong>world</strong></p>">
        <Editor.EditorContent />
      </Editor.Editor>,
    );

    const textbox = await screen.findByRole("textbox", { name: "Editor" });
    expect(textbox).toHaveAttribute("aria-multiline", "true");
    await waitFor(() => expect(textbox).toHaveTextContent("Hello world"));
  });

  test("emits html, and an empty string once cleared", async () => {
    const onValueChange = vi.fn();
    render(
      <Editor.Editor onValueChange={onValueChange}>
        <Editor.EditorContent />
      </Editor.Editor>,
    );

    await screen.findByRole("textbox");
    act(() => {
      getTiptap().commands.insertContent("Hi");
    });
    expect(onValueChange).toHaveBeenLastCalledWith("<p>Hi</p>");

    act(() => {
      getTiptap().commands.clearContent(true);
    });
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  test("doesn't change the content on focus", async () => {
    const onValueChange = vi.fn();
    render(
      <Editor.Editor
        defaultValue="<blockquote><p>Quote</p></blockquote>"
        onValueChange={onValueChange}
      >
        <Editor.EditorToolbar>
          <Editor.EditorUndo />
        </Editor.EditorToolbar>
        <Editor.EditorContent />
      </Editor.Editor>,
    );

    await screen.findByRole("textbox");
    await waitFor(() => expect(getTiptap().isInitialized).toBe(true));
    act(() => {
      getTiptap().commands.focus("end");
    });

    expect(getTiptap().getHTML()).toBe("<blockquote><p>Quote</p></blockquote>");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
  });

  test("reads and writes markdown", async () => {
    const onValueChange = vi.fn();
    render(
      <Editor.Editor
        format="markdown"
        defaultValue="## Title"
        onValueChange={onValueChange}
      >
        <Editor.EditorContent />
      </Editor.Editor>,
    );

    await screen.findByRole("textbox");
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Title",
      ),
    );
    act(() => {
      getTiptap().chain().focus("end").insertContent("!").run();
    });
    expect(onValueChange).toHaveBeenLastCalledWith("## Title!");
  });

  test("updates the content from a controlled value", async () => {
    function Controlled() {
      const [value, setValue] = React.useState("<p>One</p>");
      return (
        <>
          <button type="button" onClick={() => setValue("<p>Two</p>")}>
            Change
          </button>
          <Editor.Editor value={value} onValueChange={setValue}>
            <Editor.EditorContent />
          </Editor.Editor>
        </>
      );
    }
    render(<Controlled />);

    const textbox = await screen.findByRole("textbox");
    await waitFor(() => expect(textbox).toHaveTextContent("One"));
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    await waitFor(() => expect(textbox).toHaveTextContent("Two"));
  });

  test("toggles a mark from the toolbar", async () => {
    const onValueChange = vi.fn();
    render(
      <Editor.Editor defaultValue="<p>Text</p>" onValueChange={onValueChange}>
        <Editor.EditorToolbar>
          <Editor.EditorMark mark="bold" />
          <Editor.EditorMark mark="italic" />
        </Editor.EditorToolbar>
        <Editor.EditorContent />
      </Editor.Editor>,
    );

    const bold = screen.getByRole("button", { name: "Bold" });
    await waitFor(() => expect(bold).toBeEnabled());
    expect(bold).toHaveAttribute("aria-pressed", "false");

    act(() => {
      getTiptap().commands.selectAll();
    });
    fireEvent.click(bold);

    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(onValueChange).toHaveBeenLastCalledWith(
      "<p><strong>Text</strong></p>",
    );
  });

  test("moves between toolbar items with the arrow keys", async () => {
    render(
      <Editor.Editor defaultValue="<p>Text</p>">
        <Editor.EditorToolbar>
          <Editor.EditorMark mark="bold" />
          <Editor.EditorMark mark="italic" />
        </Editor.EditorToolbar>
        <Editor.EditorContent />
      </Editor.Editor>,
    );

    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    await waitFor(() => expect(italic).toBeEnabled());
    expect(bold).toHaveAttribute("tabindex", "0");
    expect(italic).toHaveAttribute("tabindex", "-1");

    act(() => bold.focus());
    fireEvent.keyDown(bold, { key: "ArrowRight" });

    expect(italic).toHaveFocus();
    expect(italic).toHaveAttribute("tabindex", "0");
    expect(bold).toHaveAttribute("tabindex", "-1");
  });

  test("disables the controls and the editable area", async () => {
    render(
      <Editor.Editor defaultValue="<p>Text</p>" disabled>
        <Editor.EditorToolbar>
          <Editor.EditorMark mark="bold" />
        </Editor.EditorToolbar>
        <Editor.EditorContent />
      </Editor.Editor>,
    );

    const textbox = await screen.findByRole("textbox");
    await waitFor(() =>
      expect(textbox).toHaveAttribute("contenteditable", "false"),
    );
    expect(textbox).toHaveAttribute("aria-readonly", "true");
    expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
  });

  test("runs a slash command from the keyboard", async () => {
    render(
      <Editor.Editor>
        <Editor.EditorToolbar>
          <Editor.EditorMark mark="bold" />
        </Editor.EditorToolbar>
        <Editor.EditorContent />
        <Editor.EditorSlashMenu />
      </Editor.Editor>,
    );

    const textbox = await screen.findByRole("textbox");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Bold" })).toBeEnabled(),
    );
    act(() => {
      getTiptap().chain().focus().insertContent("/head").run();
    });

    const listbox = await screen.findByRole("listbox", { hidden: true });
    expect(listbox).toHaveAttribute("aria-label", "Commands");
    const getOption = (label: string) =>
      screen
        .getAllByRole("option", { hidden: true })
        .find((option) => option.textContent === label);
    expect(textbox).toHaveAttribute("aria-controls", listbox.id);
    expect(
      screen
        .getAllByRole("option", { hidden: true })
        .map((option) => option.textContent),
    ).toEqual(["Heading 1", "Heading 2", "Heading 3"]);
    expect(getOption("Heading 1")).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(textbox, { key: "ArrowDown" });
    expect(textbox).toHaveAttribute(
      "aria-activedescendant",
      getOption("Heading 2")?.id,
    );

    fireEvent.keyDown(textbox, { key: "Enter" });
    await waitFor(() =>
      expect(
        screen.queryByRole("listbox", { hidden: true }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(textbox).not.toHaveTextContent("/head");
    expect(textbox).not.toHaveAttribute("aria-controls");
  });

  test("shows the character count against the limit", async () => {
    render(
      <Editor.Editor defaultValue="<p>Hello</p>" limit={5}>
        <Editor.EditorContent />
        <Editor.EditorCharacterCount />
      </Editor.Editor>,
    );

    await screen.findByRole("textbox");
    await waitFor(() => expect(screen.getByText("5/5")).toBeInTheDocument());
    expect(screen.getByText("5/5")).toHaveAttribute("data-limit");
  });
});
