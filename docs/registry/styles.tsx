/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/styles.tsx
 */

// biome-ignore lint/style/useImportType: React must be a value import for JSX in the tsx build script runtime
import * as React from "react";
import type { RegistryItem } from "shadcn/schema";

interface RegistryStyleItem
  extends Pick<RegistryItem, "name" | "title" | "description"> {
  icon: React.ReactNode;
}

export const STYLES: RegistryStyleItem[] = [
  {
    name: "vega",
    title: "Vega",
    description: "Clean, neutral, and familiar.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="128"
        height="128"
        viewBox="0 0 24 24"
        fill="none"
        role="img"
        color="currentColor"
      >
        <path
          d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
] as const;

export type Style = (typeof STYLES)[number];
