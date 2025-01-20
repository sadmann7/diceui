import type { ControlledProps } from "@/types";
import type {
  MentionContentProps,
  MentionInputProps,
  MentionItemProps,
  MentionLabelProps,
  MentionPortalProps,
  MentionRootProps,
} from "@diceui/mention";
import type * as React from "react";

export type RootProps = Omit<MentionRootProps, keyof ControlledProps<"div">>;

export type LabelProps = Omit<
  MentionLabelProps,
  keyof React.ComponentPropsWithoutRef<"label">
>;

export type InputProps = Omit<
  MentionInputProps,
  keyof React.ComponentPropsWithoutRef<"input">
>;

export type ContentProps = Omit<
  MentionContentProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type ItemProps = Omit<
  MentionItemProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;

export type PortalProps = Omit<
  MentionPortalProps,
  keyof React.ComponentPropsWithoutRef<"div">
>;