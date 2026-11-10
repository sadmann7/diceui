"use client";

import {
  autoUpdate,
  flip,
  hide,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react-dom";
import {
  type AnyExtension,
  type ChainedCommands,
  Extension,
  type JSONContent,
  posToDOMRect,
  type Range,
  type Editor as TiptapEditor,
} from "@tiptap/core";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import {
  EditorContent as EditorContentPrimitive,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { exitSuggestion, Suggestion } from "@tiptap/suggestion";
import { cn } from "cn";
import { Slot as SlotPrimitive } from "radix-ui";
import { useComposedRefs, useLayoutEffect } from "radix-ui/internal";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { useValueAsRef } from "@/registry/bases/radix/hooks/use-value-as-ref";
import { Button } from "@/registry/bases/radix/ui/button";
import { Input } from "@/registry/bases/radix/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/bases/radix/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/bases/radix/ui/select";
import { Separator } from "@/registry/bases/radix/ui/separator";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

const ROOT_NAME = "Editor";
const CONTENT_NAME = "EditorContent";
const TOOLBAR_NAME = "EditorToolbar";
const MARK_NAME = "EditorMark";
const BLOCK_NAME = "EditorBlock";
const BLOCK_SELECT_NAME = "EditorBlockSelect";
const LINK_NAME = "EditorLink";
const UNDO_NAME = "EditorUndo";
const REDO_NAME = "EditorRedo";
const BUBBLE_MENU_NAME = "EditorBubbleMenu";
const SLASH_MENU_NAME = "EditorSlashMenu";
const SLASH_MENU_ITEM_NAME = "EditorSlashMenuItem";
const CHARACTER_COUNT_NAME = "EditorCharacterCount";

const MARKS = ["bold", "italic", "underline", "strike", "code"] as const;
const BLOCKS = [
  "paragraph",
  "heading1",
  "heading2",
  "heading3",
  "bulletList",
  "orderedList",
  "taskList",
  "blockquote",
  "codeBlock",
] as const;

type EditorMarkType = (typeof MARKS)[number];
type EditorBlockType = (typeof BLOCKS)[number];
type EditorFormat = "html" | "markdown" | "json";
type EditorValue = string | JSONContent;
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

const DEFAULT_LABELS = {
  content: "Editor",
  toolbar: "Formatting",
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  code: "Code",
  paragraph: "Text",
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  bulletList: "Bullet list",
  orderedList: "Numbered list",
  taskList: "Task list",
  blockquote: "Quote",
  codeBlock: "Code block",
  horizontalRule: "Divider",
  blockType: "Block type",
  link: "Link",
  linkUrl: "URL",
  linkPlaceholder: "Paste a link",
  applyLink: "Apply link",
  removeLink: "Remove link",
  undo: "Undo",
  redo: "Redo",
  commands: "Commands",
  noResults: "No results",
};

type EditorLabels = typeof DEFAULT_LABELS;

const BLOCK_COMMANDS: Record<
  EditorBlockType,
  {
    isActive: (editor: TiptapEditor) => boolean;
    toggle: (chain: ChainedCommands) => ChainedCommands;
    set: (chain: ChainedCommands) => ChainedCommands;
  }
> = {
  paragraph: {
    isActive: (editor) => editor.isActive("paragraph"),
    toggle: (chain) => chain.clearNodes(),
    set: (chain) => chain.clearNodes(),
  },
  heading1: {
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
    toggle: (chain) => chain.toggleHeading({ level: 1 }),
    set: (chain) => chain.clearNodes().setHeading({ level: 1 }),
  },
  heading2: {
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    toggle: (chain) => chain.toggleHeading({ level: 2 }),
    set: (chain) => chain.clearNodes().setHeading({ level: 2 }),
  },
  heading3: {
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
    toggle: (chain) => chain.toggleHeading({ level: 3 }),
    set: (chain) => chain.clearNodes().setHeading({ level: 3 }),
  },
  bulletList: {
    isActive: (editor) => editor.isActive("bulletList"),
    toggle: (chain) => chain.toggleBulletList(),
    set: (chain) => chain.clearNodes().toggleBulletList(),
  },
  orderedList: {
    isActive: (editor) => editor.isActive("orderedList"),
    toggle: (chain) => chain.toggleOrderedList(),
    set: (chain) => chain.clearNodes().toggleOrderedList(),
  },
  taskList: {
    isActive: (editor) => editor.isActive("taskList"),
    toggle: (chain) => chain.toggleTaskList(),
    set: (chain) => chain.clearNodes().toggleTaskList(),
  },
  blockquote: {
    isActive: (editor) => editor.isActive("blockquote"),
    toggle: (chain) => chain.toggleBlockquote(),
    set: (chain) => chain.clearNodes().setBlockquote(),
  },
  codeBlock: {
    isActive: (editor) => editor.isActive("codeBlock"),
    toggle: (chain) => chain.toggleCodeBlock(),
    set: (chain) => chain.clearNodes().setCodeBlock(),
  },
};

const BLOCK_PRIORITY: EditorBlockType[] = [
  "codeBlock",
  "taskList",
  "orderedList",
  "bulletList",
  "blockquote",
  "heading1",
  "heading2",
  "heading3",
  "paragraph",
];

function getCurrentBlock(editor: TiptapEditor) {
  return BLOCK_PRIORITY.find((block) => BLOCK_COMMANDS[block].isActive(editor));
}

function getValue(editor: TiptapEditor, format: EditorFormat): EditorValue {
  if (format === "json") return editor.getJSON();
  if (format === "markdown") return editor.getMarkdown().replace(/\n+$/, "");
  return editor.isEmpty ? "" : editor.getHTML();
}

function getIsSameValue(a: EditorValue | undefined, b: EditorValue) {
  if (a === b) return true;
  if (typeof a === "object" && typeof b === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

function normalizeHref(href: string) {
  return /^([a-z][\w+.-]*:|[/#?])/i.test(href) ? href : `https://${href}`;
}

function EditorIcon({
  name,
  ...props
}: { name: EditorMarkType | EditorBlockType | "horizontalRule" } & Omit<
  React.ComponentProps<typeof IconPlaceholder>,
  "lucide"
>) {
  switch (name) {
    case "bold":
      return (
        <IconPlaceholder
          lucide="BoldIcon"
          tabler="IconBold"
          hugeicons="TextBoldIcon"
          phosphor="TextBIcon"
          remixicon="RiBold"
          {...props}
        />
      );
    case "italic":
      return (
        <IconPlaceholder
          lucide="ItalicIcon"
          tabler="IconItalic"
          hugeicons="TextItalicIcon"
          phosphor="TextItalicIcon"
          remixicon="RiItalic"
          {...props}
        />
      );
    case "underline":
      return (
        <IconPlaceholder
          lucide="UnderlineIcon"
          tabler="IconUnderline"
          hugeicons="TextUnderlineIcon"
          phosphor="TextUnderlineIcon"
          remixicon="RiUnderline"
          {...props}
        />
      );
    case "strike":
      return (
        <IconPlaceholder
          lucide="StrikethroughIcon"
          tabler="IconStrikethrough"
          hugeicons="TextStrikethroughIcon"
          phosphor="TextStrikethroughIcon"
          remixicon="RiStrikethrough"
          {...props}
        />
      );
    case "code":
      return (
        <IconPlaceholder
          lucide="CodeIcon"
          tabler="IconCode"
          hugeicons="SourceCodeIcon"
          phosphor="CodeIcon"
          remixicon="RiCodeLine"
          {...props}
        />
      );
    case "paragraph":
      return (
        <IconPlaceholder
          lucide="PilcrowIcon"
          tabler="IconPilcrow"
          hugeicons="ParagraphIcon"
          phosphor="ParagraphIcon"
          remixicon="RiParagraph"
          {...props}
        />
      );
    case "heading1":
      return (
        <IconPlaceholder
          lucide="Heading1Icon"
          tabler="IconH1"
          hugeicons="Heading01Icon"
          phosphor="TextHOneIcon"
          remixicon="RiH1"
          {...props}
        />
      );
    case "heading2":
      return (
        <IconPlaceholder
          lucide="Heading2Icon"
          tabler="IconH2"
          hugeicons="Heading02Icon"
          phosphor="TextHTwoIcon"
          remixicon="RiH2"
          {...props}
        />
      );
    case "heading3":
      return (
        <IconPlaceholder
          lucide="Heading3Icon"
          tabler="IconH3"
          hugeicons="Heading03Icon"
          phosphor="TextHThreeIcon"
          remixicon="RiH3"
          {...props}
        />
      );
    case "bulletList":
      return (
        <IconPlaceholder
          lucide="ListIcon"
          tabler="IconList"
          hugeicons="LeftToRightListBulletIcon"
          phosphor="ListBulletsIcon"
          remixicon="RiListUnordered"
          {...props}
        />
      );
    case "orderedList":
      return (
        <IconPlaceholder
          lucide="ListOrderedIcon"
          tabler="IconListNumbers"
          hugeicons="LeftToRightListNumberIcon"
          phosphor="ListNumbersIcon"
          remixicon="RiListOrdered"
          {...props}
        />
      );
    case "taskList":
      return (
        <IconPlaceholder
          lucide="ListTodoIcon"
          tabler="IconListCheck"
          hugeicons="CheckListIcon"
          phosphor="ListChecksIcon"
          remixicon="RiListCheck3"
          {...props}
        />
      );
    case "blockquote":
      return (
        <IconPlaceholder
          lucide="TextQuoteIcon"
          tabler="IconQuote"
          hugeicons="QuoteDownIcon"
          phosphor="QuotesIcon"
          remixicon="RiDoubleQuotesL"
          {...props}
        />
      );
    case "codeBlock":
      return (
        <IconPlaceholder
          lucide="SquareCodeIcon"
          tabler="IconSourceCode"
          hugeicons="CodeSquareIcon"
          phosphor="CodeBlockIcon"
          remixicon="RiCodeBoxLine"
          {...props}
        />
      );
    case "horizontalRule":
      return (
        <IconPlaceholder
          lucide="MinusIcon"
          tabler="IconSeparatorHorizontal"
          hugeicons="MinusSignIcon"
          phosphor="MinusIcon"
          remixicon="RiSeparator"
          {...props}
        />
      );
  }
}

interface EditorContextValue {
  editor: TiptapEditor | null;
  instance: TiptapEditor | null;
  labels: EditorLabels;
  editable: boolean;
  limit?: number;
  linkOpeners: Set<() => boolean>;
}

const EditorContext = React.createContext<EditorContextValue | null>(null);

function useEditorContext(consumerName: string) {
  const context = React.useContext(EditorContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useEditorInstance() {
  return useEditorContext("useEditorInstance").editor;
}

interface EditorBaseProps extends Omit<DivProps, "defaultValue"> {
  extensions?: AnyExtension[];
  placeholder?: string;
  limit?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  labels?: Partial<EditorLabels>;
}

interface EditorStringProps extends EditorBaseProps {
  format?: "html" | "markdown";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface EditorJsonProps extends EditorBaseProps {
  format: "json";
  value?: JSONContent;
  defaultValue?: JSONContent;
  onValueChange?: (value: JSONContent) => void;
}

type EditorProps = EditorStringProps | EditorJsonProps;

function Editor({
  format = "html",
  value: valueProp,
  defaultValue,
  onValueChange,
  extensions = [],
  placeholder,
  limit,
  autoFocus = false,
  disabled = false,
  readOnly = false,
  labels: labelsProp,
  asChild,
  className,
  ...props
}: EditorProps) {
  const editable = !disabled && !readOnly;
  const [initialValue] = React.useState(() => valueProp ?? defaultValue);
  const valueRef = React.useRef<EditorValue | undefined>(initialValue);
  const linkOpeners = React.useMemo(() => new Set<() => boolean>(), []);
  const propsRef = useValueAsRef({ format, onValueChange });

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          link: {
            openOnClick: false,
            autolink: true,
            defaultProtocol: "https",
          },
        }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Placeholder.configure({
          placeholder: placeholder ?? "",
        }),
        CharacterCount.configure({ limit }),
        Markdown,
        Extension.create({
          name: "editorLinkShortcut",
          addProseMirrorPlugins() {
            return [
              new Plugin({
                props: {
                  handleKeyDown: (_view, event) => {
                    if (
                      !(event.metaKey || event.ctrlKey) ||
                      event.shiftKey ||
                      event.altKey ||
                      event.key.toLowerCase() !== "k"
                    ) {
                      return false;
                    }
                    const opened = [...linkOpeners].reduceRight(
                      (opened, open) => opened || open(),
                      false,
                    );
                    if (opened) event.stopPropagation();
                    return opened;
                  },
                },
              }),
            ];
          },
        }),
        ...extensions,
      ],
      content: initialValue,
      contentType: format,
      editable,
      autofocus: autoFocus,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          role: "textbox",
          "aria-multiline": "true",
        },
      },
      onUpdate: ({ editor }) => {
        const value = getValue(editor, propsRef.current.format);
        valueRef.current = value;
        (
          propsRef.current.onValueChange as
            | ((value: EditorValue) => void)
            | undefined
        )?.(value);
      },
    },
    [],
  );

  React.useEffect(() => {
    if (!editor || valueProp === undefined) return;
    if (getIsSameValue(valueRef.current, valueProp)) return;
    valueRef.current = valueProp;
    editor.commands.setContent(valueProp, {
      emitUpdate: false,
      contentType: format,
    });
  }, [editor, valueProp, format]);

  const [createdEditor, setCreatedEditor] = React.useState<TiptapEditor | null>(
    null,
  );
  React.useEffect(() => {
    if (!editor) return;
    const onCreate = () => setCreatedEditor(editor);
    editor.on("create", onCreate);
    return () => {
      editor.off("create", onCreate);
    };
  }, [editor]);
  const isCreated =
    !!editor && (createdEditor === editor || editor.isInitialized);

  React.useEffect(() => {
    const extension = editor?.extensionManager.extensions.find(
      (extension) => extension.name === "placeholder",
    );
    if (!editor || !extension) return;
    if (extension.options.placeholder === (placeholder ?? "")) return;
    extension.options.placeholder = placeholder ?? "";
    editor.view.dispatch(editor.state.tr);
  }, [editor, placeholder]);

  React.useEffect(() => {
    if (!editor || editor.isEditable === editable) return;
    editor.setEditable(editable, false);
  }, [editor, editable]);

  const labels = React.useMemo<EditorLabels>(
    () => ({
      ...DEFAULT_LABELS,
      ...Object.fromEntries(
        Object.entries(labelsProp ?? {}).filter(
          ([, label]) => label !== undefined,
        ),
      ),
    }),
    [labelsProp],
  );

  const contextValue = React.useMemo<EditorContextValue>(
    () => ({
      editor: isCreated ? editor : null,
      instance: editor,
      labels,
      editable,
      limit,
      linkOpeners,
    }),
    [editor, isCreated, labels, editable, limit, linkOpeners],
  );

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <EditorContext.Provider value={contextValue}>
      <RootPrimitive
        data-slot="editor"
        data-disabled={disabled ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
        {...props}
        className={cn("cn-editor flex flex-col", className)}
      />
    </EditorContext.Provider>
  );
}

function EditorContent({
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: React.ComponentProps<"div">) {
  const { instance: editor, labels, editable } = useEditorContext(CONTENT_NAME);

  useLayoutEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const attributes: Record<string, string | undefined> = {
      "aria-label": ariaLabelledBy ? ariaLabel : (ariaLabel ?? labels.content),
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid":
        ariaInvalid === undefined || ariaInvalid === false
          ? undefined
          : String(ariaInvalid),
      "aria-readonly": editable ? undefined : "true",
    };
    for (const [name, value] of Object.entries(attributes)) {
      if (value === undefined) dom.removeAttribute(name);
      else dom.setAttribute(name, value);
    }
  }, [
    editor,
    editable,
    labels.content,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    ariaInvalid,
  ]);

  return (
    <EditorContentPrimitive
      editor={editor}
      data-slot="editor-content"
      {...props}
      className={cn("cn-editor-content cn-editor-prose", className)}
    />
  );
}

const TOOLBAR_ITEM_SELECTOR = "button, [role='combobox'], a[href]";

function getToolbarItems(toolbar: HTMLElement | null) {
  if (!toolbar) return [];
  return [
    ...toolbar.querySelectorAll<HTMLElement>(TOOLBAR_ITEM_SELECTOR),
  ].filter((item) => !item.matches(":disabled, [aria-disabled='true']"));
}

function useRovingFocus(
  ref: React.RefObject<HTMLElement | null>,
  orientation: "horizontal" | "vertical",
  mounted = true,
) {
  const activeRef = React.useRef<HTMLElement | null>(null);

  const sync = React.useCallback(() => {
    const items = getToolbarItems(ref.current);
    const active =
      activeRef.current && items.includes(activeRef.current)
        ? activeRef.current
        : items[0];
    for (const item of items) item.tabIndex = item === active ? 0 : -1;
  }, [ref]);

  useLayoutEffect(() => {
    const toolbar = ref.current;
    if (!toolbar) return;
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(toolbar, {
      subtree: true,
      childList: true,
      attributeFilter: ["disabled", "aria-disabled"],
    });
    return () => observer.disconnect();
  }, [ref, sync, mounted]);

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      const items = getToolbarItems(ref.current);
      if (!items.includes(event.target)) return;
      activeRef.current = event.target;
      sync();
    },
    [ref, sync],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const items = getToolbarItems(ref.current);
      const index = items.indexOf(event.target as HTMLElement);
      if (index === -1) return;

      const isRtl = getComputedStyle(event.currentTarget).direction === "rtl";
      const prevKey =
        orientation === "vertical"
          ? "ArrowUp"
          : isRtl
            ? "ArrowRight"
            : "ArrowLeft";
      const nextKey =
        orientation === "vertical"
          ? "ArrowDown"
          : isRtl
            ? "ArrowLeft"
            : "ArrowRight";

      let next: HTMLElement | undefined;
      if (event.key === nextKey) next = items[(index + 1) % items.length];
      else if (event.key === prevKey) {
        next = items[(index - 1 + items.length) % items.length];
      } else if (event.key === "Home") next = items[0];
      else if (event.key === "End") next = items[items.length - 1];
      if (!next) return;

      event.preventDefault();
      next.focus();
    },
    [ref, orientation],
  );

  return { onFocus, onKeyDown };
}

