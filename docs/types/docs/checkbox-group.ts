import type { ControlledProps } from "@/types";
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

export type RootProps = Omit<
  CheckboxGroupRootProps,
  keyof ControlledProps<"div">
>;

export type LabelProps = Omit<
  CheckboxGroupLabelProps,
  keyof React.ComponentPropsWithoutRef<"label">
>;

export type DescriptionProps = Omit<
  CheckboxGroupDescriptionProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type MessageProps = Omit<
  CheckboxGroupMessageProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type ListProps = Omit<
  CheckboxGroupListProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type ItemProps = Omit<
  CheckboxGroupItemProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type IndicatorProps = Omit<
  CheckboxGroupIndicatorProps,
  keyof React.ComponentPropsWithoutRef<"span">
>;
