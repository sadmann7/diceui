import type { Cell, Row, Table } from "@tanstack/react-table";
import type * as React from "react";

/**
 * Props for the main DataTable component.
 */
export interface DataTableProps<TData> {
  /**
   * The initialized table instance.
   */
  table: Table<TData>;

  /**
   * Optional action bar component to be displayed below the table.
   */
  actionBar?: React.ReactNode;

  /**
   * Optional children to render inside the data table, typically toolbar components.
   */
  children?: React.ReactNode;

  /**
   * Optional CSS class to apply to the DataTable container.
   */
  className?: string;
}

/**
 * Props for the DataTableToolbar component.
 */
export interface DataTableToolbarProps<TData> {
  /**
   * The initialized table instance.
   */
  table: Table<TData>;

  /**
   * Optional children to render inside the toolbar.
   */
  children?: React.ReactNode;

  /**
   * Optional CSS class to apply to the toolbar.
   */
  className?: string;
}

/**
 * Props for the DataTableAdvancedToolbar component.
 */
export interface DataTableAdvancedToolbarProps<TData> {
  /**
   * The initialized table instance.
   */
  table: Table<TData>;

  /**
   * Optional children to render inside the advanced toolbar.
   */
  children?: React.ReactNode;

  /**
   * Optional CSS class to apply to the advanced toolbar.
   */
  className?: string;
}

/**
 * Props for the DataTableColumnHeader component.
 */
export interface DataTableColumnHeaderProps<TData, TValue> {
  /**
   * The column to render the header for.
   */
  column: Column<TData, TValue>;

  /**
   * The title to display in the header.
   */
  title: string;

  /**
   * Optional CSS class to apply to the column header.
   */
  className?: string;
}

/**
 * Props for the DataTableFilterList component.
 */
export interface DataTableFilterListProps<TData> {
  /**
   * The initialized table instance.
   */
  table: Table<TData>;

  /**
   * Debounce time in milliseconds for filter input changes.
   * @default 300
   */
  debounceMs?: number;

  /**
   * Throttle time in milliseconds for filter input changes.
   * @default 50
   */
  throttleMs?: number;

  /**
   * Whether to use shallow routing.
   * @default true
   */
  shallow?: boolean;

  /**
   * Alignment for the filter popover.
   * @default "center"
   */
  align?: "start" | "center" | "end";

  /**
   * Side for the filter popover.
   * @default "bottom"
   */
  side?: "top" | "right" | "bottom" | "left";

  /**
   * Alignment offset for the filter popover.
   * @default 0
   */
  alignOffset?: number;

  /**
   * Side offset for the filter popover.
   * @default 4
   */
  sideOffset?: number;

  /**
   * Collision padding for the filter popover.
   * @default 16
   */
  collisionPadding?: number;
}

/**
 * Props for the DataTableSortList component.
 */
export interface DataTableSortListProps<TData> {
  /**
   * The initialized table instance.
   */
  table: Table<TData>;

  /**
   * Alignment for the sort popover.
   * @default "center"
   */
  align?: "start" | "center" | "end";

  /**
   * Side for the sort popover.
   * @default "bottom"
   */
  side?: "top" | "right" | "bottom" | "left";

  /**
   * Alignment offset for the sort popover.
   * @default 0
   */
  alignOffset?: number;

  /**
   * Side offset for the sort popover.
   * @default 4
   */
  sideOffset?: number;

  /**
   * Collision padding for the sort popover.
   * @default 16
   */
  collisionPadding?: number;
}

/**
 * Props for the DataTablePagination component.
 */
export interface DataTablePaginationProps<TData> {
  /**
   * The initialized table instance.
   */
  table: Table<TData>;

  /**
   * Available page size options.
   * @default [10, 20, 30, 40, 50]
   */
  pageSizeOptions?: number[];
}

/**
 * Props for the useDataTable hook.
 */
export interface UseDataTableProps<TData> {
  /**
   * The data to display in the table.
   */
  data: TData[];

  /**
   * The columns configuration for the table.
   */
  columns: Column<TData>[];

  /**
   * The total number of pages available.
   */
  pageCount: number;

  /**
   * Optional initial state for the table.
   */
  initialState?: {
    sorting?: { id: keyof TData & string; desc: boolean }[];
    pagination?: { pageIndex: number; pageSize: number };
    columnVisibility?: Record<string, boolean>;
    columnPinning?: { left?: string[]; right?: string[] };
    rowSelection?: Record<string, boolean>;
  };

  /**
   * History mode for URL state.
   * @default "replace"
   */
  history?: "push" | "replace";

  /**
   * Throttle time in milliseconds.
   * @default 50
   */
  throttleMs?: number;

  /**
   * Debounce time in milliseconds.
   * @default 300
   */
  debounceMs?: number;

  /**
   * Whether to scroll on URL changes.
   * @default false
   */
  scroll?: boolean;

  /**
   * Whether to use shallow routing.
   * @default true
   */
  shallow?: boolean;

  /**
   * Whether to clear params when they match the default values.
   * @default false
   */
  clearOnDefault?: boolean;

  /**
   * Whether to enable advanced filtering features.
   * @default false
   */
  enableAdvancedFilter?: boolean;

  /**
   * Optional function to start a React transition.
   */
  startTransition?: React.TransitionStartFunction;
}

/**
 * Type for a column in the data table.
 */
export interface Column<TData, TValue = unknown> {
  /**
   * The column ID.
   */
  id: string;

  /**
   * The accessor key for the column data.
   */
  accessorKey?: string;

  /**
   * The header component or render function.
   */
  header?:
    | React.ReactNode
    | ((props: { column: Column<TData, TValue> }) => React.ReactNode);

  /**
   * The cell component or render function.
   */
  cell?:
    | React.ReactNode
    | ((props: {
        row: Row<TData>;
        cell: Cell<TData, TValue>;
      }) => React.ReactNode);

  /**
   * Whether the column can be sorted.
   * @default false
   */
  enableSorting?: boolean;

  /**
   * Whether the column can be filtered.
   * @default false
   */
  enableColumnFilter?: boolean;

  /**
   * Whether the column can be hidden.
   * @default true
   */
  enableHiding?: boolean;

  /**
   * Meta information for the column.
   */
  meta?: {
    /**
     * The label for the column.
     */
    label?: string;

    /**
     * Placeholder text for filters.
     */
    placeholder?: string;

    /**
     * The filter variant for the column.
     */
    variant?:
      | "text"
      | "number"
      | "range"
      | "date"
      | "date-range"
      | "boolean"
      | "select"
      | "multi-select";

    /**
     * Options for select/multi-select filters.
     */
    options?: Array<{
      label: string;
      value: string;
      count?: number;
      icon?: React.ComponentType<{ className?: string }>;
    }>;

    /**
     * Range values for range filters.
     */
    range?: [number, number];

    /**
     * Unit for numeric filters.
     */
    unit?: string;

    /**
     * Icon for the column.
     */
    icon?: React.ComponentType<{ className?: string }>;
  };
}