interface EditorToolbarProps extends DivProps {
  orientation?: "horizontal" | "vertical";
}

function EditorToolbar({
  orientation = "horizontal",
  asChild,
  className,
  ref,
  onFocus: onFocusProp,
  onKeyDown: onKeyDownProp,
  ...props
}: EditorToolbarProps) {
  const { labels } = useEditorContext(TOOLBAR_NAME);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, toolbarRef);
  const { onFocus, onKeyDown } = useRovingFocus(toolbarRef, orientation);

  const ToolbarPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ToolbarPrimitive
      role="toolbar"
      aria-label={labels.toolbar}
      aria-orientation={orientation}
      data-slot="editor-toolbar"
      data-orientation={orientation}
      {...props}
      ref={composedRef}
      className={cn(
        "cn-editor-toolbar flex items-center data-[orientation=vertical]:flex-col",
        className,
      )}
      onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
        onFocusProp?.(event);
        if (!event.defaultPrevented) onFocus(event);
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDownProp?.(event);
        if (!event.defaultPrevented) onKeyDown(event);
      }}
    />
  );
}

function EditorToolbarSeparator({
  orientation = "vertical",
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="editor-toolbar-separator"
      orientation={orientation}
      {...props}
      className={cn("cn-editor-toolbar-separator", className)}
    />
  );
}

