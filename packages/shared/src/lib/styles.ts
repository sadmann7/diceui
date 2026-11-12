import type * as React from "react";

/** Visually hides content while keeping it accessible to screen readers. */
const visuallyHidden: React.CSSProperties = {
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
} as const;

/** A full-screen overlay backdrop. */
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(2px)",
  zIndex: 50,
} as const;

/** Truncates text with an ellipsis. */
const truncate: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

/** A custom focus ring. */
const focusRing: React.CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)",
  borderRadius: "0.25rem",
} as const;

/** A scrollable container with hidden scrollbars, which WebKit also needs a `::-webkit-scrollbar` rule for. */
const scrollableHidden: React.CSSProperties = {
  overflow: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
} as const;

/** Absolutely positions an element to fill its container. */
const fullSize: React.CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
} as const;

/** Centers content both vertically and horizontally. */
const center: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

/** Prevents text selection. */
const noSelect: React.CSSProperties = {
  userSelect: "none",
  WebkitUserSelect: "none",
  msUserSelect: "none",
} as const;

export {
  center,
  focusRing,
  fullSize,
  noSelect,
  overlay,
  scrollableHidden,
  truncate,
  visuallyHidden,
};
