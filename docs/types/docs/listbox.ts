import type { ControlledProps } from "@/types";
import type {
  ListboxGroupLabelProps,
  ListboxGroupProps,
  ListboxItemIndicatorProps,
  ListboxItemProps,
  ListboxRootProps,
} from "@diceui/listbox";
import type * as React from "react";

export type RootProps<Multiple extends boolean = false> = Omit<
  ListboxRootProps<Multiple>,
  keyof ControlledProps<"div">
>;

export type GroupProps = Omit<
  ListboxGroupProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type GroupLabelProps = Omit<
  ListboxGroupLabelProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type ItemProps = Omit<
  ListboxItemProps,
  keyof Omit<React.ComponentPropsWithoutRef<"div">, "onSelect">
>;

export type ItemIndicatorProps = Omit<
  ListboxItemIndicatorProps,
  keyof React.ComponentPropsWithoutRef<"span">
>;