interface EditorButtonProps extends React.ComponentProps<typeof Button> {
  pressed?: boolean;
}

function EditorButton({
  pressed,
  variant = "ghost",
  size = "icon-sm",
  className,
  onMouseDown,
  ...props
}: EditorButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-pressed={pressed}
      {...props}
      className={cn("cn-editor-button", className)}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        if (!event.defaultPrevented) event.preventDefault();
      }}
    />
  );
}

interface EditorMarkProps extends React.ComponentProps<typeof Button> {
  mark: EditorMarkType;
}

function EditorMark({
  mark,
  disabled,
  children,
  onClick,
  ...props
}: EditorMarkProps) {
  const { editor, labels, editable } = useEditorContext(MARK_NAME);
  const state = useEditorState({
    editor,
    selector: () =>
      editor
        ? {
            active: editor.isActive(mark),
            can: editor.can().chain().toggleMark(mark).run(),
          }
        : null,
  });

  return (
    <EditorButton
      aria-label={labels[mark]}
      pressed={state?.active ?? false}
      data-mark={mark}
      disabled={disabled || !editable || !state?.can}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        editor?.chain().focus().toggleMark(mark).run();
      }}
    >
      {children ?? <EditorIcon name={mark} />}
    </EditorButton>
  );
}

interface EditorBlockProps extends React.ComponentProps<typeof Button> {
  block: EditorBlockType;
}

