import type {
  ComboboxAnchorProps,
  ComboboxArrowProps,
  ComboboxBadgeItemDeleteProps,
  ComboboxBadgeItemProps,
  ComboboxBadgeListProps,
  ComboboxCancelProps,
  ComboboxContentProps,
  ComboboxEmptyProps,
  ComboboxGroupLabelProps,
  ComboboxGroupProps,
  ComboboxInputProps,
  ComboboxItemIndicatorProps,
  ComboboxItemProps,
  ComboboxItemTextProps,
  ComboboxLabelProps,
  ComboboxLoadingProps,
  ComboboxPortalProps,
  ComboboxRootProps,
  ComboboxSeparatorProps,
  ComboboxTriggerProps,
} from "@diceui/combobox";
import type * as React from "react";
import type { ControlledProps } from "@/types";

export type RootProps<Multiple extends boolean = false> = Omit<
  ComboboxRootProps<Multiple>,
  keyof ControlledProps<"div">
>;

export type LabelProps = Omit<
  ComboboxLabelProps,
  keyof React.ComponentProps<"label">
>;

export type AnchorProps = Omit<
  ComboboxAnchorProps,
  keyof React.ComponentProps<"div">
>;

export type TriggerProps = Omit<
  ComboboxTriggerProps,
  keyof React.ComponentProps<"button">
>;

export type InputProps = Omit<
  ComboboxInputProps,
  keyof React.ComponentProps<"input">
>;

export type CancelProps = Omit<
  ComboboxCancelProps,
  keyof React.ComponentProps<"button">
>;

export type PortalProps = Omit<
  ComboboxPortalProps,
  keyof React.ComponentProps<"div">
>;

export type ContentProps = Omit<
  ComboboxContentProps,
  keyof React.ComponentProps<"div">
>;

export type ArrowProps = Omit<
  ComboboxArrowProps,
  keyof React.ComponentProps<"svg">
>;

export type LoadingProps = Omit<
  ComboboxLoadingProps,
  keyof React.ComponentProps<"div">
>;

export type EmptyProps = Omit<
  ComboboxEmptyProps,
  keyof React.ComponentProps<"div">
>;

export type GroupProps = Omit<
  ComboboxGroupProps,
  keyof React.ComponentProps<"div">
>;

export type GroupLabelProps = Omit<
  ComboboxGroupLabelProps,
  keyof React.ComponentProps<"div">
>;

export type ItemProps = Omit<
  ComboboxItemProps,
  keyof Omit<React.ComponentProps<"div">, "onSelect">
>;

export type ItemTextProps = Omit<
  ComboboxItemTextProps,
  keyof React.ComponentProps<"span">
>;

export type ItemIndicatorProps = Omit<
  ComboboxItemIndicatorProps,
  keyof React.ComponentProps<"span">
>;

export type SeparatorProps = Omit<
  ComboboxSeparatorProps,
  keyof React.ComponentProps<"div">
>;

export type BadgeListProps = Omit<
  ComboboxBadgeListProps,
  keyof React.ComponentProps<"div">
>;

export type BadgeItemProps = Omit<
  ComboboxBadgeItemProps,
  keyof React.ComponentProps<"div">
>;

export type BadgeItemDeleteProps = Omit<
  ComboboxBadgeItemDeleteProps,
  keyof React.ComponentProps<"button">
>;
