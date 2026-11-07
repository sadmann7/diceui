import type {
  QueryField,
  QueryGroup,
} from "@/registry/bases/base/lib/query-builder";
import type { Button } from "@/registry/bases/base/ui/button";
import type { QueryBuilderLabels } from "@/registry/bases/base/ui/query-builder";
import type { SelectTrigger } from "@/registry/bases/base/ui/select";
import type { EmptyProps, RenderProps } from "@/types";

type ButtonProps = React.ComponentProps<typeof Button>;
type SelectTriggerProps = React.ComponentProps<typeof SelectTrigger>;

export interface QueryBuilderProps extends EmptyProps<"div">, RenderProps {
  /**
   * The fields rules can filter on. Only these fields are used when formatting
   * SQL, so column names never come from user input.
   *
   * ```ts
   * fields={[
   *   { name: "title", label: "Title", type: "text" },
   *   { name: "createdAt", label: "Created", type: "date", column: "created_at" },
   * ]}
   * ```
   */
  fields: QueryField[];

  /**
   * The controlled query.
   *
   * ```ts
   * value={{ id: "root", combinator: "and", rules: [] }}
   * ```
   */
  value?: QueryGroup;

  /**
   * The query for uncontrolled usage.
   *
   * @default createQueryGroup()
   */
  defaultValue?: QueryGroup;

  /**
   * Event handler called when the query changes.
   *
   * ```ts
   * onValueChange={(query) => {
   *   console.log(formatQuery(query, fields));
   * }}
   * ```
   */
  onValueChange?: (value: QueryGroup) => void;

  /**
   * How deep groups can nest. The root group is depth 0.
   *
   * @default 2
   */
  maxDepth?: number;

  /**
   * Whether the query builder is disabled.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * The built-in text, for translating or rewording it. Labels you leave out
   * keep their English default.
   *
   * ```ts
   * labels={{
   *   where: "Où",
   *   addRule: "Ajouter une règle",
   *   selected: (count) => `${count} sélectionnés`,
   * }}
   * ```
   */
  labels?: Partial<QueryBuilderLabels>;
}

export interface QueryBuilderGroupProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderGroupContentProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderConnectorProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderCombinatorProps extends Omit<
  SelectTriggerProps,
  keyof React.ComponentProps<"button">
> {}

export interface QueryBuilderNotProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {}

export interface QueryBuilderFieldProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {}

export interface QueryBuilderOperatorProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {}

export interface QueryBuilderGroupHeaderProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderGroupTitleProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderGroupFooterProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderRulesProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderRuleProps extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderValueProps {
  /**
   * The display of the selected values in select fields.
   *
   * - `list`: A badge for each value that fits, then `+N`.
   * - `summary`: The value's label, or a count like "2 selected".
   *
   * @default "list"
   */
  display?: "list" | "summary";
}

export interface QueryBuilderAddRuleProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {
  /**
   * The name of the field the new rule uses. Defaults to the first field.
   *
   * ```ts
   * field="status"
   * ```
   */
  field?: string;
}

export interface QueryBuilderAddGroupProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {
  /**
   * The name of the field the new rule uses. Defaults to the first field.
   *
   * ```ts
   * field="status"
   * ```
   */
  field?: string;
}

export interface QueryBuilderRemoveProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {}
