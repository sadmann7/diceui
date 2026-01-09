import type {
  Cell,
  ColumnDef,
  ColumnPinningState,
  Header,
  Row,
  Table,
  TableMeta,
  TableOptions,
  VisibilityState,
} from "@tanstack/react-table";
import type { VirtualItem } from "@tanstack/react-virtual";
import type * as React from "react";
import type { PopoverContent } from "@/components/ui/popover";
import type { EmptyProps } from "@/types";
import type {
  CellPosition,
  Direction,
  FileCellData,
  PasteDialogState,
  RowHeightValue,
  SearchState,
} from "@/types/data-grid";

export interface UseDataGridProps<TData>
  extends Pick<
    TableOptions<TData>,
    "data" | "columns" | "getRowId" | "defaultColumn" | "initialState" | "state"
  > {
  /**
   * Callback function called when data changes due to cell edits.
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
   * Callback function called when adding a new row.
   * Should return the position to focus after adding the row, or null to prevent default behavior.
   * Can be async to support server-side row creation.
   *
   * ```ts
   * onRowAdd={async () => {
   *   const newRow = await createRow()
   *   setData(prev => [...prev, newRow])
   *
   *   // Focus the cell under the "name" column in the new row
   *   return { rowIndex: data.length, columnId: "name" }
   * }}
   * ```
   */
  onRowAdd?: (event?: React.MouseEvent<HTMLDivElement>) =>
    | Partial<CellPosition>
    | Promise<Partial<CellPosition>>
    | null
    // biome-ignore lint/suspicious/noConfusingVoidType: void is needed here to allow functions without explicit return
    | void;

  /**
   * Callback function called when adding multiple rows at once.
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
   *   const newRows = Array.from({ length: count }, () => ({ id: nanoid() }))
   *   setData(prev => [...prev, ...newRows])
   * }}
   * ```
   */
  onRowsAdd?: (count: number) => void | Promise<void>;

  /**
   * Callback function called when deleting rows.
   * Receives both the row data objects and their indices.
   * Can be async to support server-side row deletion.
   *
   * ```ts
   * onRowsDelete={async (rows, indices) => {
   *   await deleteRowsFromServer(rows.map(r => r.id))
   *   setData(prev => prev.filter(row => !rows.includes(row)))
   * }}
   * ```
   */
  onRowsDelete?: (rows: TData[], rowIndices: number[]) => void | Promise<void>;

  /**
   * Callback function called when files are uploaded to a file cell.
   * Should handle file upload to server/storage and return file metadata.
   * Can be async to support server-side file uploads.
   *
   * ```ts
   * onFilesUpload={async ({ files, rowIndex, columnId }) => {
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
    rowIndex: number;
    columnId: string;
  }) => Promise<FileCellData[]>;

  /**
   * Callback function called when files are deleted from a file cell.
   * Should handle file deletion from server/storage.
   * Can be async to support server-side file deletion.
   *
   * ```ts
   * onFilesDelete={async ({ fileIds, rowIndex, columnId }) => {
   *   await fetch('/api/files/batch-delete', {
   *     method: 'DELETE',
   *     body: JSON.stringify({ fileIds })
   *   })
   * }}
   * ```
   */
  onFilesDelete?: (params: {
    fileIds: string[];
    rowIndex: number;
    columnId: string;
  }) => void | Promise<void>;

  /**
   * Text direction for the grid.
   * Used for RTL support in layout, pinning, and navigation.
   */
  dir?: Direction;

  /**
   * The height of rows in the grid.
   * Controls the vertical spacing and row dimensions.
   *
   * @default "short"
   */
  rowHeight?: RowHeightValue;

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
   * autoFocus={{ rowIndex: 0, columnId: "name" }}
   * ```
   */
  autoFocus?: boolean | Partial<CellPosition>;

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
   * Whether the grid is read-only.
   * When true, prevents all editing operations across the entire grid.
   * @default false
   */
  readOnly?: boolean;
}

export interface DataGridProps<TData> extends EmptyProps<"div"> {
  /**
   * The table instance from useDataGrid hook.
   * Contains the table state, columns, and data.
   */
  table: Table<TData>;

  /**
   * The table meta from useDataGrid hook.
   * Contains table-level callbacks and state management.
   */
  tableMeta: TableMeta<TData>;

  /**
   * Array of column definitions for the data grid.
   * Used internally for column rendering and management.
   */
  columns: Array<unknown>;

  /**
   * Reference to the main grid container element.
   * Used for focus management and scroll handling.
   */
  dataGridRef: React.RefObject<HTMLDivElement>;

  /**
   * Reference to the header container element.
   * Used for measuring header height in scroll calculations.
   */
  headerRef: React.RefObject<HTMLDivElement>;

  /**
   * Reference to the footer container element.
   * Used for measuring footer height in scroll calculations.
   */
  footerRef: React.RefObject<HTMLDivElement>;

  /**
   * Map of row indexes to their DOM elements.
   * Used for efficient row scrolling and navigation.
   */
  rowMapRef: React.RefObject<Map<number, HTMLDivElement>>;

  /**
   * Total size of all virtualized rows in pixels.
   * Used to set the scroll container height.
   */
  virtualTotalSize: number;

  /**
   * Array of virtual items currently visible in the viewport.
   * Each item contains index, size, and position information.
   */
  virtualItems: VirtualItem[];

  /**
   * Callback function to measure row elements for virtualization.
   * Called with row DOM nodes to update virtual measurements.
   */
  measureElement: (node: Element | null) => void;

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
   * Search state and handlers.
   * Only defined when `enableSearch` is true in useDataGrid.
   * Provides search query, matches, and navigation functions.
   */
  searchState?: SearchState;

  /**
   * CSS variables for column sizing.
   * Applied to the grid for dynamic column width management.
   */
  columnSizeVars: React.CSSProperties;

  /**
   * Map of row indexes to sets of selected cell keys.
   * Used to efficiently track multi-cell selection per row.
   */
  cellSelectionMap: Map<number, Set<string>>;

  /**
   * Map of row indexes to sets of column IDs with search matches.
   * Used for efficient row-level search match tracking.
   */
  searchMatchesByRow: Map<number, Set<string>> | null;

  /**
   * The currently active search match position.
   * Used to highlight the specific match being navigated to.
   */
  activeSearchMatch: CellPosition | null;

  /**
   * The currently focused cell position.
   * Used to render focus ring and handle navigation.
   */
  focusedCell: CellPosition | null;

  /**
   * The currently editing cell position.
   * Used to show edit mode UI in the focused cell.
   */
  editingCell: CellPosition | null;

  /**
   * The height of rows in the grid.
   * Controls the vertical spacing and row dimensions.
   */
  rowHeight: RowHeightValue;

  /**
   * Context menu state including position and open state.
   * Used to render the right-click context menu at the correct position.
   */
  contextMenu: { open: boolean; x: number; y: number };

  /**
   * Paste dialog state for handling clipboard operations.
   * Shows when pasted data exceeds available rows.
   */
  pasteDialog: { open: boolean; rowsNeeded: number; clipboardText: string };

  /**
   * Callback function called when adding a new row.
   * Only defined when `onRowAdd` is provided to useDataGrid.
   * Handles the row addition interaction from the grid footer.
   */
  onRowAdd?: (event?: React.MouseEvent<HTMLDivElement>) =>
    | Partial<CellPosition>
    | Promise<Partial<CellPosition>>
    | null
    // biome-ignore lint/suspicious/noConfusingVoidType: void is needed here to allow functions without explicit return
    | void;

  /**
   * Whether columns should stretch to fill available space.
   * When true, columns grow to fill the grid width.
   * @default false
   */
  stretchColumns?: boolean;
}

export type GetDataGridSelectColumnProps<TData> = Partial<ColumnDef<TData>> & {
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
};

export interface DataGridColumnHeaderProps<TData> {
  /**
   * The header instance from TanStack Table.
   * Provides column metadata, sorting state, and sizing information.
   *
   * ```tsx
   * <DataGridColumnHeader header={header} table={table} />
   * ```
   */
  header: Header<TData, unknown>;

  /**
   * The table instance.
   * Used to access table state and trigger actions like sorting.
   */
  table: Table<TData>;
}

export interface DataGridCellProps<TData> {
  /**
   * The cell instance from TanStack Table.
   * Contains the cell value, column, and row information.
   */
  cell: Cell<TData, unknown>;

  /**
   * The table instance from useDataGrid hook.
   * Used to access table state and metadata for rendering the appropriate cell variant.
   */
  table: Table<TData>;

  /**
   * The row index in the data array.
   * Used for cell positioning and data updates.
   */
  rowIndex: number;

  /**
   * The column ID for this cell.
   * Used to identify the cell when updating data.
   */
  columnId: string;

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
   * Whether the cell is read-only.
   * When true, prevents editing and shows read-only UI.
   */
  readOnly: boolean;
}

export interface DataGridCellWrapperProps<TData>
  extends DataGridCellProps<TData>,
    EmptyProps<"div"> {}

export interface DataGridRowProps<TData> extends EmptyProps<"div"> {
  /**
   * The row instance from TanStack Table.
   * Contains row data, cells, and selection state.
   */
  row: Row<TData>;

  /**
   * The table meta from useDataGrid hook.
   * Contains table-level callbacks and state management.
   */
  tableMeta: TableMeta<TData>;

  /**
   * The virtual item representing this row.
   * Contains positioning and measurement data for virtualization.
   */
  virtualItem: VirtualItem;

  /**
   * Callback function to measure the row element for virtualization.
   * Called with the row DOM node to update virtual measurements.
   */
  measureElement: (node: Element | null) => void;

  /**
   * Map of row indexes to their DOM elements.
   * Used for efficient scroll positioning and navigation.
   */
  rowMapRef: React.RefObject<Map<number, HTMLDivElement>>;

  /**
   * The height of the row.
   * Determines row dimensions based on the selected height option.
   */
  rowHeight: RowHeightValue;

  /**
   * Column visibility state from TanStack Table.
   * Determines which columns should be rendered.
   */
  columnVisibility: VisibilityState;

  /**
   * Column pinning state from TanStack Table.
   * Determines which columns are pinned to left or right.
   */
  columnPinning: ColumnPinningState;

  /**
   * The currently focused cell position.
   * Used to determine which cell should show focus ring.
   */
  focusedCell: CellPosition | null;

  /**
   * The currently editing cell position.
   * Used to determine which cell should show edit mode UI.
   */
  editingCell: CellPosition | null;

  /**
   * Set of selected cell keys for this row.
   * Used to render selection highlights for multi-cell selection.
   */
  cellSelectionKeys: Set<string>;

  /**
   * Set of column IDs that have search matches in this row.
   * Used to efficiently highlight search matches per row.
   */
  searchMatchColumns: Set<string> | null;

  /**
   * The currently active search match position.
   * Only provided when the active match is in this row.
   */
  activeSearchMatch: CellPosition | null;

  /**
   * Text direction for the grid.
   * Used for RTL support in pinning and layout.
   */
  dir: Direction;

  /**
   * Whether the row is read-only.
   * When true, prevents editing in all cells of the row.
   */
  readOnly: boolean;

  /**
   * Whether columns should stretch to fill available space.
   * When true, columns grow to fill the grid width.
   */
  stretchColumns: boolean;
}

export interface DataGridSearchProps {
  /**
   * The current search query string.
   * Updated as the user types in the search input.
   *
   * ```tsx
   * searchQuery="John Doe"
   * ```
   */
  searchQuery: string;

  /**
   * Callback function called when the search query changes.
   * Called on every keystroke in the search input.
   *
   * ```tsx
   * onSearchQueryChange={(query) => console.log(query)}
   * ```
   */
  onSearchQueryChange: (query: string) => void;

  /**
   * Array of cell positions that match the current search query.
   * Empty when no search is active or no matches found.
   *
   * ```tsx
   * searchMatches={[{ rowIndex: 0, columnId: "name" }]}
   * ```
   */
  searchMatches: CellPosition[];

  /**
   * The index of the currently active match in the searchMatches array.
   * -1 when no match is active.
   *
   * ```tsx
   * matchIndex={0}
   * ```
   */
  matchIndex: number;

  /**
   * Whether the search dialog is currently open.
   * Controlled by the Ctrl+F / Cmd+F keyboard shortcut.
   *
   * ```tsx
   * searchOpen={true}
   * ```
   */
  searchOpen: boolean;

  /**
   * Callback function called when the search dialog open state changes.
   * Called when opening via Ctrl+F or closing via Escape.
   *
   * ```tsx
   * onSearchOpenChange={(open) => console.log(open)}
   * ```
   */
  onSearchOpenChange: (open: boolean) => void;

  /**
   * Function to navigate to the next search match.
   * Wraps around to the first match when reaching the end.
   *
   * ```tsx
   * onNavigateToNextMatch={() => goToNextMatch()}
   * ```
   */
  onNavigateToNextMatch: () => void;

  /**
   * Function to navigate to the previous search match.
   * Wraps around to the last match when reaching the beginning.
   *
   * ```tsx
   * onNavigateToPrevMatch={() => goToPrevMatch()}
   * ```
   */
  onNavigateToPrevMatch: () => void;

  /**
   * Function to perform a search with the given query.
   * Finds all matching cells and updates searchMatches.
   *
   * ```tsx
   * onSearch={(query) => performSearch(query)}
   * ```
   */
  onSearch: (query: string) => void;
}

export interface DataGridContextMenuProps<TData> {
  /**
   * The table instance from useDataGrid hook.
   * Used to access table state and trigger context menu actions.
   *
   * ```tsx
   * <DataGridContextMenu table={table} />
   * ```
   */
  table: Table<TData>;
}

export interface DataGridSortMenuProps<TData>
  extends EmptyProps<typeof PopoverContent> {
  /**
   * The table instance from useDataGrid hook.
   * Used to read and update sorting state with drag-and-drop reordering.
   *
   * ```tsx
   * <DataGridSortMenu table={table} />
   * ```
   */
  table: Table<TData>;

  /**
   * Whether the menu trigger is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface DataGridRowHeightMenuProps<TData>
  extends EmptyProps<typeof PopoverContent> {
  /**
   * The table instance from useDataGrid hook.
   * Used to read and update the row height setting.
   *
   * ```tsx
   * <DataGridRowHeightMenu table={table} />
   * ```
   */
  table: Table<TData>;

  /**
   * Whether the menu trigger is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface DataGridViewMenuProps<TData>
  extends EmptyProps<typeof PopoverContent> {
  /**
   * The table instance from useDataGrid hook.
   * Used to read and update column visibility settings.
   *
   * ```tsx
   * <DataGridViewMenu table={table} />
   * ```
   */
  table: Table<TData>;

  /**
   * Whether the menu trigger is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface DataGridFilterMenuProps<TData>
  extends EmptyProps<typeof PopoverContent> {
  /**
   * The table instance from useDataGrid hook.
   * Used to read and update column filter state with support for multiple operators and values.
   *
   * ```tsx
   * <DataGridFilterMenu table={table} />
   * ```
   */
  table: Table<TData>;

  /**
   * Whether the menu trigger is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface DataGridPasteDialogProps<TData> {
  /**
   * The table meta from useDataGrid hook.
   * Contains callbacks for handling paste operations.
   *
   * ```tsx
   * <DataGridPasteDialog tableMeta={tableMeta} pasteDialog={pasteDialog} />
   * ```
   */
  tableMeta: TableMeta<TData>;

  /**
   * The paste dialog state.
   * Controls dialog visibility and paste operation details.
   *
   * ```tsx
   * pasteDialog={{ open: true, rowsNeeded: 5, clipboardText: "..." }}
   * ```
   */
  pasteDialog: PasteDialogState;
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

export interface UseDataGridUndoRedoProps<TData> {
  /**
   * The data array for the grid.
   * Used to track changes and apply undo/redo operations.
   */
  data: TData[];

  /**
   * Callback function called when data changes due to undo/redo.
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

export interface UseDataGridUndoRedoReturn<TData> {
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
