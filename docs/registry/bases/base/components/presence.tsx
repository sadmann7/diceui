"use client";

import type * as React from "react";

interface PresenceProps {
  children:
    | React.ReactElement
    | ((props: { present: boolean }) => React.ReactElement);
  present: boolean;
}

function Presence({ children, present }: PresenceProps) {
  if (!present) return null;

  return typeof children === "function" ? children({ present }) : children;
}

export { Presence };
