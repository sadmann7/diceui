import type { ControlledProps } from "@/types";
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

export type RootProps<Multiple extends boolean = false> = Omit<
  ComboboxRootProps<Multiple>,
  keyof ControlledProps<"div">
>;

export type LabelProps = Omit<
  ComboboxLabelProps,
  keyof React.ComponentPropsWithoutRef<"label">
>;

export type AnchorProps = Omit<
  ComboboxAnchorProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type TriggerProps = Omit<
  ComboboxTriggerProps,
  keyof React.ComponentPropsWithoutRef<"button">
>;

export type InputProps = Omit<
  ComboboxInputProps,
  keyof React.ComponentPropsWithoutRef<"input">
>;

export type CancelProps = Omit<
  ComboboxCancelProps,
  keyof React.ComponentPropsWithoutRef<"button">
>;

export type PortalProps = Omit<
  ComboboxPortalProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type ContentProps = Omit<
  ComboboxContentProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type ArrowProps = Omit<
  ComboboxArrowProps,
  keyof React.ComponentPropsWithoutRef<"svg">
>;

export type LoadingProps = Omit<
  ComboboxLoadingProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type EmptyProps = Omit<
  ComboboxEmptyProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type GroupProps = Omit<
  ComboboxGroupProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type GroupLabelProps = Omit<
  ComboboxGroupLabelProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type ItemProps = Omit<
  ComboboxItemProps,
  keyof Omit<React.ComponentPropsWithoutRef<"div">, "onSelect">
>;

export type ItemTextProps = Omit<
  ComboboxItemTextProps,
  keyof React.ComponentPropsWithoutRef<"span">
>;

export type ItemIndicatorProps = Omit<
  ComboboxItemIndicatorProps,
  keyof React.ComponentPropsWithoutRef<"span">
>;

export type SeparatorProps = Omit<
  ComboboxSeparatorProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type BadgeListProps = Omit<
  ComboboxBadgeListProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type BadgeItemProps = Omit<
  ComboboxBadgeItemProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type BadgeItemDeleteProps = Omit<
  ComboboxBadgeItemDeleteProps,
  keyof React.ComponentPropsWithoutRef<"button">
>;
