import type { EmptyProps } from "@/types";

export interface CommandPaletteProps extends EmptyProps<"div"> {
  /**
   * The controlled stack of open pages. The first page is the root, and the last one is shown.
   *
   * ```ts
   * pages={["root", "projects"]}
   * ```
   */
  pages?: string[];

  /**
   * The stack of open pages when initially rendered. Use when you don't need to control the pages.
   * @default ["root"]
   */
  defaultPages?: string[];

  /**
   * Event handler called when a page is opened or closed.
   */
  onPagesChange?: (pages: string[]) => void;

  /**
   * The controlled search value. It clears whenever the page changes.
   */
  search?: string;

  /**
   * The search value when initially rendered.
   * @default ""
   */
  defaultSearch?: string;

  /**
   * Event handler called when the search value changes.
   */
  onSearchChange?: (search: string) => void;

  /**
   * Whether the items are filtered by the search input. Set to `false` when you filter them yourself.
   * @default true
   */
  shouldFilter?: boolean;

  /**
   * A custom filter that ranks each item against the search. Return a score between 0 and 1, where 0 hides the item.
   */
  filter?: (value: string, search: string, keywords?: string[]) => number;

  /**
   * Whether keyboard navigation wraps from the last item to the first, and the reverse.
   * @default false
   */
  loop?: boolean;
}

export interface CommandPaletteBreadcrumbProps extends EmptyProps<"nav"> {}

export interface CommandPaletteInputProps extends EmptyProps<"input"> {
  /**
   * Event handler called when the search value changes.
   */
  onValueChange?: (search: string) => void;
}

export interface CommandPaletteListProps extends EmptyProps<"div"> {}

export interface CommandPaletteEmptyProps extends EmptyProps<"div"> {}

export interface CommandPaletteLoadingProps extends EmptyProps<"div"> {
  /**
   * The progress of the request, from 0 to 100, announced to screen readers.
   */
  progress?: number;

  /**
   * The accessible label of the loading indicator.
   * @default "Loading..."
   */
  label?: string;
}

export interface CommandPalettePageProps {
  /**
   * The page's value. Items open it with `page`, and it appears in `pages`.
   */
  value: string;

  /**
   * The label shown in the breadcrumb and announced to screen readers when the page opens.
   * @default value
   */
  label?: React.ReactNode;

  /**
   * The content rendered while the page is active.
   */
  children?: React.ReactNode;
}

export interface CommandPaletteGroupProps extends EmptyProps<"div"> {
  /**
   * The heading shown above the group's items.
   */
  heading?: React.ReactNode;
}

export interface CommandPaletteItemProps extends EmptyProps<"div"> {
  /**
   * The page to open when the item is selected.
   *
   * ```tsx
   * <CommandPaletteItem page="projects">Search projects...</CommandPaletteItem>
   * ```
   */
  page?: string;

  /**
   * The value used for filtering. Defaults to the item's text content.
   */
  value?: string;

  /**
   * Event handler called when the item is selected, before its page opens.
   */
  onSelect?: (value: string) => void;

  /**
   * Whether the item is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Extra words to match when filtering.
   */
  keywords?: string[];
}

export interface CommandPaletteShortcutProps extends EmptyProps<"span"> {}

export interface CommandPaletteSeparatorProps extends EmptyProps<"div"> {}
