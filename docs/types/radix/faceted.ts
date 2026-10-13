import type { CompositionProps, EmptyProps } from "@/types";

export interface FacetedOption {
  /**
   * The text shown for the option in the trigger and badges.
   */
  label: string;

  /**
   * The value of the option.
   */
  value: string;
}

export interface FacetedProps<Multiple extends boolean = false> {
  /**
   * The controlled selected value. A string array when `multiple` is true.
   */
  value?: Multiple extends true ? string[] : string;

  /**
   * The selected value when initially rendered. Use when you don't need to control the value.
   */
  defaultValue?: Multiple extends true ? string[] : string;

  /**
   * Event handler called when the selected value changes.
   */
  onValueChange?: (
    value: (Multiple extends true ? string[] : string) | undefined,
  ) => void;

  /**
   * The options, used to look up the labels that `FacetedValue` renders.
   *
   * ```ts
   * items={[
   *   { label: "Todo", value: "todo" },
   *   { label: "Done", value: "done" },
   * ]}
   * ```
   *
   * @default []
   */
  items?: FacetedOption[];

  /**
   * Whether more than one option can be selected.
   * @default false
   */
  multiple?: Multiple;

  /**
   * The controlled open state of the popover.
   */
  open?: boolean;

  /**
   * The open state of the popover when initially rendered.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Event handler called when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;
}

export interface FacetedTriggerProps
  extends EmptyProps<"button">, CompositionProps {}

export interface FacetedValueProps {
  /**
   * The content shown when nothing is selected.
   * @default "Select options..."
   */
  placeholder?: React.ReactNode;

  /**
   * Custom content, or a function that receives the selected options.
   * By default, a single selection renders as text. Multiple selections render as badges, up to two, then as a count.
   *
   * ```tsx
   * <FacetedValue>
   *   {(selected) => `${selected.length} selected`}
   * </FacetedValue>
   * ```
   */
  children?: React.ReactNode | ((selected: FacetedOption[]) => React.ReactNode);
}

export interface FacetedBadgeListProps extends EmptyProps<"div"> {}

export interface FacetedBadgeProps
  extends EmptyProps<"span">, CompositionProps {}

export interface FacetedContentProps extends EmptyProps<"div"> {
  /**
   * Whether the items are filtered by the search input. Set to `false` when you filter them yourself, such as with server-side search.
   * @default true
   */
  shouldFilter?: boolean;

  /**
   * A custom filter that ranks each item against the search. Return a score between 0 and 1, where 0 hides the item.
   *
   * ```ts
   * filter={(value, search, keywords) =>
   *   value.startsWith(search) ? 1 : 0
   * }
   * ```
   */
  filter?: (value: string, search: string, keywords?: string[]) => number;

  /**
   * Whether keyboard navigation wraps from the last item to the first, and the reverse.
   * @default false
   */
  loop?: boolean;
}

export interface FacetedInputProps extends EmptyProps<"input"> {
  /**
   * The input's look. `default` is shadcn's filled search field. `line` is a plain row with a divider below it.
   * @default "default"
   */
  variant?: "default" | "line";
}

export interface FacetedListProps extends EmptyProps<"div"> {}

export interface FacetedEmptyProps extends EmptyProps<"div"> {}

export interface FacetedLoadingProps extends EmptyProps<"div"> {
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

export interface FacetedGroupProps extends EmptyProps<"div"> {
  /**
   * The heading shown above the group's items.
   */
  heading?: React.ReactNode;
}

export interface FacetedItemProps extends EmptyProps<"div"> {
  /**
   * The value of the item. Selecting the item toggles it in the selection.
   */
  value: string;

  /**
   * Event handler called when the item is selected. When provided, it replaces the default selection behavior.
   */
  onSelect?: (value: string) => void;

  /**
   * Whether the item is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Extra words to match when filtering with `FacetedInput`.
   */
  keywords?: string[];
}

export interface FacetedItemIndicatorProps extends EmptyProps<"span"> {
  /**
   * Content shown while the item isn't selected, such as a count. A check icon replaces it when the item is selected.
   */
  children?: React.ReactNode;
}

export interface FacetedClearProps extends EmptyProps<"div"> {
  /**
   * The content of the clear item. It renders in its own group below a separator, and only when something is selected.
   * @default "Clear"
   */
  children?: React.ReactNode;

  /**
   * Event handler called when the clear item is selected, before the selection is cleared.
   */
  onSelect?: (value: string) => void;
}

export interface FacetedSeparatorProps extends EmptyProps<"div"> {}
