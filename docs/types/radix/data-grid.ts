import type {
  Cell,
  Column,
  ColumnDef,
  ColumnPinningPosition,
  Header,
  ReactTable,
  Row,
  RowData,
  TableOptions,
} from "@tanstack/react-table";
import type {
  VirtualItem,
  Virtualizer,
  VirtualizerOptions,
} from "@tanstack/react-virtual";
import type * as React from "react";

import type { DataGridFeatures } from "@/lib/data-grid-features";
import type {
  CellPosition,
  CellPresence,
  ColumnWindow,
  CreateRowDetails,
  DataChangeDetails,
  Direction,
  FileCellData,
  RowHeightValue,
  StopEditingOptions,
} from "@/lib/data-grid-types";
import type { PopoverContent } from "@/registry/bases/radix/ui/popover";
import type { EmptyProps } from "@/types";

export interface UseDataGridProps<TData extends RowData> extends Pick<
  TableOptions<DataGridFeatures, TData>,
  "data" | "columns" | "getRowId" | "defaultColumn" | "initialState" | "state"
> {
  /**
   * Event handler called whenever the data changes, from edits, pastes,
   * `table.updateCells`, added or deleted rows, or undo/redo.
   * Passing the data back is optional, since the grid keeps its own copy.
   *
   * ```ts
   * onDataChange={(data, { reason, changes, addedRows, removedRows }) => {
   *   setData(data)
   *   saveChanges({ changes, addedRows, removedRows })
   * }}
   * ```
   */
  onDataChange?: (data: TData[], details: DataChangeDetails<TData>) => void;

  /**
   * Creates a new row when the user adds one, and can be async for server-side creation.
   * `details.reason` is `"add-row-press"` for the footer button, `"insert-below"` for
   * Shift+Enter on a cell (with `afterRowId`), or `"paste"` when a paste needs more rows.
   * The grid inserts and focuses the returned row. Return null to skip adding one.
   *
   * ```ts
   * createRow={async () => {
   *   const row = await createPerson()
   *   return row
   * }}
   * ```
   */
  createRow?: (
    details: CreateRowDetails,
  ) => TData | null | Promise<TData | null>;

  /**
   * Whether users can delete rows, from the context menu or with Ctrl+Backspace.
   * @default false
   */
  enableRowDeletion?: boolean;

  /**
   * Whether undo/redo is enabled, with Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y.
   * Defaults to on unless the grid is read-only.
   */
  enableUndoRedo?: boolean;

  /**
   * Maximum number of undo steps to keep.
   * @default 100
   */
  maxHistory?: number;

  /**
   * How often, in milliseconds, `onDataChange` runs for `table.updateCells(updates, { batch: true })`.
   * @default 500
   */
  batchUpdateDelay?: number;

  /**
   * Uploads files added to a file cell and returns their metadata.
   *
   * ```ts
   * uploadFiles={async ({ files, rowId, columnId }) => {
   *   const formData = new FormData()
   *   files.forEach(file => formData.append('files', file))
   *   const response = await fetch('/api/upload', {
   *     method: 'POST',
   *     body: formData
   *   })
   *   const data = await response.json()
   *   return data.files.map(f => ({
   *     id: f.fileId,
   *     name: f.fileName,
   *     size: f.fileSize,
   *     type: f.fileType,
   *     url: f.fileUrl
   *   }))
   * }}
   * ```
   */
  uploadFiles?: (params: {
    files: File[];
    rowId: string;
    columnId: string;
  }) => Promise<FileCellData[]>;

  /**
   * Deletes files removed from a file cell.
   *
   * ```ts
   * deleteFiles={async ({ fileIds, rowId, columnId }) => {
   *   await fetch('/api/files/batch-delete', {
   *     method: 'DELETE',
   *     body: JSON.stringify({ fileIds })
   *   })
   * }}
   * ```
   */
  deleteFiles?: (params: {
    fileIds: string[];
    rowId: string;
    columnId: string;
  }) => void | Promise<void>;

  /**
   * Text direction for the grid's layout, pinning, and navigation.
   */
  dir?: Direction;

  /**
   * Number of items to render outside of the visible area for smoother scrolling.
   * @default 3
   */
  overscan?: number;

  /**
   * Whether to automatically focus the grid on mount.
   * Can be a boolean to focus the first navigable cell, or an object to specify the exact cell.
   * @default false
   *
   * ```ts
   * // Focus first cell
   * autoFocus={true}
   *
   * // Focus the first row and the name column
   * autoFocus={{ rowId: "row-1", columnId: "name" }}
   * ```
   */
  autoFocus?: boolean | Partial<CellPosition>;

  /**
   * Select the clicked cell on single click, not only on drag or shift-click.
   * @default false
   */
  enableSingleCellSelection?: boolean;

  /**
   * Whether clicking a column header selects all cells in that column.
   * @default false
   */
  enableColumnSelection?: boolean;

  /**
   * Whether to enable find-in-grid search with Ctrl+F (or Cmd+F on Mac).
   * @default false
   */
  enableSearch?: boolean;

  /**
   * Whether to enable pasting from the clipboard with Ctrl+V (or Cmd+V on Mac).
   * Uses `createRow` to add rows when a paste runs past the last row.
   * @default false
   */
  enablePaste?: boolean;

  /**
   * Whether cells can be edited.
   * Columns can also set `enableCellEditing` on their own.
   * @default true
   */
  enableCellEditing?: boolean;

  /**
   * Whether the grid is read-only, preventing all editing.
   * @default false
   */
  readOnly?: boolean;
}

