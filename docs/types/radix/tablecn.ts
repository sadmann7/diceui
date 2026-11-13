import type { ColumnDef, RowData, TableOptions } from "@tanstack/react-table";
import type * as React from "react";

import type { DataGridFeatures } from "@/lib/data-grid-features";
import type { DataGridCellProps as RealDataGridCellProps } from "@/lib/data-grid-types";
import type { DataTableConfigOptions } from "@/lib/data-table-config";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { DataTableColumnConfigs } from "@/lib/data-table-types";
import type { DataGrid } from "@/registry/bases/radix/components/data-grid/data-grid";
import type { getDataGridActionsColumn } from "@/registry/bases/radix/components/data-grid/data-grid-actions-column";
import type { DataGridCell } from "@/registry/bases/radix/components/data-grid/data-grid-cell";
import type { DataGridColumnHeader } from "@/registry/bases/radix/components/data-grid/data-grid-column-header";
import type { DataGridContextMenu } from "@/registry/bases/radix/components/data-grid/data-grid-context-menu";
import type { DataGridFilterMenu } from "@/registry/bases/radix/components/data-grid/data-grid-filter-menu";
import type { DataGridKeyboardShortcuts } from "@/registry/bases/radix/components/data-grid/data-grid-keyboard-shortcuts";
import type { DataGridPasteDialog } from "@/registry/bases/radix/components/data-grid/data-grid-paste-dialog";
import type { DataGridRow } from "@/registry/bases/radix/components/data-grid/data-grid-row";
import type { DataGridRowHeightMenu } from "@/registry/bases/radix/components/data-grid/data-grid-row-height-menu";
import type { DataGridSearch } from "@/registry/bases/radix/components/data-grid/data-grid-search";
import type { getDataGridSelectColumn } from "@/registry/bases/radix/components/data-grid/data-grid-select-column";
import type {
  DataGridSkeleton,
  DataGridSkeletonGrid,
  DataGridSkeletonToolbar,
} from "@/registry/bases/radix/components/data-grid/data-grid-skeleton";
import type { DataGridSortMenu } from "@/registry/bases/radix/components/data-grid/data-grid-sort-menu";
import type { DataGridViewMenu } from "@/registry/bases/radix/components/data-grid/data-grid-view-menu";
import type { DataTable } from "@/registry/bases/radix/components/data-table/data-table";
import type { getDataTableActionsColumn } from "@/registry/bases/radix/components/data-table/data-table-actions-column";
import type { DataTableAdvancedToolbar } from "@/registry/bases/radix/components/data-table/data-table-advanced-toolbar";
import type { DataTableColumnHeader } from "@/registry/bases/radix/components/data-table/data-table-column-header";
import type { DataTableCommandFilterMenu } from "@/registry/bases/radix/components/data-table/data-table-command-filter-menu";
import type { DataTableDateFilter } from "@/registry/bases/radix/components/data-table/data-table-date-filter";
import type { DataTableFacetedFilter } from "@/registry/bases/radix/components/data-table/data-table-faceted-filter";
import type { DataTableFilterMenu } from "@/registry/bases/radix/components/data-table/data-table-filter-menu";
import type { DataTablePagination } from "@/registry/bases/radix/components/data-table/data-table-pagination";
import type { DataTableRangeFilter } from "@/registry/bases/radix/components/data-table/data-table-range-filter";
import type { DataTableSkeleton } from "@/registry/bases/radix/components/data-table/data-table-skeleton";
import type { DataTableSliderFilter } from "@/registry/bases/radix/components/data-table/data-table-slider-filter";
import type { DataTableSortMenu } from "@/registry/bases/radix/components/data-table/data-table-sort-menu";
import type { DataTableToolbar } from "@/registry/bases/radix/components/data-table/data-table-toolbar";
import type { DataTableViewOptions } from "@/registry/bases/radix/components/data-table/data-table-view-options";
import type { UseDataGridProps as RealUseDataGridProps } from "@/registry/bases/radix/hooks/use-data-grid";
import type { UseDataTableProps as RealUseDataTableProps } from "@/registry/bases/radix/hooks/use-data-table";
import type { DropdownMenuTrigger } from "@/registry/bases/radix/ui/dropdown-menu";
import type { FacetedContent } from "@/registry/bases/radix/ui/faceted";
import type { PopoverContent } from "@/registry/bases/radix/ui/popover";
import type { SelectContent } from "@/registry/bases/radix/ui/select";

import type * as Grid from "./data-grid";
import type * as Table from "./data-table";

type Keys<T> = T extends unknown ? keyof T : never;

type Props<T> = T extends React.JSXElementConstructor<infer P> ? P : never;

type PopoverContentProps = React.ComponentProps<typeof PopoverContent>;

type FacetedContentProps = React.ComponentProps<typeof FacetedContent>;

type DropdownMenuTriggerProps = React.ComponentProps<
  typeof DropdownMenuTrigger
>;

type SelectContentProps = React.ComponentProps<typeof SelectContent>;

type HtmlKeys = Keys<React.AllHTMLAttributes<HTMLElement>> | "key" | "ref";

// Props documented but missing from tablecn, plus tablecn props the docs omit, ignoring `Base`.
type Drift<Docs, Real, Base = unknown> = Expand<
  | Exclude<Keys<Docs>, Keys<Real>>
  | Exclude<Keys<Real>, Keys<Docs> | HtmlKeys | Keys<Base>>
>;

type Expand<T> = T extends string ? `${T}` : T;

type Expect<T extends never> = T;

