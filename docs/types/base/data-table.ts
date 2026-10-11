import type {
  Column,
  ReactTable,
  RowData,
  TableOptions,
} from "@tanstack/react-table";
import type * as React from "react";

import type { DataTableFeatures } from "@/lib/data-table-features";
import type { DropdownMenuTrigger } from "@/registry/bases/base/ui/dropdown-menu";
import type { EmptyProps } from "@/types";
import type {
  ColumnFilterItem,
  DataTableQueryKeys,
  FilterOption,
} from "@/lib/data-table-types";

export interface UseDataTableProps<TData extends RowData> extends Pick<
  TableOptions<DataTableFeatures, TData>,
  "data" | "columns" | "getRowId" | "defaultColumn" | "initialState"
> {
  /**
   * Where sorting, filtering, and pagination run.
   * `server` expects pre-processed `data` and a `pageCount`.
   * `client` processes `data` in the browser.
   *
   * @default "server"
   */
  mode?: "server" | "client";

  /**
   * The total number of pages. Required in `server` mode, not allowed in `client` mode.
   */
  pageCount?: number;

  /**
   * Custom query keys for URL state management.
   * Can be used to render multiple tables in the same page.
   *
   * ```ts
   * queryKeys: {
   *   page: "pageOne",
   *   perPage: "perPageOne",
   *   sort: "sortOne",
   *   joinOperator: "joinOperatorOne",
   * }
   * ```
   */
  queryKeys?: Partial<DataTableQueryKeys>;

  /**
   * Determines how query updates affect history.
   * `push` creates a new history entry; `replace` (default) updates the current entry.
   *
   * @default "replace"
   */
  history?: "push" | "replace";

  /**
   * Debounce time (ms) for filter updates to enhance performance during rapid input.
   *
   * @default 300
   */
  debounceMs?: number;

  /**
   * Maximum time (ms) to wait between URL query string updates.
   * Helps with browser rate-limiting. Minimum effective value is 50ms.
   *
   * @default 50
   */
  throttleMs?: number;

  /**
   * Clear URL query key-value pair when state is set to default.
   * Keep URL meaning consistent when defaults change.
   *
   * @default false
   */
  clearOnDefault?: boolean;

  /**
   * Whether the page should scroll to the top when the URL changes.
   *
   * @default false
   */
  scroll?: boolean;

  /**
   * Whether to keep query states client-side, avoiding server calls.
   * Setting to `false` triggers a network request with the updated querystring.
   *
   * @default true
   */
  shallow?: boolean;

  /**
   * Observe Server Component loading states for non-shallow updates.
   * Pass `startTransition` from `React.useTransition()`.
   * Sets `shallow` to `false` automatically.
   * So shallow: true` and `startTransition` cannot be used at the same time.
   * @see https://react.dev/reference/react/useTransition
   */
  startTransition?: React.TransitionStartFunction;
}

export interface DataTableProps<
  TData extends RowData,
> extends EmptyProps<"div"> {
  /** The table instance. */
  table: ReactTable<DataTableFeatures, TData, unknown>;

  /** The action bar to display above the table. */
  actionBar?: React.ReactNode;
}

export interface DataTableToolbarProps<
  TData extends RowData,
> extends EmptyProps<"div"> {
  /** The table instance. */
  table: ReactTable<DataTableFeatures, TData, unknown>;
}

export interface DataTableAdvancedToolbarProps<
  TData extends RowData,
> extends EmptyProps<"div"> {
  /** The table instance. */
  table: ReactTable<DataTableFeatures, TData, unknown>;
}

export interface DataTableColumnHeaderProps<
  TData extends RowData,
  TValue,
> extends EmptyProps<typeof DropdownMenuTrigger> {
  /** The column instance. */
  column: Column<DataTableFeatures, TData, TValue>;

  /** The column label. */
  label: string;
}

export interface DataTableDateFilterProps<TData extends RowData> {
  /** The column instance. */
  column: Column<DataTableFeatures, TData>;

  /** The title of the date picker. */
  title?: string;

  /** Whether to enable range selection. */
  multiple?: boolean;
}

export interface DataTableFacetedFilterProps<TData extends RowData, TValue> {
  /** The column instance. */
  column?: Column<DataTableFeatures, TData, TValue>;

  /** The title of the filter. */
  title?: string;

  /** The options of the filter. */
  options: FilterOption[];

  /** Whether to enable multiple selection. */
  multiple?: boolean;
}

export interface DataTableSliderFilterProps<TData extends RowData> {
  /** The column instance. */
  column: Column<DataTableFeatures, TData>;

  /** The title of the slider filter. */
  title?: string;
}

export interface DataTableRangeFilterProps<
  TData extends RowData,
> extends EmptyProps<"div"> {
  /** The column filter. */
  filter: ColumnFilterItem;

  /** The column instance. */
  column: Column<DataTableFeatures, TData>;

  /** The input id for screen readers. */
  inputId: string;

  /** The function to update the filter. */
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ColumnFilterItem, "filterId">>,
  ) => void;
}

export interface DataTableFilterMenuProps<TData extends RowData> {
  /** The table instance. */
  table: ReactTable<DataTableFeatures, TData, unknown>;

  /** Whether the trigger is disabled. */
  disabled?: boolean;
}

export interface DataTableCommandFilterMenuProps<TData extends RowData> {
  /** The table instance. */
  table: ReactTable<DataTableFeatures, TData, unknown>;

  /** Whether the trigger is disabled. */
  disabled?: boolean;
}

export interface DataTableSortMenuProps<TData extends RowData> {
  /** The table instance. */
  table: ReactTable<DataTableFeatures, TData, unknown>;

  /** Whether the trigger is disabled. */
  disabled?: boolean;
}

export interface DataTablePaginationProps<
  TData extends RowData,
> extends EmptyProps<"div"> {
  /** The table instance. */
  table: ReactTable<DataTableFeatures, TData, unknown>;

  /**
   * The options of the pagination.
   *
   * @default [10, 20, 30, 40, 50]
   */
  pageSizeOptions?: number[];
}

export interface DataTableViewOptionsProps<TData extends RowData> {
  /** The table instance. */
  table: ReactTable<DataTableFeatures, TData, unknown>;

  /** Whether the trigger is disabled. */
  disabled?: boolean;
}

export interface DataTableSkeletonProps extends EmptyProps<"div"> {
  /** The number of columns in the table. */
  columnCount: number;

  /**
   * The number of rows in the table.
   *
   * @default 10
   */
  rowCount?: number;

  /**
   * The number of filters in the table.
   *
   * @default 0
   */
  filterCount?: number;

  /**
   * Array of CSS width values for each table column.
   * The maximum length of the array must match columnCount, extra values will be ignored.
   *
   * @default ["auto"]
   */
  cellWidths?: string[];

  /**
   * Whether to show the view options.
   *
   * @default true
   */
  withViewOptions?: boolean;

  /**
   * Whether to show the pagination bar.
   *
   * @default true
   */
  withPagination?: boolean;

  /**
   * Whether to prevent the table cells from shrinking.
   *
   * @default false
   */
  shrinkZero?: boolean;
}
