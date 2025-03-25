import { z } from "zod";

export type DataTableConfig = typeof dataTableConfig;

export const dataTableConfig = {
  filterVariants: [
    "text",
    "number",
    "range",
    "date",
    "date-range",
    "boolean",
    "select",
    "multi-select",
  ] as const,
  operators: [
    "iLike",
    "notILike",
    "eq",
    "ne",
    "isEmpty",
    "isNotEmpty",
    "lt",
    "lte",
    "gt",
    "gte",
    "isBetween",
    "isRelativeToToday",
  ] as const,
};

export const filterSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  variant: z.enum(dataTableConfig.filterVariants),
  operator: z.enum(dataTableConfig.operators),
  filterId: z.string(),
});