function EditorBlock({
  block,
  disabled,
  children,
  onClick,
  ...props
}: EditorBlockProps) {
  const { editor, labels, editable } = useEditorContext(BLOCK_NAME);
  const state = useEditorState({
    editor,
    selector: () =>
      editor
        ? {
            active: getCurrentBlock(editor) === block,
            can: BLOCK_COMMANDS[block].toggle(editor.can().chain()).run(),
          }
        : null,
  });

  return (
    <EditorButton
      aria-label={labels[block]}
      pressed={state?.active ?? false}
      data-block={block}
      disabled={disabled || !editable || !state?.can}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !editor) return;
        BLOCK_COMMANDS[block].toggle(editor.chain().focus()).run();
      }}
    >
      {children ?? <EditorIcon name={block} />}
    </EditorButton>
  );
}

interface EditorBlockSelectProps extends React.ComponentProps<
  typeof SelectTrigger
> {
  blocks?: EditorBlockType[];
}

function EditorBlockSelect({
  blocks = [...BLOCKS],
  disabled,
  size = "sm",
  className,
  ...props
}: EditorBlockSelectProps) {
  const { editor, labels, editable } = useEditorContext(BLOCK_SELECT_NAME);
  const current = useEditorState({
    editor,
    selector: () => (editor ? getCurrentBlock(editor) : undefined),
  });
  const hasChangedRef = React.useRef(false);

  return (
    <Select
      value={current && blocks.includes(current) ? current : ""}
      onValueChange={(value) => {
        if (!editor) return;
        hasChangedRef.current = true;
        BLOCK_COMMANDS[value as EditorBlockType].set(editor.chain()).run();
      }}
      disabled={disabled || !editable || !editor}
    >
      <SelectTrigger
        size={size}
        aria-label={labels.blockType}
        data-slot="editor-block-select"
        {...props}
        className={cn("cn-editor-block-select", className)}
      >
        <SelectValue placeholder={labels.blockType} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        onCloseAutoFocus={(event) => {
          if (!hasChangedRef.current) return;
          hasChangedRef.current = false;
          event.preventDefault();
          editor?.view.focus();
        }}
      >
        {blocks.map((block) => (
          <SelectItem key={block} value={block}>
            {labels[block]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface EditorLinkProps extends React.ComponentProps<typeof Button> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function EditorLink({
  open: openProp,
  onOpenChange,
  disabled,
  children,
  ...props
}: EditorLinkProps) {
  const { editor, labels, editable, linkOpeners } = useEditorContext(LINK_NAME);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = openProp ?? uncontrolledOpen;
  const [url, setUrl] = React.useState("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const appliedRef = React.useRef(false);
  const inputId = React.useId();

  const state = useEditorState({
    editor,
    selector: () =>
      editor
        ? {
            active: editor.isActive("link"),
            can: editor.can().chain().setLink({ href: "#" }).run(),
          }
        : null,
  });
  const isDisabled = disabled || !editable || !state?.can;

  const onOpenChangeRef = useValueAsRef(onOpenChange);
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next && editor) {
        setUrl((editor.getAttributes("link").href as string | undefined) ?? "");
        appliedRef.current = false;
      }
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChangeRef.current?.(next);
    },
    [editor, openProp, onOpenChangeRef],
  );

  React.useEffect(() => {
    if (isDisabled) return;
    const opener = () => {
      if (!triggerRef.current?.isConnected) return false;
      setOpen(true);
      return true;
    };
    linkOpeners.add(opener);
    return () => {
      linkOpeners.delete(opener);
    };
  }, [isDisabled, linkOpeners, setOpen]);

  const onApply = React.useCallback(
    (href: string) => {
      if (!editor) return;
      const trimmed = href.trim();
      const normalized = normalizeHref(trimmed);
      const chain = editor.chain().focus().extendMarkRange("link");
      if (!trimmed) {
        chain.unsetLink().run();
      } else if (editor.state.selection.empty && !editor.isActive("link")) {
        chain
          .insertContent({
            type: "text",
            text: trimmed,
            marks: [{ type: "link", attrs: { href: normalized } }],
          })
          .run();
      } else {
        chain.setLink({ href: normalized }).run();
      }
      appliedRef.current = true;
      setOpen(false);
    },
    [editor, setOpen],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <EditorButton
          ref={triggerRef}
          aria-label={labels.link}
          pressed={state?.active ?? false}
          disabled={isDisabled}
          data-slot="editor-link"
          {...props}
        >
          {children ?? (
            <IconPlaceholder
              lucide="LinkIcon"
              tabler="IconLink"
              hugeicons="Link01Icon"
              phosphor="LinkIcon"
              remixicon="RiLink"
            />
          )}
        </EditorButton>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        data-slot="editor-link-content"
        className="cn-editor-link-content"
        onCloseAutoFocus={(event) => {
          if (!appliedRef.current) return;
          event.preventDefault();
          editor?.commands.focus();
        }}
      >
        <form
          className="cn-editor-link-form flex items-center"
          onSubmit={(event) => {
            event.preventDefault();
            onApply(url);
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            {labels.linkUrl}
          </label>
          <Input
            id={inputId}
            inputMode="url"
            autoComplete="off"
            placeholder={labels.linkPlaceholder}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="cn-editor-link-input"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            aria-label={labels.applyLink}
          >
            <IconPlaceholder
              lucide="CornerDownLeftIcon"
              tabler="IconCornerDownLeft"
              hugeicons="ArrowTurnBackwardIcon"
              phosphor="ArrowElbowDownLeftIcon"
              remixicon="RiCornerDownLeftLine"
            />
          </Button>
          {state?.active && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={labels.removeLink}
              onClick={() => onApply("")}
            >
              <IconPlaceholder
                lucide="UnlinkIcon"
                tabler="IconUnlink"
                hugeicons="Unlink01Icon"
                phosphor="LinkBreakIcon"
                remixicon="RiLinkUnlink"
              />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
}

function EditorUndo({
  disabled,
  children,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { editor, labels, editable } = useEditorContext(UNDO_NAME);
  const can = useEditorState({
    editor,
    selector: () => editor?.can().undo() ?? false,
  });

  return (
    <EditorButton
      aria-label={labels.undo}
      disabled={disabled || !editable || !can}
      data-slot="editor-undo"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        editor?.chain().focus().undo().run();
      }}
    >
      {children ?? (
        <IconPlaceholder
          lucide="Undo2Icon"
          tabler="IconArrowBackUp"
          hugeicons="Undo02Icon"
          phosphor="ArrowUUpLeftIcon"
          remixicon="RiArrowGoBackLine"
          className="cn-rtl-flip"
        />
      )}
    </EditorButton>
  );
}

function EditorRedo({
  disabled,
  children,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { editor, labels, editable } = useEditorContext(REDO_NAME);
  const can = useEditorState({
    editor,
    selector: () => editor?.can().redo() ?? false,
  });

  return (
    <EditorButton
      aria-label={labels.redo}
      disabled={disabled || !editable || !can}
      data-slot="editor-redo"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        editor?.chain().focus().redo().run();
      }}
    >
      {children ?? (
        <IconPlaceholder
          lucide="Redo2Icon"
          tabler="IconArrowForwardUp"
          hugeicons="Redo02Icon"
          phosphor="ArrowUUpRightIcon"
          remixicon="RiArrowGoForwardLine"
          className="cn-rtl-flip"
        />
      )}
    </EditorButton>
  );
}

interface FloatingOptions {
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
  portalContainer?: Element | DocumentFragment | null;
}

function useEditorFloating(
  open: boolean,
  editor: TiptapEditor | null,
  getRect: () => DOMRect | null,
  boundary: Element | null,
  {
    side = "top",
    sideOffset = 8,
    align = "center",
    alignOffset = 0,
    avoidCollisions = true,
    collisionPadding = 8,
  }: FloatingOptions,
) {
  const reference = React.useMemo(
    () =>
      open && editor
        ? {
            getBoundingClientRect: () =>
              getRect() ?? new DOMRect(-9999, -9999, 0, 0),
            contextElement: editor.view.dom,
          }
        : null,
    [open, editor, getRect],
  );

  const {
    refs: { setFloating },
    placement,
    floatingStyles,
    isPositioned,
    middlewareData,
    update,
  } = useFloating({
    open: !!reference,
    placement: align === "center" ? side : `${side}-${align}`,
    strategy: "fixed",
    middleware: [
      offset({ mainAxis: sideOffset, alignmentAxis: alignOffset }),
      avoidCollisions &&
        flip({ padding: collisionPadding, boundary: boundary ?? undefined }),
      avoidCollisions &&
        shift({ padding: collisionPadding, boundary: boundary ?? undefined }),
      hide({ strategy: "referenceHidden", boundary: boundary ?? undefined }),
    ],
    whileElementsMounted: autoUpdate,
    elements: { reference },
  });

  const placedSide = placement.split("-")[0] as Side;
  const hidden = !isPositioned || middlewareData.hide?.referenceHidden;

  return {
    setFloating,
    update,
    side: placedSide,
    style: {
      ...floatingStyles,
      visibility: hidden ? "hidden" : undefined,
    } satisfies React.CSSProperties,
  };
}

interface EditorBubbleMenuProps extends DivProps, FloatingOptions {}

function EditorBubbleMenu({
  side,
  sideOffset,
  align,
  alignOffset,
  avoidCollisions,
  collisionPadding,
  portalContainer,
  asChild,
  className,
  ref,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  onKeyDown: onKeyDownProp,
  onMouseDown: onMouseDownProp,
  ...props
}: EditorBubbleMenuProps) {
  const { editor, labels, editable } = useEditorContext(BUBBLE_MENU_NAME);
  const [hasFocus, setHasFocus] = React.useState(false);
  const state = useEditorState({
    editor,
    selector: () => {
      if (!editor) return null;
      const { selection, doc } = editor.state;
      const { from, to, empty } = selection;
      return {
        from,
        to,
        focused: editor.isFocused,
        visible:
          !empty &&
          !(selection instanceof NodeSelection) &&
          !editor.isActive("codeBlock") &&
          doc.textBetween(from, to, " ").trim().length > 0,
      };
    },
  });

  const open = editable && !!state?.visible && (state.focused || hasFocus);
  const contentElement = editor?.view.dom.parentElement ?? null;
  const getSelectionRect = React.useCallback(() => {
    if (!editor) return null;
    const { from, to, head } = editor.state.selection;
    const rect = posToDOMRect(editor.view, from, to);
    const headRect = posToDOMRect(editor.view, head, head);
    return rect.height > headRect.height * 1.5 ? headRect : rect;
  }, [editor]);
  const blurTimeoutRef = React.useRef<number | null>(null);

  if (!state?.visible && hasFocus) setHasFocus(false);

  React.useEffect(
    () => () => {
      if (blurTimeoutRef.current) window.clearTimeout(blurTimeoutRef.current);
    },
    [],
  );

  const {
    setFloating,
    update,
    side: placedSide,
    style,
  } = useEditorFloating(open, editor, getSelectionRect, contentElement, {
    side,
    sideOffset,
    align,
    alignOffset,
    avoidCollisions,
    collisionPadding,
  });

  React.useEffect(() => {
    if (open) update();
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- the menu follows the selection as it moves
  }, [open, update, state?.from, state?.to]);

  const menuRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, menuRef);
  const { onFocus, onKeyDown } = useRovingFocus(menuRef, "horizontal", open);

  if (!open || typeof document === "undefined") return null;

  const MenuPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return ReactDOM.createPortal(
    <div
      ref={setFloating}
      data-slot="editor-bubble-menu-positioner"
      style={style}
      className="z-50"
    >
      <MenuPrimitive
        role="toolbar"
        aria-label={labels.toolbar}
        aria-orientation="horizontal"
        data-slot="editor-bubble-menu"
        data-side={placedSide}
        data-state="open"
        {...props}
        ref={composedRef}
        className={cn("cn-editor-bubble-menu flex items-center", className)}
        onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => {
          onMouseDownProp?.(event);
          if (!(event.target instanceof HTMLInputElement)) {
            event.preventDefault();
          }
        }}
        onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
          onFocusProp?.(event);
          if (blurTimeoutRef.current)
            window.clearTimeout(blurTimeoutRef.current);
          setHasFocus(true);
          if (!event.defaultPrevented) onFocus(event);
        }}
        onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
          onBlurProp?.(event);
          blurTimeoutRef.current = window.setTimeout(() => setHasFocus(false));
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          onKeyDownProp?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Escape") {
            event.preventDefault();
            editor?.commands.focus();
            return;
          }
          onKeyDown(event);
        }}
      />
    </div>,
    portalContainer ?? document.body,
  );
}

