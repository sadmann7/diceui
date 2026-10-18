import type {
  QueryField,
  QueryGroup,
} from "@/registry/bases/radix/lib/query-builder";
import type { Button } from "@/registry/bases/radix/ui/button";
import type { CompositionProps, EmptyProps } from "@/types";

type ButtonProps = React.ComponentProps<typeof Button>;

export interface QueryBuilderProps extends EmptyProps<"div">, CompositionProps {
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
  extends EmptyProps<"div">, CompositionProps {}

export interface QueryBuilderGroupHeaderProps
  extends EmptyProps<"div">, CompositionProps {}

export interface QueryBuilderRulesProps
  extends EmptyProps<"div">, CompositionProps {}

export interface QueryBuilderRuleProps
  extends EmptyProps<"div">, CompositionProps {}

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
