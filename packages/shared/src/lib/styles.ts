import type * as React from "react";

/**
 * CSS style object that visually hides content while keeping it accessible to screen readers.
 * This follows accessibility best practices for visually hidden content.
 */
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

/**
 * CSS style object for a full-screen overlay backdrop.
 * Useful for modals, dialogs, and other overlay components.
 */
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(2px)",
  zIndex: 50,
} as const;

/**
 * CSS style object for text truncation with ellipsis.
 * Ensures text fits within its container.
 */
const truncate: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

/**
 * CSS style object for a custom focus ring style.
 * Provides a consistent, accessible focus indicator.
 */
const focusRing: React.CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)",
  borderRadius: "0.25rem",
} as const;

/**
 * CSS style object to create a scrollable container that hides scrollbars.
 * Note: For webkit browsers, you'll need to add additional CSS for ::-webkit-scrollbar
 */
const scrollableHidden: React.CSSProperties = {
  overflow: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
} as const;

/**
 * CSS style object for absolutely positioning an element to fill its container.
 * Useful for overlays, backgrounds, and full-size children.
 */
const fullSize: React.CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
} as const;

/**
 * CSS style object for centering content both vertically and horizontally.
 * Uses flexbox for better browser support.
 */
const center: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

/**
 * CSS style object to prevent text selection.
 * Useful for interactive elements like buttons.
 */
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
