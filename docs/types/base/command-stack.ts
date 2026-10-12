import type { EmptyProps } from "@/types";

export interface CommandStackProps extends EmptyProps<"div"> {
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

export interface CommandStackBreadcrumbProps extends EmptyProps<"nav"> {}

export interface CommandStackInputProps extends EmptyProps<"input"> {
  /**
   * Event handler called when the search value changes.
   */
  onValueChange?: (search: string) => void;
}

export interface CommandStackListProps extends EmptyProps<"div"> {}

export interface CommandStackEmptyProps extends EmptyProps<"div"> {}

export interface CommandStackLoadingProps extends EmptyProps<"div"> {
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

export interface CommandStackPageProps {
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

export interface CommandStackGroupProps extends EmptyProps<"div"> {
  /**
   * The heading shown above the group's items.
   */
  heading?: React.ReactNode;
}

export interface CommandStackItemProps extends EmptyProps<"div"> {
  /**
   * The page to open when the item is selected.
   *
   * ```tsx
   * <CommandStackItem page="projects">Search projects...</CommandStackItem>
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

export interface CommandStackShortcutProps extends EmptyProps<"span"> {}

export interface CommandStackSeparatorProps extends EmptyProps<"div"> {}
