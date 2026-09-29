import type { ColumnSort, Row, RowData } from "@tanstack/react-table";

import type { DataTableConfig } from "@/config/data-table";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { FilterItemSchema } from "@/lib/parsers";

export interface QueryKeys {
  page: string;
  perPage: string;
  sort: string;
  filters: string;
  joinOperator: string;
}

export interface Option {
  label: string;
  value: string;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type FilterOperator = DataTableConfig["operators"][number];
export type FilterVariant = DataTableConfig["filterVariants"][number];
export type JoinOperator = DataTableConfig["joinOperators"][number];

export interface ExtendedColumnSort<TData extends RowData> extends Omit<
  ColumnSort,
  "id"
> {
  id: Extract<keyof TData, string>;
}

export interface ExtendedColumnFilter<
  TData extends RowData,
> extends FilterItemSchema {
  id: Extract<keyof TData, string>;
}

export interface DataTableRowAction<TData extends RowData> {
  row: Row<DataTableFeatures, TData>;
  variant: "update" | "delete";
}