export interface DataGridProps<
  TData extends RowData,
> extends EmptyProps<"div"> {
  /**
   * The table instance from useDataGrid hook.
   * Holds the grid's state and APIs, such as `table.stopEditing` and `table.scrollToCell`.
   */
  table: ReactTable<DataGridFeatures, TData>;

  /**
   * Reference to the main grid container element.
   */
  dataGridRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Reference to the header container element.
   */
  headerRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Reference to the footer container element.
   */
  footerRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Map of row indexes to their DOM elements.
   */
  rowMapRef: React.RefObject<Map<number, HTMLDivElement>>;

  /**
   * Event handlers and styles for the grid body, from useDataGrid.
   */
  dataGridBodyProps: React.HTMLAttributes<HTMLDivElement>;

  /**
   * Reference to the row virtualizer, set once the grid renders its rows.
   */
  rowVirtualizerRef: React.RefObject<Virtualizer<
    HTMLDivElement,
    Element
  > | null>;

  /**
   * Reference to the column virtualizer, set once the grid renders its columns.
   */
  columnVirtualizerRef: React.RefObject<Virtualizer<
    HTMLDivElement,
    Element
  > | null>;

  /**
   * Options passed to the row virtualizer.
   */
  rowVirtualizerOptions: Pick<
    VirtualizerOptions<HTMLDivElement, Element>,
    "overscan"
  >;

  /**
   * CSS variables for column sizing.
   */
  columnSizeVars: React.CSSProperties;

  /**
   * Event handler called when adding a new row.
   * Only defined when `createRow` is provided to useDataGrid.
   */
  onRowAdd?: (
    event?:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>,
  ) => Promise<void>;

  /**
   * Whether to apply a layout fix for pinned columns in Firefox.
   */
  adjustLayout: boolean;

  /**
   * Text direction for the grid's layout, pinning, and navigation.
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * Height of the grid container in pixels.
   * @default 600
   */
  height?: number;

  /**
   * Whether columns stretch to fill the grid width.
   * @default false
   */
  stretchColumns?: boolean;

  /**
   * Rendered while rows or a range of cells are selected, such as an `ActionBar` with bulk actions.
   *
   * ```tsx
   * <DataGrid {...dataGridProps} table={table} actionBar={<DataGridActionBar table={table} />} />
   * ```
   */
  actionBar?: React.ReactNode;
}

export type GetDataGridSelectColumnProps<TData extends RowData> = Omit<
  Partial<ColumnDef<DataGridFeatures, TData>>,
  "id" | "header" | "cell"
> & {
  /**
   * The width of the select column in pixels.
   * @default 40
   */
  size?: number;

  /**
   * Whether the column can be hidden via the view menu.
   * @default false
   */
  enableHiding?: boolean;

  /**
   * Whether the column can be resized.
   * @default false
   */
  enableResizing?: boolean;

  /**
   * Whether the column can be sorted.
   * @default false
   */
  enableSorting?: boolean;

  /**
   * Whether to show each row's number in place of its checkbox until the row is hovered or selected.
   * @default false
   */
  enableRowMarkers?: boolean;

  /**
   * Whether the checkboxes are disabled.
   * @default false
   */
  readOnly?: boolean;

  /**
   * The size of the clickable area around each checkbox.
   * @default "default"
   */
  hitboxSize?: "default" | "sm" | "lg";

  /**
   * Outlines each checkbox's clickable area, to help tune `hitboxSize`.
   * @default false
   */
  debug?: boolean;
};

export type GetDataGridActionsColumnProps<TData extends RowData> = Omit<
  Partial<ColumnDef<DataGridFeatures, TData>>,
  "id" | "header" | "cell"