interface EditorSlashMenuItemData {
  value: string;
  label: string;
  description?: string;
  keywords?: string[];
  icon?: React.ReactNode;
  onSelect: (props: { editor: TiptapEditor; range: Range }) => void;
}

function getDefaultSlashMenuItems(
  labels: EditorLabels,
): EditorSlashMenuItemData[] {
  return [
    ...BLOCKS.map((block) => ({
      value: block,
      label: labels[block],
      icon: <EditorIcon name={block} />,
      onSelect: ({ editor, range }: { editor: TiptapEditor; range: Range }) => {
        BLOCK_COMMANDS[block]
          .set(editor.chain().focus().deleteRange(range))
          .run();
      },
    })),
    {
      value: "horizontalRule",
      label: labels.horizontalRule,
      keywords: ["hr", "separator", "line"],
      icon: <EditorIcon name="horizontalRule" />,
      onSelect: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ];
}

function filterSlashMenuItems(items: EditorSlashMenuItemData[], query: string) {
  const search = query.trim().toLowerCase();
  if (!search) return items;
  return items.filter((item) =>
    [item.label, item.value, ...(item.keywords ?? [])].some((text) =>
      text.toLowerCase().includes(search),
    ),
  );
}

interface SlashMenuContextValue {
  listboxId: string;
  highlightedValue?: string;
  getOptionId: (value: string) => string;
  onHighlight: (value: string) => void;
  onSelect: (item: EditorSlashMenuItemData) => void;
}

const SlashMenuContext = React.createContext<SlashMenuContextValue | null>(
  null,
);

interface SlashMenuState {
  open: boolean;
  query: string;
  highlightedIndex: number;
  clientRect: (() => DOMRect | null) | null;
}

interface EditorSlashMenuProps
  extends Omit<DivProps, "children">, Omit<FloatingOptions, "side"> {
  items?:
    | EditorSlashMenuItemData[]
    | ((defaultItems: EditorSlashMenuItemData[]) => EditorSlashMenuItemData[]);
  char?: string;
  side?: "top" | "bottom";
  children?: (item: EditorSlashMenuItemData) => React.ReactNode;
}

function EditorSlashMenu({
  items: itemsProp,
  char = "/",
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset,
  avoidCollisions,
  collisionPadding,
  portalContainer,
  asChild,
  className,
  children,
  onMouseDown,
  ...props
}: EditorSlashMenuProps) {
  const { editor, labels } = useEditorContext(SLASH_MENU_NAME);
  const [state, setState] = React.useState<SlashMenuState>({
    open: false,
    query: "",
    highlightedIndex: 0,
    clientRect: null,
  });
  const listboxId = React.useId();

  const allItems = React.useMemo(() => {
    const defaults = getDefaultSlashMenuItems(labels);
    if (!itemsProp) return defaults;
    return typeof itemsProp === "function" ? itemsProp(defaults) : itemsProp;
  }, [itemsProp, labels]);
  const items = React.useMemo(
    () => filterSlashMenuItems(allItems, state.query),
    [allItems, state.query],
  );
  const highlightedIndex = Math.min(
    state.highlightedIndex,
    Math.max(items.length - 1, 0),
  );
  const highlightedItem = items[highlightedIndex];

  const commandRef = React.useRef<
    ((item: EditorSlashMenuItemData) => void) | null
  >(null);
  const pluginKey = React.useMemo(
    () => new PluginKey(`editorSlashMenu${listboxId.replace(/[^\w]/g, "")}`),
    [listboxId],
  );

  const onSelect = React.useCallback((item: EditorSlashMenuItemData) => {
    commandRef.current?.(item);
  }, []);

  const keyDownRef = useValueAsRef((event: KeyboardEvent) => {
    if (!editor) return false;
    if (event.key === "Escape") {
      exitSuggestion(editor.view, pluginKey);
      return true;
    }
    if (!items.length) return false;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setState((prev) => ({
        ...prev,
        highlightedIndex:
          (highlightedIndex + delta + items.length) % items.length,
      }));
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      if (highlightedItem) onSelect(highlightedItem);
      return true;
    }
    return false;
  });

  React.useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const plugin = Suggestion<EditorSlashMenuItemData, EditorSlashMenuItemData>(
      {
        editor,
        pluginKey,
        char,
        allow: ({ state, range }) =>
          state.doc.resolve(range.from).parent.type.name !== "codeBlock",
        command: ({ editor, range, props: item }) => {
          item.onSelect({ editor, range });
        },
        render: () => ({
          onStart: (props) => {
            commandRef.current = props.command;
            setState({
              open: true,
              query: props.query,
              highlightedIndex: 0,
              clientRect: props.clientRect ?? null,
            });
          },
          onUpdate: (props) => {
            commandRef.current = props.command;
            setState((prev) =>
              prev.query === props.query
                ? prev
                : { ...prev, query: props.query, highlightedIndex: 0 },
            );
          },
          onExit: () => {
            commandRef.current = null;
            setState({
              open: false,
              query: "",
              highlightedIndex: 0,
              clientRect: null,
            });
          },
          onKeyDown: ({ event }) => keyDownRef.current(event),
        }),
      },
    );

    editor.registerPlugin(plugin, (plugin, plugins) => [plugin, ...plugins]);
    return () => {
      if (!editor.isDestroyed) editor.unregisterPlugin(pluginKey);
    };
  }, [editor, char, pluginKey, keyDownRef]);

  const { clientRect } = state;
  const getTriggerRect = React.useCallback(
    () => clientRect?.() ?? null,
    [clientRect],
  );

  const getOptionId = React.useCallback(
    (value: string) => `${listboxId}-${value}`,
    [listboxId],
  );

  useLayoutEffect(() => {
    if (!editor || !state.open) return;
    const dom = editor.view.dom;
    dom.setAttribute("aria-controls", listboxId);
    dom.setAttribute("aria-expanded", "true");
    dom.setAttribute("aria-autocomplete", "list");
    if (highlightedItem) {
      dom.setAttribute(
        "aria-activedescendant",
        getOptionId(highlightedItem.value),
      );
    } else {
      dom.removeAttribute("aria-activedescendant");
    }
    return () => {
      for (const name of [
        "aria-controls",
        "aria-expanded",
        "aria-autocomplete",
        "aria-activedescendant",
      ]) {
        dom.removeAttribute(name);
      }
    };
  }, [editor, state.open, listboxId, highlightedItem, getOptionId]);

  const {
    setFloating,
    update,
    side: placedSide,
    style,
  } = useEditorFloating(state.open, editor, getTriggerRect, null, {
    side,
    sideOffset,
    align,
    alignOffset,
    avoidCollisions,
    collisionPadding,
  });

  React.useEffect(() => {
    if (state.open) update();
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- the menu follows the trigger as the query grows
  }, [state.open, state.query, update]);

  const contextValue = React.useMemo<SlashMenuContextValue>(
    () => ({
      listboxId,
      highlightedValue: highlightedItem?.value,
      getOptionId,
      onHighlight: (value) =>
        setState((prev) => ({
          ...prev,
          highlightedIndex: Math.max(
            items.findIndex((item) => item.value === value),
            0,
          ),
        })),
      onSelect,
    }),
    [listboxId, highlightedItem, getOptionId, items, onSelect],
  );

  if (!state.open || typeof document === "undefined") return null;

  const MenuPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return ReactDOM.createPortal(
    <div
      ref={setFloating}
      data-slot="editor-slash-menu-positioner"
      style={style}
      className="z-50"
    >
      <SlashMenuContext.Provider value={contextValue}>
        <MenuPrimitive
          id={listboxId}
          role="listbox"
          aria-label={labels.commands}
          data-slot="editor-slash-menu"
          data-side={placedSide}
          data-state="open"
          {...props}
          className={cn(
            "cn-editor-slash-menu flex flex-col overflow-y-auto",
            className,
          )}
          onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => {
            onMouseDown?.(event);
            event.preventDefault();
          }}
        >
          {items.length ? (
            items.map((item) => (
              <React.Fragment key={item.value}>
                {children ? (
                  children(item)
                ) : (
                  <EditorSlashMenuItem item={item} />
                )}
              </React.Fragment>
            ))
          ) : (
            <div
              data-slot="editor-slash-menu-empty"
              className="cn-editor-slash-menu-empty"
            >
              {labels.noResults}
            </div>
          )}
        </MenuPrimitive>
      </SlashMenuContext.Provider>
    </div>,
    portalContainer ?? document.body,
  );
}

