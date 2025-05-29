import type { ControlledProps } from "@/types";
import type {
  TagsInputClearProps,
  TagsInputInputProps,
  TagsInputItemDeleteProps,
  TagsInputItemProps,
  TagsInputItemTextProps,
  TagsInputLabelProps,
  TagsInputRootProps,
} from "@diceui/tags-input";
import type * as React from "react";

export type RootProps = Omit<TagsInputRootProps, keyof ControlledProps<"div">>;

export type LabelProps = Omit<
  TagsInputLabelProps,
  keyof React.ComponentProps<"label">
>;

export type ItemProps = Omit<
  TagsInputItemProps,
  keyof React.ComponentProps<"div">
>;

export type InputProps = Omit<
  TagsInputInputProps,
  keyof React.ComponentProps<"input">
>;

export type ItemDeleteProps = Omit<
  TagsInputItemDeleteProps,
  keyof React.ComponentProps<"button">
>;

export type ItemTextProps = Omit<
  TagsInputItemTextProps,
  keyof React.ComponentProps<"span">
>;

export type ClearProps = Omit<
  TagsInputClearProps,
  keyof React.ComponentProps<"button">
>;
