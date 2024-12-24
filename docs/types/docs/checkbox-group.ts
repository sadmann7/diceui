// docs/types/docs/checkbox-group.ts
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
import type { ControlledProps } from "..";

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
