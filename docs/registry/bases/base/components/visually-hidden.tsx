"use client";

import type * as React from "react";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { visuallyHidden } from "@base-ui/utils/visuallyHidden";

interface VisuallyHiddenProps
  extends React.ComponentProps<"span">, useRender.ComponentProps<"span"> {}

function VisuallyHidden(props: VisuallyHiddenProps) {
  const { style, render, ...visuallyHiddenProps } = props;

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        style: {
          ...visuallyHidden,
          ...style,
        },
      },
      visuallyHiddenProps,
    ),
    render,
    state: {
      slot: "visually-hidden",
    },
  });
}

export { VisuallyHidden };