> & {
  /**
   * Renders the row's menu items, such as `DropdownMenuItem`s.
   *
   * ```tsx
   * getDataGridActionsColumn({
   *   actions: ({ row }) => (
   *     <DropdownMenuItem onClick={() => onRowDelete(row.original)}>
   *       Delete
   *     </DropdownMenuItem>
   *   ),
   * })
   * ```
   */
  actions: (context: {
    row: Row<DataGridFeatures, TData>;
    table: ReactTable<DataGridFeatures, TData>;
  }) => React.ReactNode;

  /**
   * The accessible label of each row's menu trigger.
   * @default (row) => `Open actions for row ${row.getDisplayIndex() + 1}`
   */
  getAriaLabel?: (row: Row<DataGridFeatures, TData>) => string;

  /**
   * The width of the actions column in pixels.
   * @default 56
   */
  size?: number;

  /**
   * Whether the column can be hidden via the view menu.
   * @default false
   */
  enableHiding?: boolean;

  /**
   * Whether the column can be resized.
   * @default false
   */
  enableResizing?: boolean;

  /**
   * Whether the column can be sorted.
   * @default false
   */
  enableSorting?: boolean;
};

export interface DataGridColumnHeaderProps<TData extends RowData> {
  /**
   * The header instance from TanStack Table.
   *
   * ```tsx
   * <DataGridColumnHeader header={header} table={table} />
   * ```
   */
  header: Header<DataGridFeatures, TData>;

  /**
   * The table instance.
   */
  table: ReactTable<DataGridFeatures, TData>;
}

export interface DataGridCellProps<TData extends RowData> {
  /**
   * The cell instance from TanStack Table.
   * Contains the cell value, column, and row, and the grid's cell APIs such as `cell.startEditing`.
   */
  cell: Cell<DataGridFeatures, TData>;

  /**
   * The index of the cell's column among the visible columns.
   */
  columnIndex: number;

  /**
   * The row height setting, which sizes multi-line cell content.
   */
  rowHeight: RowHeightValue;

  /**
   * Whether the cell is focused.
   */
  isFocused: boolean;

  /**
   * Whether the cell is being edited.
   */
  isEditing: boolean;

  /**
   * Whether the cell is selected.
   */
  isSelected: boolean;

  /**
   * Whether the cell matches the current search query.
   */
  isSearchMatch: boolean;

  /**
   * Whether the cell is the active search match.
   */
  isActiveSearchMatch: boolean;

  /**
   * Another user's presence on this cell, in multiplayer grids.
   */
  presence: CellPresence | null;

  /**
   * Whether the cell is read-only.
   */
  readOnly: boolean;

  /**
   * The width of the cell's column.
   */
  width: number;

  /**
   * Which side the cell's column is pinned to, if any.
   */
  pinned: ColumnPinningPosition;

  /**
   * The offset of a pinned cell from its side of the grid.
   */
  pinnedOffset: number;

  /**
   * Whether the cell grows to fill the remaining width.
   */
  grow: boolean;

  /**
   * Whether to draw a border on the cell's start edge.
   */
  showStartBorder: boolean;

  /**
   * Whether to draw a border on the cell's end edge.
   */
  showEndBorder: boolean;
}

export interface DataGridCellElementProps<TData extends RowData>
  extends DataGridCellProps<TData>, EmptyProps<"div"> {
  /**
   * Called instead of stopping the edit when Tab, Ctrl+Enter, or Enter with
   * `commitOnEnter` commits it. Use it to save a draft value first.
   */
  onCommit?: (options?: StopEditingOptions) => void;

  /**
   * Called instead of stopping the edit when Escape cancels it. Use it to
   * restore the value from before editing.
   */
  onCancel?: () => void;

  /**
   * Whether Enter commits the edit and moves to the next row. When false,
   * only Ctrl+Enter (or Cmd+Enter on Mac) commits, so Enter can add a new line.
   * @default false
   */
  commitOnEnter?: boolean;
}

export interface DataGridRowProps<
  TData extends RowData,
> extends EmptyProps<"div"> {
  /**
   * The row instance from TanStack Table.
   */
  row: Row<DataGridFeatures, TData>;

  /**
   * All leaf columns of the table, used to keep the row's cells in column order.
   */
  leafColumns: Column<DataGridFeatures, TData>[];

  /**
   * The virtual item representing this row.
   */
  virtualItem: VirtualItem;

  /**
   * The range of center columns to render when columns are virtualized, or
   * `null` to render them all.
   */
  columnWindow: ColumnWindow | null;

  /**
   * Whether the grid is scrolling, so cells can render lightweight previews.
   */
  isScrolling: boolean;
}

export interface DataGridSearchProps<TData extends RowData> {
  /**
   * The table instance from useDataGrid hook.
   * The search reads its open state, query, and matches from the table, and opens with Ctrl+F (or Cmd+F on Mac) when `enableSearch` is set.
   *
   * ```tsx
   * <DataGridSearch table={table} />
   * ```
   */
  table: ReactTable<DataGridFeatures, TData>;
}