interface EditorSlashMenuItemProps extends DivProps {
  item: EditorSlashMenuItemData;
}

function EditorSlashMenuItem({
  item,
  asChild,
  className,
  children,
  onClick,
  onPointerMove,
  ...props
}: EditorSlashMenuItemProps) {
  const context = React.useContext(SlashMenuContext);
  if (!context) {
    throw new Error(
      `\`${SLASH_MENU_ITEM_NAME}\` must be used within \`${SLASH_MENU_NAME}\``,
    );
  }
  const { highlightedValue, getOptionId, onHighlight, onSelect } = context;
  const highlighted = highlightedValue === item.value;
  const itemRef = React.useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (highlighted) itemRef.current?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ItemPrimitive
      id={getOptionId(item.value)}
      role="option"
      aria-selected={highlighted}
      data-slot="editor-slash-menu-item"
      data-highlighted={highlighted ? "" : undefined}
      {...props}
      ref={itemRef}
      className={cn(
        "cn-editor-slash-menu-item flex cursor-default items-center select-none",
        className,
      )}
      onPointerMove={(event: React.PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        if (!event.defaultPrevented && !highlighted) onHighlight(item.value);
      }}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) onSelect(item);
      }}
    >
      {children ?? (
        <>
          {item.icon && (
            <span
              data-slot="editor-slash-menu-item-icon"
              className="cn-editor-slash-menu-item-icon flex shrink-0 items-center justify-center"
            >
              {item.icon}
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{item.label}</span>
            {item.description && (
              <span
                data-slot="editor-slash-menu-item-description"
                className="cn-editor-slash-menu-item-description truncate"
              >
                {item.description}
              </span>
            )}
          </span>
        </>
      )}
    </ItemPrimitive>
  );
}

