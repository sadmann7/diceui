import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const kbdVariants = cva(
  "inline-flex w-fit items-center gap-1 font-medium font-mono text-[10px] text-foreground/70 sm:text-[11px]",
  {
    variants: {
      size: {
        default: "h-6 rounded px-1.5",
        sm: "h-5 rounded-sm px-1",
        lg: "h-7 rounded-md px-2",
      },
      variant: {
        default: "bg-accent",
        outline:
          "bg-background px-0 [&_[data-slot='kbd-key']]:min-w-[20px] [&_[data-slot='kbd-key']]:border [&_[data-slot='kbd-key']]:border-border [&_[data-slot='kbd-key']]:bg-muted/30 [&_[data-slot='kbd-key']]:px-1.5 [&_[data-slot='kbd-key']]:shadow-xs",
        ghost: "bg-transparent shadow-none",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

interface KbdRootProps
  extends React.ComponentPropsWithoutRef<"kbd">,
    VariantProps<typeof kbdVariants> {
  asChild?: boolean;
}

const KbdRoot = React.forwardRef<HTMLElement, KbdRootProps>(
  (props, forwardedRef) => {
    const {
      variant = "default",
      size = "default",
      asChild,
      className,
      ...rootProps
    } = props;

    const RootSlot = asChild ? Slot : "kbd";

    return (
      <RootSlot
        role="group"
        data-slot="kbd"
        data-variant={variant}
        data-size={size}
        {...rootProps}
        ref={forwardedRef}
        className={cn(kbdVariants({ size, variant, className }))}
      />
    );
  },
);
KbdRoot.displayName = "KbdRoot";

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
}

const KbdKey = React.forwardRef<HTMLSpanElement, KbdKeyProps>(
  (props, forwardedRef) => {
    const {
      asChild,
      className,
      children,
      title: titleProp,
      ...keyProps
    } = props;

    const KeySlot = asChild ? Slot : "span";

    const keyText = children?.toString() ?? "";
    const title = titleProp ?? KEY_DESCRIPTIONS[keyText] ?? keyText;

    return (
      <abbr title={title} className="no-underline">
        <KeySlot
          data-slot="kbd-key"
          {...keyProps}
          ref={forwardedRef}
          className={cn(
            "inline-flex items-center justify-center rounded",
            className,
          )}
        >
          {children}
        </KeySlot>
      </abbr>
    );
  },
);
KbdKey.displayName = "KbdKey";

interface KbdSeparatorProps extends React.ComponentPropsWithoutRef<"span"> {
  asChild?: boolean;
}

const KbdSeparator = React.forwardRef<HTMLSpanElement, KbdSeparatorProps>(
  (props, forwardedRef) => {
    const { asChild, children = "+", className, ...separatorProps } = props;

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
KbdSeparator.displayName = "KbdSeparator";

const Kbd = KbdRoot;
const Root = KbdRoot;
const Key = KbdKey;
const Separator = KbdSeparator;

export {
  Kbd,
  KbdKey,
  KbdSeparator,
  //
  Root,
  Key,
  Separator,
};
