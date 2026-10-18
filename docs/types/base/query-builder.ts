import type {
  QueryField,
  QueryGroup,
} from "@/registry/bases/base/lib/query-builder";
import type { Button } from "@/registry/bases/base/ui/button";
import type { EmptyProps, RenderProps } from "@/types";

type ButtonProps = React.ComponentProps<typeof Button>;

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
}

export interface QueryBuilderGroupProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderGroupContentProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderConnectorProps extends EmptyProps<"div"> {}

export interface QueryBuilderGroupHeaderProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderRulesProps
  extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderRuleProps extends EmptyProps<"div">, RenderProps {}

export interface QueryBuilderAddRuleProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {}

export interface QueryBuilderAddGroupProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {}

export interface QueryBuilderRemoveProps extends Omit<
  ButtonProps,
  keyof React.ComponentProps<"button">
> {}