export interface DataGridContextMenuProps<TData extends RowData> {
  /**
   * The table instance from useDataGrid hook.
   * The menu reads its open state and position from the table.
   */
  table: ReactTable<DataGridFeatures, TData>;

  /**
   * Reference to the grid container element, used to return focus after the menu closes.
   */
  dataGridRef: React.RefObject<HTMLDivElement | null>;
}

export interface DataGridSortMenuProps<
  TData extends RowData,
> extends EmptyProps<typeof PopoverContent> {
  /**
   * The table instance from useDataGrid hook.
   *
   * ```tsx
   * <DataGridSortMenu table={table} />
   * ```
   */
  table: ReactTable<DataGridFeatures, TData>;

  /**
   * Whether the menu trigger is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface DataGridRowHeightMenuProps<
  TData extends RowData,
> extends EmptyProps<typeof PopoverContent> {
  /**
   * The table instance from useDataGrid hook.
   *
   * ```tsx
   * <DataGridRowHeightMenu table={table} />
   * ```
   */
  table: ReactTable<DataGridFeatures, TData>;

  /**
   * Whether the menu trigger is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface DataGridViewMenuProps<
  TData extends RowData,
> extends EmptyProps<typeof PopoverContent> {
  /**
   * The table instance from useDataGrid hook.
   *
   * ```tsx
   * <DataGridViewMenu table={table} />
   * ```
   */
  table: ReactTable<DataGridFeatures, TData>;

  /**
   * Whether the menu trigger is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface DataGridFilterMenuProps<
  TData extends RowData,
> extends EmptyProps<typeof PopoverContent> {
  /**
   * The table instance from useDataGrid hook.
   *
   * ```tsx
   * <DataGridFilterMenu table={table} />
   * ```
   */
  table: ReactTable<DataGridFeatures, TData>;

  /**
   * Whether the menu trigger is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface DataGridPasteDialogProps<TData extends RowData> {
  /**
   * The table instance from useDataGrid hook.
   * The dialog opens when a paste needs more rows than the grid has.
   *
   * ```tsx
   * <DataGridPasteDialog table={table} />
   * ```
   */
  table: ReactTable<DataGridFeatures, TData>;
}

export interface DataGridKeyboardShortcutsProps {
  /**
   * Whether to show the search shortcuts (Ctrl+F, Enter, Shift+Enter).
   * Set it when `enableSearch` is true in useDataGrid.
   *
   * ```tsx
   * <DataGridKeyboardShortcuts enableSearch />
   * ```
   *
   * @default false
   */
  enableSearch?: boolean;

  /**
   * Whether to show the undo/redo shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y).
   * Set it unless the grid is read-only or `enableUndoRedo` is false.
   *
   * ```tsx
   * <DataGridKeyboardShortcuts enableUndoRedo />
   * ```
   *
   * @default false
   */
  enableUndoRedo?: boolean;

  /**
   * Whether to show the paste shortcut (Ctrl+V).
   * Set it when `enablePaste` is true in useDataGrid.
   *
   * ```tsx
   * <DataGridKeyboardShortcuts enablePaste />
   * ```
   *
   * @default false
   */
  enablePaste?: boolean;

  /**
   * Whether to show the row insertion shortcut (Shift+Enter).
   * Set it when `createRow` is provided to useDataGrid.
   *
   * ```tsx
   * <DataGridKeyboardShortcuts enableRowCreation />
   * ```
   *
   * @default false
   */
  enableRowCreation?: boolean;

  /**
   * Whether to show the row deletion shortcuts (Ctrl+Backspace, Ctrl+Delete).
   * Set it when `enableRowDeletion` is true in useDataGrid.
   *
   * ```tsx
   * <DataGridKeyboardShortcuts enableRowDeletion />
   * ```
   *
   * @default false
   */
  enableRowDeletion?: boolean;
}

export interface DataGridSkeletonProps extends EmptyProps<"div"> {}

export interface DataGridSkeletonToolbarProps extends EmptyProps<"div"> {
  /**
   * Horizontal alignment of the toolbar's action button skeletons.
   *
   * ```tsx
   * <DataGridSkeletonToolbar align="end" />
   * ```
   *
   * @default "end"
   */
  align?: "start" | "center" | "end";

  /**
   * Number of toolbar action button skeletons to display.
   *
   * ```tsx
   * <DataGridSkeletonToolbar actionCount={5} />
   * ```
   *
   * @default 4
   */
  actionCount?: number;
}

export interface DataGridSkeletonGridProps extends EmptyProps<"div"> {}
