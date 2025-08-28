import type {
  MentionContentProps,
  MentionInputProps,
  MentionItemProps,
  MentionLabelProps,
  MentionPortalProps,
  MentionRootProps,
} from "@diceui/mention";
import type * as React from "react";
import type { ControlledProps } from "@/types";

export type RootProps = Omit<MentionRootProps, keyof ControlledProps<"div">>;

export type LabelProps = Omit<
  MentionLabelProps,
  keyof React.ComponentProps<"label">
>;

export type InputProps = Omit<
  MentionInputProps,
  keyof React.ComponentProps<"input">
>;

export type ContentProps = Omit<
  MentionContentProps,
  keyof React.ComponentProps<"div">
>;

export type ItemProps = Omit<
  MentionItemProps,
  keyof React.ComponentProps<"div">
>;

export type PortalProps = Omit<
  MentionPortalProps,
  keyof React.ComponentProps<"div">
>;
