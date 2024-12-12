import type {
  TagsInputClearProps,
  TagsInputInputProps,
  TagsInputItemDeleteProps,
  TagsInputItemProps,
  TagsInputItemTextProps,
  TagsInputLabelProps,
  TagsInputListProps,
  TagsInputRootProps,
} from "@diceui/tags-input";
import type * as React from "react";

export type RootProps = Omit<
  TagsInputRootProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type LabelProps = Omit<
  TagsInputLabelProps,
  keyof React.ComponentPropsWithoutRef<"label">
>;

export type ListProps = Omit<
  TagsInputListProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type ItemProps = Omit<
  TagsInputItemProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type InputProps = Omit<
  TagsInputInputProps,
  keyof React.ComponentPropsWithoutRef<"input">
>;

export type ItemDeleteProps = Omit<
  TagsInputItemDeleteProps,
  keyof React.ComponentPropsWithoutRef<"button">
>;

export type ItemTextProps = Omit<
  TagsInputItemTextProps,
  keyof React.ComponentPropsWithoutRef<"span">
>;

export type ClearProps = Omit<
  TagsInputClearProps,
  keyof React.ComponentPropsWithoutRef<"button">
>;
