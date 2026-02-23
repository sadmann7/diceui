"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type * as React from "react";

interface VisuallyHiddenProps
  extends React.ComponentProps<"span">,
    useRender.ComponentProps<"span"> {}

function VisuallyHidden(props: VisuallyHiddenProps) {
  const { style, render, ...visuallyHiddenProps } = props;

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        style: {
          border: 0,
          clip: "rect(0 0 0 0)",
          clipPath: "inset(50%)",
          height: "1px",
          margin: "-1px",
          overflow: "hidden",
          padding: 0,
          position: "absolute",
          whiteSpace: "nowrap",
          width: "1px",
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
