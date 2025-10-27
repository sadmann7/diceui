import type {
  Cell,
  Header,
  Row,
  Table,
  TableOptions,
} from "@tanstack/react-table";
import type { Virtualizer } from "@tanstack/react-virtual";
import type * as React from "react";
import type { EmptyProps } from "@/types";
import type {
  CellPosition,
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
   */
  onDataChange?: (data: TData[]) => void;

  /**
   * Callback function called when adding a new row.
   * Should return the position to focus after adding the row, or null to prevent default behavior.
   * Can be async to support server-side row creation.
   *
   * @returns Position to focus after adding (rowIndex and/or columnId), or null/void
   * @example
   * ```tsx
   * const onRowAdd = async () => {
   *   const newRow = await createRow();
   *   setData(prev => [...prev, newRow]);
   *   return { rowIndex: data.length, columnId: "name" };
   * };
   * ```
   */
  onRowAdd?: (event?: React.MouseEvent<HTMLDivElement>) =>
    | Partial<CellPosition>
    | Promise<Partial<CellPosition>>
    | null
    // biome-ignore lint/suspicious/noConfusingVoidType: void is needed here to allow functions without explicit return
    | void;

  /**
   * Callback function called when deleting rows.
   * Receives both the row data objects and their indices.
   * Can be async to support server-side row deletion.
   *
   * @param rows - Array of row data objects to delete
   * @param rowIndices - Array of row indices being deleted
   * @example
   * ```tsx
   * const onRowsDelete = async (rows, indices) => {
   *   await deleteRowsFromServer(rows.map(r => r.id));
   *   setData(prev => prev.filter(row => !rows.includes(row)));
   * };
   * ```
   */
  onRowsDelete?: (rows: TData[], rowIndices: number[]) => void | Promise<void>;

  /**
   * The height of rows in the grid.
   * Controls the vertical spacing and row dimensions.
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
   * @example
   * ```tsx
   * // Focus first cell
   * autoFocus={true}
   *
   * // Focus specific cell
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
}

export interface DataGridProps<TData> extends EmptyProps<"div"> {
  /**
   * The table instance from useDataGrid hook.
   * Contains the table state, columns, and data.
   */
  table: Table<TData>;

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
   * The row virtualizer instance from @tanstack/react-virtual.
   * Handles efficient rendering of large datasets by virtualizing rows.
   */
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;

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
}

export interface DataGridColumnHeaderProps<TData> {
  /**
   * The header instance from TanStack Table.
   * Provides column metadata, sorting state, and sizing information.
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
}

export interface DataGridCellWrapperProps<TData> {
  /**
   * The cell instance from TanStack Table.
   * Contains the cell value, column, and row information.
   */
  cell: Cell<TData, unknown>;

  /**
   * The table instance from useDataGrid hook.
   * Used to access table state and trigger cell actions.
   */
  table: Table<TData>;

  /**
   * The row index in the data array.
   * Used for cell positioning and identification.
   */
  rowIndex: number;

  /**
   * The column ID for this cell.
   * Used to identify the cell in the grid.
   */
  columnId: string;

  /**
   * Whether the cell is currently focused.
   * Used to render focus ring and handle keyboard navigation.
   */
  isFocused: boolean;

  /**
   * Whether the cell is currently being edited.
   * Used to show edit mode UI and handle editing interactions.
   */
  isEditing: boolean;

  /**
   * Whether the cell is selected.
   * Used to render selection highlight for multi-cell selection.
   */
  isSelected: boolean;
}

export interface DataGridCellVariantProps<TData> {
  /**
   * The cell instance from TanStack Table.
   * Contains the cell value, column, and row information.
   */
  cell: Cell<TData, unknown>;

  /**
   * The table instance from useDataGrid hook.
   * Used to access table state and trigger cell updates.
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
}

export interface DataGridRowProps<TData> {
  /**
   * The row instance from TanStack Table.
   * Contains row data, cells, and selection state.
   */
  row: Row<TData>;

  /**
   * Map of row indexes to their DOM elements.
   * Used for efficient scroll positioning and navigation.
   */
  rowMapRef: React.RefObject<Map<number, HTMLDivElement>>;

  /**
   * The virtual row index in the virtualizer.
   * Used for positioning virtualized rows.
   */
  virtualRowIndex: number;

  /**
   * The row virtualizer instance from @tanstack/react-virtual.
   * Provides scroll state and measurement functions.
   */
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;

  /**
   * The height of the row.
   * Determines row dimensions based on the selected height option.
   */
  rowHeight: RowHeightValue;

  /**
   * The currently focused cell position.
   * Used to determine which cell should show focus ring.
   */
  focusedCell: CellPosition | null;
}

export interface DataGridSearchProps {
  /**
   * The current search query string.
   * Updated as the user types in the search input.
   */
  searchQuery: string;

  /**
   * Callback function called when the search query changes.
   * Called on every keystroke in the search input.
   */
  onSearchQueryChange: (query: string) => void;

  /**
   * Array of cell positions that match the current search query.
   * Empty when no search is active or no matches found.
   */
  searchMatches: CellPosition[];

  /**
   * The index of the currently active match in the searchMatches array.
   * -1 when no match is active.
   */
  matchIndex: number;

  /**
   * Whether the search dialog is currently open.
   * Controlled by the Ctrl+F / Cmd+F keyboard shortcut.
   */
  searchOpen: boolean;

  /**
   * Callback function called when the search dialog open state changes.
   * Called when opening via Ctrl+F or closing via Escape.
   */
  onSearchOpenChange: (open: boolean) => void;

  /**
   * Function to navigate to the next search match.
   * Wraps around to the first match when reaching the end.
   */
  onNavigateToNextMatch: () => void;

  /**
   * Function to navigate to the previous search match.
   * Wraps around to the last match when reaching the beginning.
   */
  onNavigateToPrevMatch: () => void;

  /**
   * Function to perform a search with the given query.
   * Finds all matching cells and updates searchMatches.
   */
  onSearch: (query: string) => void;
}

export interface DataGridContextMenuProps<TData> {
  /**
   * The table instance from useDataGrid hook.
   * Used to access table state and trigger context menu actions.
   */
  table: Table<TData>;
}

export interface DataGridSortMenuProps<TData> {
  /**
   * The table instance from useDataGrid hook.
   * Used to read and update sorting state with drag-and-drop reordering.
   */
  table: Table<TData>;
}

export interface DataGridRowHeightMenuProps<TData> {
  /**
   * The table instance from useDataGrid hook.
   * Used to read and update the row height setting.
   */
  table: Table<TData>;
}

export interface DataGridViewMenuProps<TData> {
  /**
   * The table instance from useDataGrid hook.
   * Used to read and update column visibility settings.
   */
  table: Table<TData>;
}

export interface DataGridKeyboardShortcutsProps {
  /**
   * Whether to show the shortcuts related to search functionality.
   * Should be set to true when `enableSearch` is true in useDataGrid.
   * Adds search-specific shortcuts (Ctrl+F, Enter, Shift+Enter) to the dialog.
   * @default false
   */
  enableSearch?: boolean;
}