export type DataTableDocs = [
  Expect<
    Drift<
      Table.CreateDataTableConfigProps,
      DataTableConfigOptions<DataTableColumnConfigs>
    >
  >,
  Expect<
    Drift<
      Table.UseDataTableProps<RowData>,
      RealUseDataTableProps<RowData>,
      TableOptions<DataTableFeatures, RowData>
    >
  >,
  Expect<Drift<Table.DataTableProps<RowData>, Props<typeof DataTable>>>,
  Expect<
    Drift<Table.DataTableToolbarProps<RowData>, Props<typeof DataTableToolbar>>
  >,
  Expect<
    Drift<
      Table.DataTableAdvancedToolbarProps<RowData>,
      Props<typeof DataTableAdvancedToolbar>
    >
  >,
  Expect<
    Drift<
      Table.DataTableColumnHeaderProps<RowData, unknown>,
      Props<typeof DataTableColumnHeader>,
      DropdownMenuTriggerProps
    >
  >,
  Expect<
    Drift<
      Table.DataTableDateFilterProps<RowData>,
      Props<typeof DataTableDateFilter>
    >
  >,
  Expect<
    Drift<
      Table.DataTableFacetedFilterProps<RowData, unknown>,
      Props<typeof DataTableFacetedFilter>
    >
  >,
  Expect<
    Drift<
      Table.DataTableSliderFilterProps<RowData>,
      Props<typeof DataTableSliderFilter>
    >
  >,
  Expect<
    Drift<
      Table.DataTableRangeFilterProps<RowData>,
      Props<typeof DataTableRangeFilter>
    >
  >,
  Expect<
    Drift<
      Table.DataTableFilterMenuProps<RowData>,
      Props<typeof DataTableFilterMenu>,
      PopoverContentProps
    >
  >,
  Expect<
    Drift<
      Table.DataTableCommandFilterMenuProps<RowData>,
      Props<typeof DataTableCommandFilterMenu>,
      PopoverContentProps
    >
  >,
  Expect<
    Drift<
      Table.DataTableSortMenuProps<RowData>,
      Props<typeof DataTableSortMenu>,
      PopoverContentProps
    >
  >,
  Expect<
    Drift<
      Table.DataTablePaginationProps<RowData>,
      Props<typeof DataTablePagination>
    >
  >,
  Expect<
    Drift<
      Table.DataTableViewOptionsProps<RowData>,
      Props<typeof DataTableViewOptions>,
      FacetedContentProps
    >
  >,
  Expect<Drift<Table.DataTableSkeletonProps, Props<typeof DataTableSkeleton>>>,
  Expect<
    Drift<
      Table.GetDataTableActionsColumnProps<RowData>,
      Parameters<typeof getDataTableActionsColumn>[0]
    >
  >,
];

export type DataGridDocs = [
  Expect<
    Drift<
      Grid.UseDataGridProps<RowData>,
      RealUseDataGridProps<RowData>,
      TableOptions<DataGridFeatures, RowData>
    >
  >,
  Expect<Drift<Grid.DataGridProps<RowData>, Props<typeof DataGrid>>>,
  Expect<
    Drift<
      Grid.GetDataGridSelectColumnProps<RowData>,
      NonNullable<Parameters<typeof getDataGridSelectColumn>[0]>,
      ColumnDef<DataGridFeatures, RowData>
    >
  >,
  Expect<
    Drift<
      Grid.GetDataGridActionsColumnProps<RowData>,
      Parameters<typeof getDataGridActionsColumn>[0]
    >
  >,
  Expect<
    Drift<
      Grid.DataGridColumnHeaderProps<RowData>,
      Props<typeof DataGridColumnHeader>,
      DropdownMenuTriggerProps
    >
  >,
  Expect<
    Drift<Grid.DataGridCellProps<RowData>, RealDataGridCellProps<RowData>>
  >,
  Expect<
    Drift<Grid.DataGridCellElementProps<RowData>, Props<typeof DataGridCell>>
  >,
  Expect<Drift<Grid.DataGridRowProps<RowData>, Props<typeof DataGridRow>>>,
  Expect<
    Drift<Grid.DataGridSearchProps<RowData>, Props<typeof DataGridSearch>>
  >,
  Expect<
    Drift<
      Grid.DataGridContextMenuProps<RowData>,
      Props<typeof DataGridContextMenu>
    >
  >,
  Expect<
    Drift<
      Grid.DataGridSortMenuProps<RowData>,
      Props<typeof DataGridSortMenu>,
      PopoverContentProps
    >
  >,
  Expect<
    Drift<
      Grid.DataGridRowHeightMenuProps<RowData>,
      Props<typeof DataGridRowHeightMenu>,
      SelectContentProps
    >
  >,
  Expect<
    Drift<
      Grid.DataGridViewMenuProps<RowData>,
      Props<typeof DataGridViewMenu>,
      FacetedContentProps
    >
  >,
  Expect<
    Drift<
      Grid.DataGridFilterMenuProps<RowData>,
      Props<typeof DataGridFilterMenu>,
      PopoverContentProps
    >
  >,
  Expect<
    Drift<
      Grid.DataGridPasteDialogProps<RowData>,
      Props<typeof DataGridPasteDialog>
    >
  >,
  Expect<
    Drift<
      Grid.DataGridKeyboardShortcutsProps,
      Props<typeof DataGridKeyboardShortcuts>
    >
  >,
  Expect<Drift<Grid.DataGridSkeletonProps, Props<typeof DataGridSkeleton>>>,
  Expect<
    Drift<
      Grid.DataGridSkeletonToolbarProps,
      Props<typeof DataGridSkeletonToolbar>
    >
  >,
  Expect<
    Drift<Grid.DataGridSkeletonGridProps, Props<typeof DataGridSkeletonGrid>>
  >,
];
