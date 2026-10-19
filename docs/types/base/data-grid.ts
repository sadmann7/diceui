import type {
  Cell,
  ColumnDef,
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
  CellUpdate,
  Direction,
  FileCellData,
  RowHeightValue,
} from "@/lib/data-grid-types";
import type { PopoverContent } from "@/registry/bases/base/ui/popover";
import type { EmptyProps } from "@/types";

type RowAddEventDetails = (
  | {
      reason: "add-row-press";
      event?:
        | React.MouseEvent<HTMLDivElement>
        | React.KeyboardEvent<HTMLDivElement>;
    }
  | { reason: "insert-below"; event: KeyboardEvent; afterRowId: string }
  | { reason: "paste"; event?: undefined }
) & {
  cancel: () => void;
};
export interface UseDataGridProps<TData extends RowData> extends Pick<
  TableOptions<DataGridFeatures, TData>,
  "data" | "columns" | "getRowId" | "defaultColumn" | "initialState" | "state"
> {
  /**
   * Event handler called when data changes due to cell edits.
   * Receives the updated data array after changes are applied.
   *
   * ```ts
   * onDataChange={(data) => {
   *   setData(data)
   * }}
   * ```
   */
  onDataChange?: (data: TData[]) => void;

  /**
   * Event handler called when adding a new row.
   * `eventDetails.reason` is `"add-row-press"` for the footer button, `"insert-below"`
   * for Shift+Enter on a cell (with `afterRowId`), or `"paste"` when a paste needs more rows.
   * Call `eventDetails.cancel()` to skip focusing the new row.
   * Return the new row's id, and optionally a column, to focus it, or null to skip focusing.
   * Can be async to support server-side row creation.
   *
   * ```ts
   * onRowAdd={async (eventDetails) => {
   *   const newRow = await createRow()
   *   setData(prev => [...prev, newRow])
   *
   *   // Focus the cell under the "name" column in the new row
   *   return { rowId: newRow.id, columnId: "name" }
   * }}
   * ```
   */
  onRowAdd?: (
    eventDetails: RowAddEventDetails,
  ) => RowAddResult | Promise<RowAddResult | null> | null;

  /**
   * Event handler called when adding multiple rows at once.
   * Used during paste operations when clipboard data exceeds available rows.
   * More efficient than calling onRowAdd multiple times as it allows a single API call.
   * Can be async to support server-side row creation.
   *
   * ```ts
   * onRowsAdd={async (count) => {
   *   await fetch('/api/people/bulk', {
   *     method: 'POST',
   *     body: JSON.stringify({ count })
   *   })
   *   const newRows = Array.from({ length: count }, () => ({ id: generateId() }))
   *   setData(prev => [...prev, ...newRows])
   * }}
   * ```
   */
  onRowsAdd?: (count: number) => void | Promise<void>;

  /**
   * Event handler called when deleting rows.
   * Receives both the row data objects and their row ids.
   * Can be async to support server-side row deletion.
   *
   * ```ts
   * onRowsDelete={async (rows, rowIds) => {
   *   await deleteRowsFromServer(rows.map(r => r.id))
   *   setData(prev => prev.filter(row => !rows.includes(row)))
   * }}
   * ```
   */
  onRowsDelete?: (rows: TData[], rowIds: string[]) => void | Promise<void>;

  /**
   * Event handler called after cells are pasted.
   * Receives the cell updates that were applied.
   * Can be async to support server-side persistence.
   *
   * ```ts
   * onPaste={async (updates) => {
   *   await saveCells(updates)
   * }}
   * ```
   */
  onPaste?: (updates: Array<CellUpdate>) => void | Promise<void>;

  /**
   * Event handler called when files are uploaded to a file cell.
   * Should handle file upload to server/storage and return file metadata.
   * Can be async to support server-side file uploads.
   *
   * ```ts
   * onFilesUpload={async ({ files, rowId, columnId }) => {
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
  onFilesUpload?: (params: {
    files: File[];
    rowId: string;
    columnId: string;
  }) => Promise<FileCellData[]>;

  /**
   * Event handler called when files are deleted from a file cell.
   * Should handle file deletion from server/storage.
   * Can be async to support server-side file deletion.
   *
   * ```ts
   * onFilesDelete={async ({ fileIds, rowId, columnId }) => {
   *   await fetch('/api/files/batch-delete', {
   *     method: 'DELETE',
   *     body: JSON.stringify({ fileIds })
   *   })
   * }}
   * ```
   */
  onFilesDelete?: (params: {
    fileIds: string[];
    rowId: string;
    columnId: string;
  }) => void | Promise<void>;

  /**
   * Text direction for the grid.
   * Used for RTL support in layout, pinning, and navigation.
   */
  dir?: Direction;

  /**
   * Number of items to render outside of the visible area for smoother scrolling.
   * Higher values improve scroll performance but use more memory.
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
   * Enable column selection functionality.
   * When enabled, clicking on column headers will select all cells in that column.
   * @default false
   */
  enableColumnSelection?: boolean;

  /**
   * Enable search functionality with Ctrl+F (or Cmd+F on Mac) shortcut.
   * Provides find-in-grid capabilities with match navigation.
   * @default false
   */
  enableSearch?: boolean;

  /**
   * Enable paste functionality with Ctrl+V (or Cmd+V on Mac) shortcut.
   * Allows pasting data from clipboard into the grid.
   * Requires `onRowsAdd` to be provided for creating new rows when needed.
   * @default false
   */
  enablePaste?: boolean;

  /**
   * Whether cells can be edited. Set it to `false` to keep the grid navigable and selectable without editing. Columns can also set `enableCellEditing` on their own.
   * @default true
   */
  enableCellEditing?: boolean;

  /**
   * Whether the grid is read-only.
   * When true, prevents all editing operations across the entire grid.
   * @default false
   */
  readOnly?: boolean;
}

