import type * as React from "react";

import * as ComboboxPrimitive from "@diceui/combobox";
import { cn } from "cn";

import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

const Combobox = (({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Root>) => {
  return (
    <ComboboxPrimitive.Root
      data-slot="combobox"
      className={cn(className)}
      {...props}
    />
  );
}) as ComboboxPrimitive.ComboboxRootComponentProps;

function ComboboxLabel({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Label>) {
  return (
    <ComboboxPrimitive.Label
      data-slot="combobox-label"
      className={cn("cn-combobox-label", className)}
      {...props}
    />
  );
}

function ComboboxAnchor({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Anchor>) {
  return (
    <ComboboxPrimitive.Anchor
      data-slot="combobox-anchor"
      className={cn("cn-combobox-anchor", className)}
      {...props}
    />
  );
}

function ComboboxInput({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Input>) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn("cn-combobox-input", className)}
      {...props}
    />
  );
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Trigger>) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn("cn-combobox-trigger", className)}
      {...props}
    >
      {children || (
        <IconPlaceholder
          lucide="ChevronDown"
          tabler="IconChevronDown"
          hugeicons="ArrowDown01Icon"
          phosphor="CaretDownIcon"
          remixicon="RiArrowDownSLine"
          className="cn-combobox-trigger-2"
        />
      )}
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxCancel({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Cancel>) {
  return (
    <ComboboxPrimitive.Cancel
      data-slot="combobox-cancel"
      className={cn("cn-combobox-cancel", className)}
      {...props}
    />
  );
}

function ComboboxBadgeList({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.BadgeList>) {
  return (
    <ComboboxPrimitive.BadgeList
      data-slot="combobox-badge-list"
      className={cn("cn-combobox-badge-list", className)}
      {...props}
    />
  );
}

function ComboboxBadgeItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.BadgeItem>) {
  return (
    <ComboboxPrimitive.BadgeItem
      data-slot="combobox-badge-item"
      className={cn("cn-combobox-badge-item", className)}
      {...props}
    >
      <span className="cn-combobox-badge-item-2">{children}</span>
      <ComboboxPrimitive.BadgeItemDelete
        data-slot="combobox-badge-item-delete"
        className="cn-combobox-badge-item-delete"
      >
        <IconPlaceholder
          lucide="X"
          tabler="IconX"
          hugeicons="Cancel01Icon"
          phosphor="XIcon"
          remixicon="RiCloseLine"
          className="cn-combobox-badge-item-3"
        />
      </ComboboxPrimitive.BadgeItemDelete>
    </ComboboxPrimitive.BadgeItem>
  );
}

function ComboboxContent({
  sideOffset = 6,
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Content>) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Content
        data-slot="combobox-content"
        sideOffset={sideOffset}
        className={cn("cn-combobox-content", className)}
        {...props}
      >
        {children}
      </ComboboxPrimitive.Content>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxLoading({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Loading>) {
  return (
    <ComboboxPrimitive.Loading
      data-slot="combobox-loading"
      className={cn("cn-combobox-loading", className)}
      {...props}
    >
      Loading...
    </ComboboxPrimitive.Loading>
  );
}

function ComboboxEmpty({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Empty>) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn("cn-combobox-empty", className)}
      {...props}
    />
  );
}

function ComboboxGroup({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Group>) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn("cn-combobox-group", className)}
      {...props}
    />
  );
}

function ComboboxGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.GroupLabel>) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-group-label"
      className={cn("cn-combobox-group-label", className)}
      {...props}
    />
  );
}

function ComboboxItem({
  className,
  children,
  outset,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Item> & {
  outset?: boolean;
}) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "cn-combobox-item",
        outset ? "pr-8 pl-2" : "pr-2 pl-8",
        className,
      )}
      {...props}
    >
      <ComboboxPrimitive.ItemIndicator
        className={cn("cn-combobox-item-2", outset ? "right-2" : "left-2")}
      >
        <IconPlaceholder
          lucide="Check"
          tabler="IconCheck"
          hugeicons="Tick02Icon"
          phosphor="CheckIcon"
          remixicon="RiCheckLine"
          className="cn-combobox-item-3"
        />
      </ComboboxPrimitive.ItemIndicator>
      <ComboboxPrimitive.ItemText>{children}</ComboboxPrimitive.ItemText>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Separator>) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("cn-combobox-separator", className)}
      {...props}
    />
  );
}

export {
  Combobox,
  ComboboxAnchor,
  ComboboxBadgeItem,
  ComboboxBadgeList,
  ComboboxCancel,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxLoading,
  ComboboxSeparator,
  ComboboxTrigger,
};
