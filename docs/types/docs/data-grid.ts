import type {
  Cell,
  Header,
  Row,
  Table,
  TableOptions,
} from "@tanstack/react-table";
import type { Virtualizer } from "@tanstack/react-virtual";
import type * as React from "react";
import type {
  CellPosition,
  RowHeightValue,
  SearchState,
} from "@/types/data-grid";

export interface UseDataGridProps<TData>
  extends Omit<TableOptions<TData>, "pageCount" | "getCoreRowModel"> {
  /**
   * Callback function called when data changes due to cell edits.
   */
  onDataChange?: (data: TData[]) => void;

  /**
   * The height of rows in the grid.
   * @default "short"
   */
  rowHeight?: RowHeightValue;

  /**
   * Number of items to render outside of the visible area for smoother scrolling.
   * @default 3
   */
  overscan?: number;

  /**
   * Whether to automatically focus the grid on mount.
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Enable column selection functionality.
   * @default false
   */
  enableColumnSelection?: boolean;

  /**
   * Enable search functionality with Ctrl+F shortcut.
   * @default false
   */
  enableSearch?: boolean;
}

export interface DataGridProps<TData> extends React.ComponentProps<"div"> {
  /**
   * The table instance from useDataGrid hook.
   */
  table: Table<TData>;

  /**
   * Reference to the main grid container.
   */
  dataGridRef: React.RefObject<HTMLDivElement>;

  /**
   * Reference to the header container.
   */
  headerRef: React.RefObject<HTMLDivElement>;

  /**
   * Reference to the footer container.
   */
  footerRef: React.RefObject<HTMLDivElement>;

  /**
   * Map of row indexes to their DOM elements.
   */
  rowMapRef: React.RefObject<Map<number, HTMLDivElement>>;

  /**
   * The row virtualizer instance.
   */
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;

  /**
   * Height of the grid container in pixels.
   * @default 600
   */
  height?: number;

  /**
   * Search state and handlers.
   */
  searchState?: SearchState;

  /**
   * CSS variables for column sizing.
   */
  columnSizeVars: React.CSSProperties;

  /**
   * Function to scroll to a specific row and column.
   */
  scrollToRow: (position: Partial<CellPosition>) => void;

  /**
   * Callback function called when adding a new row.
   * Should return the position to focus after adding the row.
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
   */
  header: Header<TData, unknown>;

  /**
   * The table instance.
   */
  table: Table<TData>;
}

export interface DataGridCellProps<TData> {
  /**
   * The cell instance from TanStack Table.
   */
  cell: Cell<TData, unknown>;

  /**
   * The row index in the data array.
   */
  rowIndex: number;

  /**
   * Whether the cell is currently focused.
   */
  isFocused: boolean;

  /**
   * Whether the cell is currently being edited.
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
}

export interface DataGridRowProps<TData> {
  /**
   * The row instance from TanStack Table.
   */
  row: Row<TData>;

  /**
   * Map of row indexes to their DOM elements.
   */
  rowMapRef: React.RefObject<Map<number, HTMLDivElement>>;

  /**
   * The virtual row index.
   */
  virtualRowIndex: number;

  /**
   * The row virtualizer instance.
   */
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;

  /**
   * The height of the row.
   */
  rowHeight: RowHeightValue;

  /**
   * The currently focused cell position.
   */
  focusedCell: CellPosition | null;
}

export interface DataGridSearchProps {
  /**
   * The current search query.
   */
  searchQuery: string;

  /**
   * Callback function called when the search query changes.
   */
  onSearchQueryChange: (query: string) => void;

  /**
   * Array of search matches.
   */
  searchMatches: CellPosition[];

  /**
   * The index of the currently active match.
   */
  matchIndex: number;

  /**
   * Whether the search dialog is open.
   */
  searchOpen: boolean;

  /**
   * Callback function called when the search dialog open state changes.
   */
  onSearchOpenChange: (open: boolean) => void;

  /**
   * Function to navigate to the next search match.
   */
  onNavigateToNextMatch: () => void;

  /**
   * Function to navigate to the previous search match.
   */
  onNavigateToPrevMatch: () => void;

  /**
   * Function to perform a search.
   */
  onSearch: (query: string) => void;
}

export interface DataGridContextMenuProps<TData> {
  /**
   * The table instance.
   */
  table: Table<TData>;
}