export interface RowAddResult {
  /**
   * The id of the added row, used to focus it.
   */
  rowId: string;

  /**
   * The column to focus in the added row. Defaults to the first navigable column.
   */
  columnId?: string;
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
   * Used for focus management and scroll handling.
   */
  dataGridRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Reference to the header container element.
   * Used for measuring header height in scroll calculations.
   */
  headerRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Reference to the footer container element.
   * Used for measuring footer height in scroll calculations.
   */
  footerRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Map of row indexes to their DOM elements.
   * Used for efficient row scrolling and navigation.
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
   * Options passed to the row virtualizer.
   */
  rowVirtualizerOptions: Pick<
    VirtualizerOptions<HTMLDivElement, Element>,
    "overscan" | "measureElement"
  >;

  /**
   * CSS variables for column sizing.
   * Applied to the grid for dynamic column width management.
   */
  columnSizeVars: React.CSSProperties;

  /**
   * Event handler called when adding a new row.
   * Only defined when `onRowAdd` is provided to useDataGrid.
   * Handles the row addition interaction from the grid footer.
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
   * Text direction for the grid.
   * Used for RTL support in layout, pinning, and navigation.
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * Height of the grid container in pixels.
   * Controls the visible area of the grid.
   * @default 600
   */
  height?: number;

  /**
   * Whether columns should stretch to fill available space.
   * When true, columns grow to fill the grid width.
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

export type GetDataGridSelectColumnProps<TData extends RowData> = Partial<
  ColumnDef<DataGridFeatures, TData>
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
   * Provides column metadata, sorting state, and sizing information.
   *
   * ```tsx
   * <DataGridColumnHeader header={header} table={table} />
   * ```
   */
  header: Header<DataGridFeatures, TData>;

  /**
   * The table instance.
   * Used to access table state and trigger actions like sorting.
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
   * The height of the row.
   * Used to size multi-line cell content.
   */
  rowHeight: RowHeightValue;

  /**
   * Whether the cell is currently focused.
   * Used to render focus ring and enable editing mode.
   */
  isFocused: boolean;

  /**
   * Whether the cell is currently being edited.
   * Used to show edit UI (input, select, textarea, etc).
   */
  isEditing: boolean;

  /**
   * Whether the cell is selected.
   * Used to render selection highlight for multi-cell selection.
   */
  isSelected: boolean;

  /**
   * Whether the cell matches the current search query.
   * Used to highlight cells that match search results.
   */
  isSearchMatch: boolean;

  /**
   * Whether the cell is the currently active search match.
   * Used to highlight the specific match being navigated to.
   */
  isActiveSearchMatch: boolean;

  /**
   * Another user's presence on this cell, in multiplayer grids.
   */
  presence: CellPresence | null;

  /**
   * Whether the cell is read-only.
   * When true, prevents editing and shows read-only UI.
   */
  readOnly: boolean;
}

export interface DataGridCellWrapperProps<TData extends RowData>
  extends DataGridCellProps<TData>, EmptyProps<"div"> {}

export interface DataGridRowProps<
  TData extends RowData,
