import type {
  CheckboxGroupDescriptionProps,
  CheckboxGroupIndicatorProps,
  CheckboxGroupItemProps,
  CheckboxGroupLabelProps,
  CheckboxGroupListProps,
  CheckboxGroupMessageProps,
  CheckboxGroupRootProps,
} from "@diceui/checkbox-group";
import type * as React from "react";
import type { ControlledProps } from "@/types";

export type RootProps = Omit<
  CheckboxGroupRootProps,
  keyof ControlledProps<"div">
>;

export type LabelProps = Omit<
  CheckboxGroupLabelProps,
  keyof React.ComponentProps<"label">
>;

export type DescriptionProps = Omit<
  CheckboxGroupDescriptionProps,
  keyof React.ComponentProps<"div">
>;

export type MessageProps = Omit<
  CheckboxGroupMessageProps,
  keyof React.ComponentProps<"div">
>;

export type ListProps = Omit<
  CheckboxGroupListProps,
  keyof React.ComponentProps<"div">
>;

export type ItemProps = Omit<
  CheckboxGroupItemProps,
  keyof Omit<
    React.ComponentProps<"button">,
    "checked" | "defaultChecked" | "onCheckedChange"
  >
>;

export type IndicatorProps = Omit<
  CheckboxGroupIndicatorProps,
  keyof React.ComponentProps<"span">
>;
