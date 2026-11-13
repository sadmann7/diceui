import type {
  CellContext,
  Column,
  ColumnDef,
  ReactTable,
  Row,
  RowData,
  TableOptions,
  TableState,
} from "@tanstack/react-table";
import type * as React from "react";

import type { DataTableConfig } from "@/lib/data-table-config";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type {
  ColumnFilterItem,
  ColumnSelectOption,
  ColumnSortItem,
  DataTableColumnConfigs,
  JoinOperator,
} from "@/lib/data-table-types";
import type { DropdownMenuTrigger } from "@/registry/bases/radix/ui/dropdown-menu";
import type { EmptyProps } from "@/types";

export interface CreateDataTableConfigProps {
  /**
   * Prefixes every URL key as `id.key`, for rendering multiple tables on the same page.
   *
   * ```ts
   * // ?tasks.page=2&tasks.status=todo
   * createDataTableConfig({ id: "tasks", columns })
   * ```
   */
  id?: string;

  /**
   * The columns that can be filtered or sorted, keyed by column id.
   * Columns not listed can't be filtered or sorted.
   * `variant` turns on filtering, and `enableSorting: false` turns off sorting.
   *
   * ```ts
   * columns: {
   *   code: { enableSorting: false },
   *   title: { variant: "text" },
   *   status: { variant: "select" },
   * }
   * ```
   */
  columns: DataTableColumnConfigs;

  /**
   * The sorting used when the URL has none.
   *
   * @default []
   */
  defaultSorting?: ColumnSortItem[];

  /**
   * The page size used when the URL has none.
   *
   * @default 10
   */
  defaultPageSize?: number;

  /**
   * The page sizes shown in the pagination.
   *
   * @default [10, 20, 30, 40, 50]
   */
  pageSizeOptions?: readonly number[];

  /**
   * The join operator used when the URL has none.
   *
   * @default "and"
   */
  defaultJoinOperator?: JoinOperator;

  /**
   * Whether the global filter is read from and written to the `search` URL key.
   *
   * @default true
   */
  enableGlobalFilter?: boolean;
}

export interface UseDataTableProps<TData extends RowData> extends Pick<
  TableOptions<DataTableFeatures, TData>,
  "data" | "columns" | "getRowId" | "defaultColumn"
> {
  /**
   * The table config from `createDataTableConfig`, shared with the server.
   * Also accepts inline options without `columns`, like `{ id, defaultSorting, defaultPageSize }`.
   * Without a built config, filtering and sorting come from the column definitions.
   */
  config?: DataTableConfig | Omit<CreateDataTableConfigProps, "columns">;

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
   * The initial table state.
   * Sorting, pagination, filters, the global filter, and the join operator come from the URL and the config instead.
   */
  initialState?: Omit<
    Partial<TableState<DataTableFeatures>>,
    "columnFilters" | "globalFilter" | "sorting" | "pagination" | "joinOperator"
  >;

  /**
   * Determines how query updates affect history.
   * `push` creates a new history entry; `replace` (default) updates the current entry.
   *
   * @default "replace"
   */
  history?: "push" | "replace";

  /**
   * Debounce time (ms) for URL updates from filters and the global filter.
   * Only applies when `shallow` is `false` in `server` mode. Clearing a filter updates the URL right away.
   *
   * @default 300
   */
  debounceMs?: number;

  /**
   * Clear URL query key-value pair when state is set to default.
   *
   * @default true
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
   * Always `true` in `client` mode.
   *
   * @default true
   */
  shallow?: boolean;

  /**
   * Observe Server Component loading states for non-shallow updates.
   * Pass `startTransition` from `React.useTransition()` and set `shallow` to `false`.
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

  /**
   * Whether the header sticks to the top while the rows scroll inside the table.
   * Set the height with `className`, like `max-h-[600px]`.
   *
   * @default false
   */
  stickyHeader?: boolean;

  /**
   * Called when Escape is pressed inside the table while rows are selected, before the selection clears.
   * Call `event.preventDefault()` to keep the selection.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export interface DataTableToolbarProps<
  TData extends RowData,
> extends EmptyProps<"div"> {
  /** The table instance. */
  table: ReactTable<DataTableFeatures, TData, unknown>;

  /**
   * The placeholder of the global filter input.
   * The input only renders when this is set and global filtering is on.
   */
  globalFilterPlaceholder?: string;
}

export interface DataTableAdvancedToolbarProps<
  TData extends RowData,
> extends EmptyProps<"div"> {
  /** The table instance. */
  table: ReactTable<DataTableFeatures, TData, unknown>;

  /**
   * The placeholder of the global filter input.
   * The input only renders when this is set and global filtering is on.
   */
  globalFilterPlaceholder?: string;
}

export interface DataTableColumnHeaderProps<
  TData extends RowData,
  TValue,
> extends EmptyProps<typeof DropdownMenuTrigger> {
  /** The column instance. */
  column: Column<DataTableFeatures, TData, TValue>;

  /** The column label. Defaults to the column's `meta.label`, then its id. */
  label?: string;
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
  options: ColumnSelectOption[];

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
   * Values past `columnCount` are ignored.
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

export type GetDataTableActionsColumnProps<TData extends RowData> = Omit<
  Partial<ColumnDef<DataTableFeatures, TData>>,
  "id" | "header" | "cell"
> & {
  /**
   * Renders the row's menu items, such as `DropdownMenuItem`s.
   *
   * ```tsx
   * getDataTableActionsColumn({
   *   actions: ({ row }) => (
   *     <DropdownMenuItem onClick={() => onRowDelete(row.original)}>
   *       Delete
   *     </DropdownMenuItem>
   *   ),
   * })
   * ```
   */
  actions: (context: CellContext<DataTableFeatures, TData>) => React.ReactNode;

  /**
   * The accessible label of each row's menu trigger.
   * @default (row) => `Open actions for row ${row.getDisplayIndex() + 1}`
   */
  getAriaLabel?: (row: Row<DataTableFeatures, TData>) => string;

  /**
   * The width of the actions column in pixels.
   * @default 48
   */
  size?: number;

  /**
   * Whether the column can be hidden via the view options.
   * @default false
   */
  enableHiding?: boolean;

  /**
   * Whether the column can be sorted.
   * @default false
   */
  enableSorting?: boolean;
};
