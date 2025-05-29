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
  keyof React.ComponentProps<"div">
>;

export type GroupLabelProps = Omit<
  ListboxGroupLabelProps,
  keyof React.ComponentProps<"div">
>;

export type ItemProps = Omit<
  ListboxItemProps,
  keyof Omit<React.ComponentProps<"div">, "onSelect">
>;

export type ItemIndicatorProps = Omit<
  ListboxItemIndicatorProps,
  keyof React.ComponentProps<"span">
>;
