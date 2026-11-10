import type { AnyExtension, JSONContent } from "@tiptap/core";

import type { Button } from "@/registry/bases/radix/ui/button";
import type {
  Editor,
  EditorBlockType,
  EditorMarkType,
  EditorSlashMenuItemData,
} from "@/registry/bases/radix/ui/editor";
import type { SelectTrigger } from "@/registry/bases/radix/ui/select";
import type { Align, CompositionProps, EmptyProps, Side } from "@/types";

type ButtonProps = React.ComponentProps<typeof Button>;
type SelectTriggerProps = React.ComponentProps<typeof SelectTrigger>;
type EditorLabels = NonNullable<React.ComponentProps<typeof Editor>["labels"]>;

export interface EditorProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The format of `value`, `defaultValue` and `onValueChange`.
   *
   * - `html`: an HTML string, or `""` when the editor is empty.
   * - `markdown`: a Markdown string.
   * - `json`: Tiptap's `JSONContent`.
   *
   * @default "html"
   */
  format?: "html" | "markdown" | "json";

  /**
   * The controlled content, in `format`.
   *
   * ```ts
   * value="<p>Hello <strong>world</strong></p>"
   * ```
   */
  value?: string | JSONContent;

  /**
   * The content for uncontrolled usage, in `format`.
   */
  defaultValue?: string | JSONContent;

  /**
   * Event handler called when the content changes, with the content in
   * `format`.
   *
   * ```ts
   * onValueChange={(value) => console.log(value)}
   * ```
   */
  onValueChange?: (value: string | JSONContent) => void;

  /**
   * More Tiptap extensions, added after the built-in ones. Read when the
   * editor is created.
   *
   * ```ts
   * extensions={[Highlight, Typography]}
   * ```
   */
  extensions?: AnyExtension[];

  /**
   * The text shown while the editor is empty.
   */
  placeholder?: string;

  /**
   * The most characters the editor accepts. Read when the editor is created.
   */
  limit?: number;

  /**
   * Whether to focus the editor once it's created.
   *
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Whether the editor is disabled.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the content is read-only. Unlike `disabled`, the editor isn't
   * dimmed.
   *
   * @default false
   */
  readOnly?: boolean;

  /**
   * The built-in text, for translating or rewording it. Labels you leave out
   * keep their English default.
   *
   * ```ts
   * labels={{ bold: "Gras", italic: "Italique" }}
   * ```
   */
  labels?: EditorLabels;
}

export interface EditorContentProps extends EmptyProps<"div"> {}

export interface EditorToolbarProps
  extends EmptyProps<"div">, CompositionProps {
  /**
   * The direction the arrow keys move focus in.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}

export interface EditorMarkProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {
  /**
   * The mark to toggle.
   */
  mark: EditorMarkType;
}

export interface EditorBlockProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {
  /**
   * The block to toggle.
   */
  block: EditorBlockType;
}

export interface EditorBlockSelectProps extends Omit<
  SelectTriggerProps,
  keyof React.ComponentProps<"button">
> {
  /**
   * The blocks to list, in order.
   *
   * @default ["paragraph", "heading1", "heading2", "heading3", "bulletList", "orderedList", "taskList", "blockquote", "codeBlock"]
   */
  blocks?: EditorBlockType[];
}

export interface EditorLinkProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {
  /**
   * The controlled open state of the link popover.
   */
  open?: boolean;

  /**
   * Event handler called when the link popover opens or closes.
   */
  onOpenChange?: (open: boolean) => void;
}

interface FloatingProps {
  /**
   * The preferred side to show the menu on. It flips when there's no room.
   */
  side?: Side;

  /**
   * The distance in pixels from the text.
   */
  sideOffset?: number;

  /**
   * The preferred alignment against the text.
   */
  align?: Align;

  /**
   * An offset in pixels from the `align` position.
   *
   * @default 0
   */
  alignOffset?: number;

  /**
   * Whether to flip and shift the menu to keep it in view.
   *
   * @default true
   */
  avoidCollisions?: boolean;

  /**
   * The distance in pixels from the viewport edges.
   *
   * @default 8
   */
  collisionPadding?: number;

  /**
   * The element the menu is portaled into.
   *
   * @default document.body
   */
  portalContainer?: Element | DocumentFragment | null;
}

export interface EditorBubbleMenuProps
  extends EmptyProps<"div">, CompositionProps, FloatingProps {}

export interface EditorSlashMenuProps
  extends EmptyProps<"div">, CompositionProps, Omit<FloatingProps, "side"> {
  /**
   * The commands to list. Pass a function to change the default commands,
   * like adding descriptions or more commands.
   *
   * ```ts
   * items={(items) => [
   *   ...items,
   *   {
   *     value: "date",
   *     label: "Today's date",
   *     onSelect: ({ editor, range }) =>
   *       editor.chain().focus().deleteRange(range).insertContent(new Date().toDateString()).run(),
   *   },
   * ]}
   * ```
   */
  items?:
    | EditorSlashMenuItemData[]
    | ((defaultItems: EditorSlashMenuItemData[]) => EditorSlashMenuItemData[]);

  /**
   * The character that opens the menu.
   *
   * @default "/"
   */
  char?: string;

  /**
   * The preferred side to show the menu on.
   *
   * @default "bottom"
   */
  side?: "top" | "bottom";

  /**
   * Renders each command. Defaults to `EditorSlashMenuItem`.
   *
   * ```tsx
   * {(item) => <EditorSlashMenuItem item={item} />}
   * ```
   */
  children?: (item: EditorSlashMenuItemData) => React.ReactNode;
}

export interface EditorSlashMenuItemProps
  extends EmptyProps<"div">, CompositionProps {
  /**
   * The command this option runs.
   */
  item: EditorSlashMenuItemData;
}

export interface EditorCharacterCountProps
  extends EmptyProps<"div">, CompositionProps {
  /**
   * What to count.
   *
   * @default "characters"
   */
  mode?: "characters" | "words";

  /**
   * Renders the count yourself.
   *
   * ```tsx
   * {({ characters, limit }) => `${limit - characters} left`}
   * ```
   */
  children?: (count: {
    characters: number;
    words: number;
    limit?: number;
  }) => React.ReactNode;
}