> extends EmptyProps<"div"> {
  /**
   * The row instance from TanStack Table.
   * Contains row data, cells, and selection state.
   */
  row: Row<DataGridFeatures, TData>;

  /**
   * The virtual item representing this row.
   * Contains positioning and measurement data for virtualization.
   */
  virtualItem: VirtualItem;
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
   * Used to read and update sorting state with drag-and-drop reordering.
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
   * Used to read and update the row height setting.
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
   * Used to read and update column visibility settings.
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
   * Used to read and update column filter state with support for multiple operators and values.
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
   * Whether to show the shortcuts related to search functionality.
   * Should be set to true when `enableSearch` is true in useDataGrid.
   * Adds search-specific shortcuts (Ctrl+F, Enter, Shift+Enter) to the dialog.
   *
   * ```tsx
   * <DataGridKeyboardShortcuts enableSearch />
   * ```
   *
   * @default false
   */
  enableSearch?: boolean;

  /**
   * Whether to show the shortcuts related to undo/redo functionality.
   * Should be set to true when using the useDataGridUndoRedo hook.
   * Adds undo/redo shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y) to the dialog.
   *
   * ```tsx
   * <DataGridKeyboardShortcuts enableUndoRedo />
   * ```
   *
   * @default false
   */
  enableUndoRedo?: boolean;

  /**
   * Whether to show the shortcuts related to paste functionality.
   * Should be set to true when `enablePaste` is true in useDataGrid.
   * Adds paste shortcut (Ctrl+V) to the dialog.
   *
   * ```tsx
   * <DataGridKeyboardShortcuts enablePaste />
   * ```
   *
   * @default false
   */
  enablePaste?: boolean;

  /**
   * Whether to show the shortcuts related to row addition.
   * Should be set to true when `onRowAdd` is provided to useDataGrid.
   * Adds row insertion shortcut (Shift+Enter) to the dialog.
   *
   * ```tsx
   * <DataGridKeyboardShortcuts enableRowAdd />
   * ```
   *
   * @default false
   */
  enableRowAdd?: boolean;

  /**
   * Whether to show the shortcuts related to row deletion.
   * Should be set to true when `onRowsDelete` is provided to useDataGrid.
   * Adds row deletion shortcuts (Ctrl+Backspace, Ctrl+Delete) to the dialog.
   *
   * ```tsx
   * <DataGridKeyboardShortcuts enableRowsDelete />
   * ```
   *
   * @default false
   */
  enableRowsDelete?: boolean;
}

export interface UseDataGridUndoRedoProps<TData extends RowData> {
  /**
   * The data array for the grid.
   * Used to track changes and apply undo/redo operations.
   */
  data: TData[];

  /**
   * Event handler called when data changes due to undo/redo.
   * Receives the updated data array after applying the operation.
   *
   * ```tsx
   * onDataChange={(data) => setData(data)}
   * ```
   */
  onDataChange: (data: TData[]) => void;

  /**
   * Function to get a unique ID from a row.
   * Used for ID-based tracking instead of index-based, making undo/redo robust against sorting/filtering.
   *
   * ```tsx
   * getRowId={(row) => row.id}
   * ```
   */
  getRowId: (row: TData) => string;

  /**
   * Maximum number of history entries to keep.
   * Older entries are discarded when the limit is reached.
   *
   * @default 100
   */
  maxHistory?: number;

  /**
   * Whether undo/redo functionality is enabled.
   * When false, keyboard shortcuts and history tracking are disabled.
   *
   * @default true
   */
  enabled?: boolean;
}

export interface UseDataGridUndoRedoReturn<TData extends RowData> {
  /**
   * Whether there are any actions to undo.
   * Use this to conditionally enable/disable undo buttons.
   */
  canUndo: boolean;

  /**
   * Whether there are any actions to redo.
   * Use this to conditionally enable/disable redo buttons.
   */
  canRedo: boolean;

  /**
   * Function to undo the last action.
   * Shows a toast notification with the result.
   */
  onUndo: () => void;

  /**
   * Function to redo the last undone action.
   * Shows a toast notification with the result.
   */
  onRedo: () => void;

  /**
   * Function to clear all history.
   * Useful when resetting the grid state.
   */
  onClear: () => void;

  /**
   * Function to track cell updates for undo/redo.
   * Call this when cells are modified to enable undoing those changes.
   *
   * ```tsx
   * trackCellsUpdate([{
   *   rowId: "row-1",
   *   columnId: "name",
   *   previousValue: "Old Name",
   *   newValue: "New Name"
   * }])
   * ```
   */
  trackCellsUpdate: (
    updates: Array<{
      rowId: string;
      columnId: string;
      previousValue: unknown;
      newValue: unknown;
    }>,
  ) => void;

  /**
   * Function to track row additions for undo/redo.
   * Call this after adding new rows to enable undoing the addition.
   *
   * ```tsx
   * trackRowsAdd([newRow1, newRow2])
   * ```
   */
  trackRowsAdd: (rows: TData[]) => void;

  /**
   * Function to track row deletions for undo/redo.
   * Call this before deleting rows to enable undoing the deletion.
   *
   * ```tsx
   * trackRowsDelete([rowToDelete1, rowToDelete2])
   * ```
   */
  trackRowsDelete: (rows: TData[]) => void;
}

export interface DataGridSkeletonProps extends EmptyProps<"div"> {}

export interface DataGridSkeletonToolbarProps extends EmptyProps<"div"> {
  /**
   * Alignment of the toolbar skeleton.
   * Controls the horizontal positioning of action button skeletons.
   *
   * ```tsx
   * <DataGridSkeletonToolbar align="end" />
   * ```
   *
   * @default "end"
   */
  align?: "start" | "center" | "end";

  /**
   * Number of action button skeletons to display.
   * Represents the number of toolbar actions (filter, sort, view, etc).
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