interface EditorCharacterCountProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  asChild?: boolean;
  mode?: "characters" | "words";
  children?: (count: {
    characters: number;
    words: number;
    limit?: number;
  }) => React.ReactNode;
}

function EditorCharacterCount({
  mode = "characters",
  asChild,
  className,
  children,
  ...props
}: EditorCharacterCountProps) {
  const { editor, limit } = useEditorContext(CHARACTER_COUNT_NAME);
  const count = useEditorState({
    editor,
    selector: () => ({
      characters: editor?.storage.characterCount.characters() ?? 0,
      words: editor?.storage.characterCount.words() ?? 0,
    }),
  }) ?? { characters: 0, words: 0 };
  const isLimit =
    mode === "characters" && limit !== undefined && count.characters >= limit;

  const CountPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <CountPrimitive
      data-slot="editor-character-count"
      data-limit={isLimit ? "" : undefined}
      {...props}
      className={cn("cn-editor-character-count tabular-nums", className)}
    >
      {children
        ? children({ ...count, limit })
        : mode === "words"
          ? count.words
          : limit !== undefined
            ? `${count.characters}/${limit}`
            : count.characters}
    </CountPrimitive>
  );
}

export {
  Editor,
  EditorContent,
  EditorToolbar,
  EditorToolbarSeparator,
  EditorMark,
  EditorBlock,
  EditorBlockSelect,
  EditorLink,
  EditorUndo,
  EditorRedo,
  EditorBubbleMenu,
  EditorSlashMenu,
  EditorSlashMenuItem,
  EditorCharacterCount,
  useEditorInstance,
  getDefaultSlashMenuItems,
  type EditorSlashMenuItemData,
};
