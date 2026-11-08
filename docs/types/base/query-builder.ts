import type {
  QueryField,
  QueryGroup,
  QueryNode,
} from "@/registry/bases/base/lib/query-builder";
import type { Button } from "@/registry/bases/base/ui/button";
import type { QueryBuilder } from "@/registry/bases/base/ui/query-builder";
import type { SelectTrigger } from "@/registry/bases/base/ui/select";
import type { EmptyProps, RenderProps } from "@/types";

type ButtonProps = React.ComponentProps<typeof Button>;
type SelectTriggerProps = React.ComponentProps<typeof SelectTrigger>;
type QueryBuilderLabels = NonNullable<
  React.ComponentProps<typeof QueryBuilder>["labels"]
>;

export interface QueryBuilderProps extends EmptyProps<"div">, RenderProps {
  /**
   * The fields rules can filter on. Only these fields are used when formatting
   * SQL, so column names never come from user input.
   *
   * ```ts
   * fields={[
   *   { value: "title", label: "Title", type: "text" },
   *   { value: "createdAt", label: "Created", type: "date", column: "created_at" },
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
  labels?: QueryBuilderLabels;
}

export interface QueryBuilderGroupProps extends EmptyProps<"div">, RenderProps {
  /**
   * The group's layout, which nested groups reuse. Pass a function to read
   * the group, like its `rules` for a sortable list.
   *
   * ```tsx
   * {(group) => (
   *   <Sortable value={group.rules} getItemValue={(node) => node.id}>
   *     …
   *   </Sortable>
   * )}
   * ```
   */
  children?: React.ReactNode | ((group: QueryGroup) => React.ReactNode);
}

export interface QueryBuilderGroupContentProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderConnectorProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderCombinatorProps extends Omit<
  SelectTriggerProps,
  keyof React.ComponentProps<"button">
> {}

export interface QueryBuilderNegateProps extends Omit<
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

export interface QueryBuilderRuleListProps
  extends EmptyProps<"div">, RenderProps {
  /**
   * The layout for each rule. Pass a function to read each rule and nested
   * group, like its `id` for a sortable item. A function renders nested groups
   * too, and `<QueryBuilderGroup />` inside it reuses the root group's layout.
   *
   * ```tsx
   * {(node) =>
   *   getIsQueryGroup(node) ? (
   *     <SortableItem value={node.id} render={<QueryBuilderGroup />} />
   *   ) : (
   *     <SortableItem value={node.id} render={<QueryBuilderRule />} />
   *   )
   * }
   * ```
   */
  children?: React.ReactNode | ((node: QueryNode) => React.ReactNode);
}

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

  /**
   * Whether the value control is disabled. The control is also disabled
   * while the root is.
   *
   * @default false
   */
  disabled?: boolean;
}

export interface QueryBuilderAddRuleProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {
  /**
   * The `value` of the field the new rule uses. Defaults to the first field.
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
   * The `value` of the field the new rule uses. Defaults to the first field.
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
