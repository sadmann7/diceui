"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const ROOT_NAME = "Kbd";
const SEPARATOR_NAME = "KbdSeparator";
const KEY_NAME = "KbdKey";

const KBD_ERROR = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` components must be within \`${ROOT_NAME}\``,
  [SEPARATOR_NAME]: `\`${SEPARATOR_NAME}\` must be within \`${ROOT_NAME}\``,
  [KEY_NAME]: `\`${KEY_NAME}\` must be within \`${ROOT_NAME}\``,
} as const;

interface KbdContextValue {
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "ghost";
}

const KbdContext = React.createContext<KbdContextValue | null>(null);
KbdContext.displayName = ROOT_NAME;

function useKbdContext(name: keyof typeof KBD_ERROR) {
  const context = React.useContext(KbdContext);
  if (!context) {
    throw new Error(KBD_ERROR[name]);
  }
  return context;
}

interface KbdRootProps extends React.ComponentPropsWithoutRef<"kbd"> {
  id?: string;
  size?: KbdContextValue["size"];
  variant?: KbdContextValue["variant"];
  asChild?: boolean;
}

const KbdRoot = React.forwardRef<HTMLElement, KbdRootProps>(
  (props, forwardedRef) => {
    const {
      size = "default",
      variant = "default",
      asChild,
      className,
      ...rootProps
    } = props;

    const contextValue = React.useMemo<KbdContextValue>(
      () => ({
        size,
        variant,
      }),
      [size, variant],
    );

    const RootSlot = asChild ? Slot : "kbd";

    return (
      <KbdContext.Provider value={contextValue}>
        <RootSlot
          role="group"
          data-slot="kbd"
          {...rootProps}
          ref={forwardedRef}
          className={cn(
            "inline-flex w-fit items-center gap-1 font-medium font-mono text-[10px] text-foreground/70 sm:text-[11px]",
            size === "default" && "h-6 rounded px-1.5",
            size === "sm" && "h-5 rounded-sm px-1",
            size === "lg" && "h-7 rounded-md px-2 ",
            variant === "default" && "bg-accent",
            variant === "outline" && "bg-background px-0",
            variant === "ghost" && "bg-transparent shadow-none",
            className,
          )}
        />
      </KbdContext.Provider>
    );
  },
);
KbdRoot.displayName = ROOT_NAME;

const KEY_DESCRIPTIONS: Record<string, string> = {
  "⌘": "Command",
  "⇧": "Shift",
  "⌥": "Option",
  "⌃": "Control",
  Ctrl: "Control",
  "⌫": "Backspace",
  "⎋": "Escape",
  "↩": "Return",
  "⇥": "Tab",
  "⌤": "Enter",
  "↑": "Arrow Up",
  "↓": "Arrow Down",
  "←": "Arrow Left",
  "→": "Arrow Right",
  "⇪": "Caps Lock",
  fn: "Function",
  "⌦": "Delete",
  "⇞": "Page Up",
  "⇟": "Page Down",
  "↖": "Home",
  "↘": "End",
  "↕": "Page Up/Down",
  "↔": "Left/Right",
} as const;

interface KbdKeyProps extends React.ComponentPropsWithoutRef<"span"> {
  asChild?: boolean;
  description?: string;
}

const KbdKey = React.forwardRef<HTMLSpanElement, KbdKeyProps>(
  (props, forwardedRef) => {
    const { asChild, className, children, description, ...keyProps } = props;
    const context = useKbdContext(KEY_NAME);

    const KeySlot = asChild ? Slot : "span";

    const keyText = children?.toString() ?? "";
    const keyDescription = description ?? KEY_DESCRIPTIONS[keyText] ?? keyText;

    const Inner = (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded",
          context.variant === "outline" &&
            "min-w-[20px] border border-border bg-muted/30 px-1.5 shadow-sm",
          className,
        )}
      >
        {children}
      </span>
    );

    if (asChild) {
      return (
        <KeySlot
          role="presentation"
          aria-label={keyDescription}
          data-slot="kbd-key"
          {...keyProps}
          ref={forwardedRef}
        >
          {Inner}
        </KeySlot>
      );
    }

    return (
      <abbr
        title={keyDescription}
        {...keyProps}
        ref={forwardedRef}
        className="no-underline"
      >
        {Inner}
      </abbr>
    );
  },
);
KbdKey.displayName = KEY_NAME;

interface KbdSeparatorProps extends React.ComponentPropsWithoutRef<"span"> {
  asChild?: boolean;
}

const KbdSeparator = React.forwardRef<HTMLSpanElement, KbdSeparatorProps>(
  (props, forwardedRef) => {
    const { asChild, children = "+", className, ...separatorProps } = props;
    useKbdContext(SEPARATOR_NAME);

    const SeparatorSlot = asChild ? Slot : "span";

    return (
      <SeparatorSlot
        role="separator"
        aria-orientation="horizontal"
        aria-hidden="true"
        data-slot="kbd-separator"
        {...separatorProps}
        ref={forwardedRef}
        className={cn("text-foreground/70", className)}
      >
        {children}
      </SeparatorSlot>
    );
  },
);
KbdSeparator.displayName = SEPARATOR_NAME;

const Root = KbdRoot;
const Key = KbdKey;
const Separator = KbdSeparator;

export {
  KbdRoot,
  KbdKey,
  KbdSeparator,
  //
  Root,
  Key,
  Separator,
};
