"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { cn } from "cn";
import * as React from "react";

import {
  addQueryNode,
  createQueryGroup,
  createQueryRule,
  getIsQueryGroup,
  getIsQueryRuleMultiple,
  getQueryOperatorLabel,
  getQueryOperators,
  type QueryCombinator,
  type QueryField,
  type QueryFieldOption,
  type QueryGroup,
  type QueryNode,
  type QueryOperator,
  type QueryRule,
  type QueryValue,
  removeQueryNode,
  setQueryRuleField,
  setQueryRuleOperator,
  setQueryRuleValues,
  updateQueryNode,
} from "@/registry/bases/base/lib/query-builder";
import { Button } from "@/registry/bases/base/ui/button";
import {
  Faceted,
  FacetedBadge,
  FacetedClear,
  FacetedContent,
  FacetedEmpty,
  FacetedGroup,
  FacetedInput,
  FacetedItem,
  FacetedItemIndicator,
  FacetedList,
  FacetedTrigger,
  FacetedValue,
} from "@/registry/bases/base/ui/faceted";
import { Input } from "@/registry/bases/base/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/bases/base/ui/select";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

const ROOT_NAME = "QueryBuilder";
const GROUP_NAME = "QueryBuilderGroup";
const RULE_NAME = "QueryBuilderRule";

interface DivProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {}

interface QueryBuilderLabels {
  where: string;
  and: string;
  or: string;
  all: string;
  any: string;
  not: string;
  combinator: string;
  matchAll: string;
  matchAny: string;
  matchNotAll: string;
  matchNone: string;
  field: string;
  searchFields: string;
  noFields: string;
  operator: string;
  searchOperators: string;
  noOperators: string;
  enterValue: string;
  selectValue: string;
  selectValues: string;
  searchValues: (field: string) => string;
  selected: (count: number) => string;
  noValue: string;
  noValues: string;
  between: string;
  from: string;
  to: string;
  true: string;
  false: string;
  addRule: string;
  addGroup: string;
  removeRule: string;
  removeGroup: string;
}

const DEFAULT_LABELS: QueryBuilderLabels = {
  where: "Where",
  and: "And",
  or: "Or",
  all: "All",
  any: "Any",
  not: "Not",
  combinator: "Combinator",
  matchAll: "All of the following are true…",
  matchAny: "Any of the following are true…",
  matchNotAll: "Not all of the following are true…",
  matchNone: "None of the following are true…",
  field: "Field",
  searchFields: "Search fields",
  noFields: "No fields found.",
  operator: "Operator",
  searchOperators: "Search operators",
  noOperators: "No operators found.",
  enterValue: "Enter a value",
  selectValue: "Select a value",
  selectValues: "Select values",
  searchValues: (field) => `Search ${field.toLowerCase()}`,
  selected: (count) => `${count} selected`,
  noValue: "no value",
  noValues: "No results.",
  between: "and",
  from: "from",
  to: "to",
  true: "True",
  false: "False",
  addRule: "Add rule",
  addGroup: "Add group",
  removeRule: "Remove rule",
  removeGroup: "Remove group",
};

interface QueryBuilderContextValue {
  fields: QueryField[];
  labels: QueryBuilderLabels;
  value: QueryGroup;
  setValue: (updater: (value: QueryGroup) => QueryGroup) => void;
  maxDepth: number;
  disabled: boolean;
}

const QueryBuilderContext =
  React.createContext<QueryBuilderContextValue | null>(null);

function useQueryBuilderContext(consumerName: string) {
  const context = React.useContext(QueryBuilderContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface GroupContextValue {
  group: QueryGroup;
  depth: number;
  isRoot: boolean;
}

const GroupContext = React.createContext<GroupContextValue | null>(null);

function useGroupContext(consumerName: string) {
  const context = React.useContext(GroupContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`${GROUP_NAME}\``,
    );
  }
  return context;
}

const NestedGroupContext = React.createContext<QueryGroup | null>(null);

const GroupTemplateContext = React.createContext<QueryBuilderGroupProps | null>(
  null,
);

interface NodeContextValue {
  index: number;
  group: QueryGroup;
}

const NodeContext = React.createContext<NodeContextValue | null>(null);

const RuleContext = React.createContext<QueryRule | null>(null);

function useRuleContext(consumerName: string) {
  const context = React.useContext(RuleContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${RULE_NAME}\``);
  }
  return context;
}

function useQueryActions(consumerName: string) {
  const { setValue } = useQueryBuilderContext(consumerName);
  return React.useMemo(
    () => ({
      update: (id: string, updater: (node: QueryNode) => QueryNode) =>
        setValue((value) => updateQueryNode(value, id, updater)),
      add: (groupId: string, node: QueryNode) =>
        setValue((value) => addQueryNode(value, groupId, node)),
      remove: (id: string) => setValue((value) => removeQueryNode(value, id)),
    }),
    [setValue],
  );
}

interface QueryBuilderProps extends Omit<DivProps, "defaultValue"> {
  fields: QueryField[];
  value?: QueryGroup;
  defaultValue?: QueryGroup;
  onValueChange?: (value: QueryGroup) => void;
  maxDepth?: number;
  disabled?: boolean;
  labels?: Partial<QueryBuilderLabels>;
}

function QueryBuilder({
  fields,
  labels: labelsProp,
  value: valueProp,
  defaultValue,
  onValueChange: onValueChangeProp,
  maxDepth = 2,
  disabled = false,
  className,
  render,
  ...props
}: QueryBuilderProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    () => defaultValue ?? createQueryGroup(),
  );
  const isControlled = valueProp !== undefined;
  const value = valueProp ?? uncontrolledValue;

  const valueRef = React.useRef(value);
  useIsoLayoutEffect(() => {
    valueRef.current = value;
  });

  const setValue = React.useCallback(
    (updater: (value: QueryGroup) => QueryGroup) => {
      const next = updater(valueRef.current);
      if (next === valueRef.current) return;
      valueRef.current = next;
      if (!isControlled) setUncontrolledValue(next);
      onValueChangeProp?.(next);
    },
    [isControlled, onValueChangeProp],
  );

  const labels = React.useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelsProp }),
    [labelsProp],
  );

  const contextValue = React.useMemo<QueryBuilderContextValue>(
    () => ({ fields, labels, value, setValue, maxDepth, disabled }),
    [fields, labels, value, setValue, maxDepth, disabled],
  );

  return (
    <QueryBuilderContext.Provider value={contextValue}>
      {useRender({
        defaultTagName: "div",
        props: mergeProps<"div">(
          {
            role: "group",
            className: cn("cn-query-builder flex flex-col", className),
          },
          props,
        ),
        render,
        state: {
          slot: "query-builder",
          disabled,
        },
      })}
    </QueryBuilderContext.Provider>
  );
}

interface QueryBuilderGroupProps extends DivProps {}

function QueryBuilderGroup({
  className,
  render,
  ref,
  id,
  ...props
}: QueryBuilderGroupProps) {
  const { value } = useQueryBuilderContext(GROUP_NAME);
  const parent = React.useContext(GroupContext);
  const nestedGroup = React.useContext(NestedGroupContext);

  const group = nestedGroup ?? value;
  const depth = parent ? parent.depth + 1 : 0;

  const groupContext = React.useMemo<GroupContextValue>(
    () => ({ group, depth, isRoot: !parent }),
    [group, depth, parent],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        id,
        role: parent ? "listitem" : "group",
        className: cn("cn-query-builder-group flex", className),
      },
      props,
    ),
    render,
    ref,
    state: {
      slot: "query-builder-group",
      depth: String(depth),
      combinator: group.combinator,
      not: !!group.not,
    },
  });

  return (
    <GroupTemplateContext.Provider value={{ className, render, ...props }}>
      <GroupContext.Provider value={groupContext}>
        <NestedGroupContext.Provider value={null}>
          {element}
        </NestedGroupContext.Provider>
      </GroupContext.Provider>
    </GroupTemplateContext.Provider>
  );
}

function QueryBuilderGroupHeader({ className, render, ...props }: DivProps) {
  const { depth } = useGroupContext("QueryBuilderGroupHeader");

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "cn-query-builder-group-header flex items-center",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "query-builder-group-header", depth: String(depth) },
  });
}

function QueryBuilderGroupTitle({
  className,
  children,
  render,
  ...props
}: DivProps) {
  const { labels } = useQueryBuilderContext("QueryBuilderGroupTitle");
  const { group } = useGroupContext("QueryBuilderGroupTitle");
  const title =
    group.combinator === "and"
      ? group.not
        ? labels.matchNotAll
        : labels.matchAll
      : group.not
        ? labels.matchNone
        : labels.matchAny;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("cn-query-builder-group-title", className),
        children: children ?? title,
      },
      props,
    ),
    render,
    state: { slot: "query-builder-group-title" },
  });
}

function QueryBuilderGroupFooter({ className, render, ...props }: DivProps) {
  const { depth } = useGroupContext("QueryBuilderGroupFooter");

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "cn-query-builder-group-footer flex items-center",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "query-builder-group-footer", depth: String(depth) },
  });
}

function QueryBuilderGroupContent({ className, render, ...props }: DivProps) {
  const { depth } = useGroupContext("QueryBuilderGroupContent");

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "cn-query-builder-group-content @container flex flex-col",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "query-builder-group-content", depth: String(depth) },
  });
}

function QueryBuilderRules({
  className,
  children,
  render,
  ...props
}: DivProps) {
  const { group } = useGroupContext("QueryBuilderRules");
  const template = React.useContext(GroupTemplateContext);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "list",
        className: cn("cn-query-builder-rules flex flex-col", className),
        children: (
          <>
            {group.rules.map((node, index) => (
              <NodeContext.Provider key={node.id} value={{ index, group }}>
                {getIsQueryGroup(node) ? (
                  <NestedGroupContext.Provider value={node}>
                    <QueryBuilderGroup {...template} />
                  </NestedGroupContext.Provider>
                ) : (
                  <RuleContext.Provider value={node}>
                    {children}
                  </RuleContext.Provider>
                )}
              </NodeContext.Provider>
            ))}
          </>
        ),
      },
      props,
    ),
    render,
    state: { slot: "query-builder-rules" },
  });
}

function QueryBuilderRule({ className, render, ...props }: DivProps) {
  const rule = useRuleContext(RULE_NAME);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "listitem",
        className: cn(
          "cn-query-builder-rule flex flex-wrap items-center",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "query-builder-rule", operator: rule.operator },
  });
}

interface CombinatorSelectProps extends React.ComponentProps<
  typeof SelectTrigger
> {
  group: QueryGroup;
  items: Record<QueryCombinator, string>;
}

function CombinatorSelect({ group, items, ...props }: CombinatorSelectProps) {
  const { disabled, labels } = useQueryBuilderContext("QueryBuilderCombinator");
  const { update } = useQueryActions("QueryBuilderCombinator");

  return (
    <Select
      items={(["and", "or"] as const).map((value) => ({
        value,
        label: items[value],
      }))}
      value={group.combinator}
      onValueChange={(combinator) => {
        if (!combinator) return;
        update(group.id, (node) => ({ ...node, combinator }));
      }}
      disabled={disabled}
    >
      <SelectTrigger size="sm" aria-label={labels.combinator} {...props}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(["and", "or"] as const).map((combinator) => (
          <SelectItem key={combinator} value={combinator}>
            {items[combinator]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface QueryBuilderCombinatorProps extends React.ComponentProps<
  typeof SelectTrigger
> {}

function QueryBuilderCombinator({
  className,
  ...props
}: QueryBuilderCombinatorProps) {
  const { labels } = useQueryBuilderContext("QueryBuilderCombinator");
  const { group } = useGroupContext("QueryBuilderCombinator");

  return (
    <CombinatorSelect
      group={group}
      items={{ and: labels.all, or: labels.any }}
      data-slot="query-builder-combinator"
      {...props}
      className={cn("cn-query-builder-combinator", className)}
    />
  );
}

interface QueryBuilderConnectorProps extends DivProps {}

function QueryBuilderConnector({
  className,
  render,
  ...props
}: QueryBuilderConnectorProps) {
  const { labels } = useQueryBuilderContext("QueryBuilderConnector");
  const node = React.useContext(NodeContext);

  const index = node?.index ?? 0;
  const group = node?.group;
  const target = group?.rules[index];
  const items = { and: labels.and, or: labels.or };

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "cn-query-builder-connector flex items-center",
          className,
        ),
        children: !group ? null : index === 1 ? (
          <CombinatorSelect
            group={group}
            items={items}
            className="cn-query-builder-connector-select"
          />
        ) : (
          <span className="cn-query-builder-connector-label">
            {index === 0 ? labels.where : items[group.combinator]}
          </span>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "query-builder-connector",
      type: target && getIsQueryGroup(target) ? "group" : "rule",
    },
  });

  if (!node) return null;

  return element;
}

interface QueryBuilderNotProps extends React.ComponentProps<typeof Button> {}

function QueryBuilderNot({
  onClick,
  children,
  className,
  ...props
}: QueryBuilderNotProps) {
  const { disabled, labels } = useQueryBuilderContext("QueryBuilderNot");
  const { group } = useGroupContext("QueryBuilderNot");
  const { update } = useQueryActions("QueryBuilderNot");

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={!!group.not}
      data-slot="query-builder-not"
      data-state={group.not ? "on" : "off"}
      disabled={disabled}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        update(group.id, (node) =>
          getIsQueryGroup(node) ? { ...node, not: !node.not } : node,
        );
      }}
      className={cn("cn-query-builder-not", className)}
    >
      {children ?? labels.not}
    </Button>
  );
}

interface QueryBuilderFieldProps extends React.ComponentProps<typeof Button> {}

function QueryBuilderField({ className, ...props }: QueryBuilderFieldProps) {
  const { fields, labels, disabled } =
    useQueryBuilderContext("QueryBuilderField");
  const rule = useRuleContext("QueryBuilderField");
  const { update } = useQueryActions("QueryBuilderField");
  const current = fields.find((field) => field.name === rule.field);

  return (
    <Faceted
      items={fields.map((field) => ({ label: field.label, value: field.name }))}
      value={rule.field}
      onValueChange={(name) => {
        const field = fields.find((item) => item.name === name);
        if (!field) return;
        update(rule.id, (node) =>
          setQueryRuleField(node as QueryRule, current, field),
        );
      }}
    >
      <FacetedTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={
              current ? `${labels.field}: ${current.label}` : labels.field
            }
            data-slot="query-builder-field"
            disabled={disabled}
            {...props}
            className={cn(
              "cn-query-builder-field cn-query-builder-select",
              className,
            )}
          />
        }
      >
        <FacetedValue>
          {([item]) => (
            <span
              className={cn(
                "cn-query-builder-select-value",
                !item && "text-muted-foreground",
              )}
            >
              {item ? item.label : labels.field}
            </span>
          )}
        </FacetedValue>
        <IconPlaceholder
          lucide="ChevronDownIcon"
          tabler="IconChevronDown"
          hugeicons="ArrowDown01Icon"
          phosphor="CaretDownIcon"
          remixicon="RiArrowDownSLine"
          data-slot="query-builder-select-icon"
          className="cn-query-builder-select-icon"
        />
      </FacetedTrigger>
      <FacetedContent align="start">
        <FacetedInput placeholder={labels.searchFields} />
        <FacetedList>
          <FacetedEmpty>{labels.noFields}</FacetedEmpty>
          <FacetedGroup>
            {fields.map((field) => (
              <FacetedItem key={field.name} value={field.name}>
                <span className="flex-1 truncate">{field.label}</span>
                <FacetedItemIndicator />
              </FacetedItem>
            ))}
          </FacetedGroup>
        </FacetedList>
      </FacetedContent>
    </Faceted>
  );
}

interface QueryBuilderOperatorProps extends React.ComponentProps<
  typeof Button
> {}

function QueryBuilderOperator({
  className,
  ...props
}: QueryBuilderOperatorProps) {
  const { fields, labels, disabled } = useQueryBuilderContext(
    "QueryBuilderOperator",
  );
  const rule = useRuleContext("QueryBuilderOperator");
  const { update } = useQueryActions("QueryBuilderOperator");
  const field = fields.find((item) => item.name === rule.field);

  if (!field) return null;

  const operators = getQueryOperators(field).map((operator) => ({
    label: getQueryOperatorLabel(operator, field.type),
    value: operator,
  }));

  return (
    <Faceted
      items={operators}
      value={rule.operator}
      onValueChange={(next) => {
        if (!next) return;
        update(rule.id, (node) =>
          setQueryRuleOperator(node as QueryRule, field, next as QueryOperator),
        );
      }}
    >
      <FacetedTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={`${labels.operator}: ${getQueryOperatorLabel(rule.operator, field.type)}`}
            data-slot="query-builder-operator"
            disabled={disabled}
            {...props}
            className={cn(
              "cn-query-builder-operator cn-query-builder-select",
              className,
            )}
          />
        }
      >
        <FacetedValue>
          {([item]) => (
            <span className="cn-query-builder-select-value">{item?.label}</span>
          )}
        </FacetedValue>
        <IconPlaceholder
          lucide="ChevronDownIcon"
          tabler="IconChevronDown"
          hugeicons="ArrowDown01Icon"
          phosphor="CaretDownIcon"
          remixicon="RiArrowDownSLine"
          data-slot="query-builder-select-icon"
          className="cn-query-builder-select-icon"
        />
      </FacetedTrigger>
      <FacetedContent align="start">
        <FacetedInput placeholder={labels.searchOperators} />
        <FacetedList>
          <FacetedEmpty>{labels.noOperators}</FacetedEmpty>
          <FacetedGroup>
            {operators.map((operator) => (
              <FacetedItem key={operator.value} value={operator.value}>
                <span className="flex-1 truncate">{operator.label}</span>
                <FacetedItemIndicator />
              </FacetedItem>
            ))}
          </FacetedGroup>
        </FacetedList>
      </FacetedContent>
    </Faceted>
  );
}

function getSelectedValues(value: QueryValue | undefined) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function QueryBuilderValueList({ options }: { options: QueryFieldOption[] }) {
  const listRef = React.useRef<HTMLSpanElement>(null);
  const itemRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const labelRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const countRef = React.useRef<HTMLSpanElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(options.length);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    function measure() {
      if (!list) return;
      const widths = options.map((_, index) => {
        const item = itemRefs.current[index];
        const label = labelRefs.current[index];
        if (!item) return 0;
        if (!label) return item.getBoundingClientRect().width;
        return (
          item.getBoundingClientRect().width -
          label.getBoundingClientRect().width +
          label.scrollWidth
        );
      });
      const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
      const available = list.getBoundingClientRect().width;
      const total = widths.reduce((sum, width) => sum + width + gap, -gap);
      if (total <= available) {
        setVisibleCount(widths.length);
        return;
      }
      let used = countRef.current?.getBoundingClientRect().width ?? 24;
      let count = 0;
      for (const width of widths) {
        if (used + gap + width > available) break;
        used += gap + width;
        count++;
      }
      setVisibleCount(Math.max(1, count));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  });

  const hiddenCount = Math.max(0, options.length - visibleCount);

  return (
    <span
      ref={listRef}
      data-slot="query-builder-value-list"
      className="cn-query-builder-value-list"
    >
      {options.map(({ label, value }, index) => (
        <span
          key={value}
          ref={(node) => {
            itemRefs.current[index] = node;
          }}
          data-slot="query-builder-value-item"
          data-hidden={index >= visibleCount ? "" : undefined}
          className="cn-query-builder-value-item"
        >
          <FacetedBadge>
            <span
              ref={(node) => {
                labelRefs.current[index] = node;
              }}
              className="cn-query-builder-value-label"
            >
              {label}
            </span>
          </FacetedBadge>
        </span>
      ))}
      {hiddenCount > 0 && (
        <FacetedBadge ref={countRef} className="cn-query-builder-value-count">
          +{hiddenCount}
        </FacetedBadge>
      )}
    </span>
  );
}

interface QueryBuilderValueProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "defaultValue" | "onChange"
> {
  display?: "list" | "summary";
}

function QueryBuilderValue({
  display = "list",
  id,
  className,
  ...props
}: QueryBuilderValueProps) {
  const { fields, labels, disabled } =
    useQueryBuilderContext("QueryBuilderValue");
  const rule = useRuleContext("QueryBuilderValue");
  const { update } = useQueryActions("QueryBuilderValue");
  const field = fields.find((item) => item.name === rule.field);

  if (!field) return null;

  const onChange = (value: QueryValue) =>
    update(rule.id, (node) => ({ ...node, value }));

  const inputType =
    field.type === "number"
      ? "number"
      : field.type === "date"
        ? "date"
        : "text";

  const valueClassName = cn("cn-query-builder-value", className);

  if (rule.operator === "isEmpty" || rule.operator === "isNotEmpty") {
    return (
      <Input
        aria-hidden="true"
        tabIndex={-1}
        id={id}
        {...props}
        disabled
        data-slot="query-builder-value"
        data-operator={rule.operator}
        className={valueClassName}
      />
    );
  }

  if (rule.operator === "isBetween") {
    const [start = "", end = ""] = Array.isArray(rule.value) ? rule.value : [];
    return (
      <>
        <Input
          type={inputType}
          aria-label={`${field.label} ${labels.from}`}
          id={id}
          {...props}
          value={start}
          onChange={(event) => onChange([event.target.value, end])}
          disabled={disabled}
          data-slot="query-builder-value"
          data-operator={rule.operator}
          className={valueClassName}
        />
        <span className="cn-query-builder-value-separator">
          {labels.between}
        </span>
        <Input
          type={inputType}
          aria-label={`${field.label} ${labels.to}`}
          {...props}
          value={end}
          onChange={(event) => onChange([start, event.target.value])}
          disabled={disabled}
          data-slot="query-builder-value"
          data-operator={rule.operator}
          className={valueClassName}
        />
      </>
    );
  }

  if (
    field.type === "boolean" ||
    field.type === "select" ||
    field.type === "multiSelect"
  ) {
    const options =
      field.type === "boolean"
        ? [
            { label: labels.true, value: "true" },
            { label: labels.false, value: "false" },
          ]
        : (field.options ?? []);
    const multiple = getIsQueryRuleMultiple(rule, field);
    const selected = getSelectedValues(rule.value).flatMap((value) =>
      options.filter((option) => option.value === value),
    );
    const selectedLabels = selected.map((option) => option.label).join(", ");

    return (
      <Faceted
        items={options}
        multiple={multiple}
        value={multiple ? getSelectedValues(rule.value) : rule.value}
        onValueChange={(next) =>
          update(rule.id, (node) =>
            setQueryRuleValues(
              node as QueryRule,
              field,
              getSelectedValues(next),
            ),
          )
        }
      >
        <FacetedTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              aria-label={`${field.label}: ${selectedLabels || labels.noValue}`}
              title={selected.length > 1 ? selectedLabels : undefined}
              id={id}
              {...props}
              data-slot="query-builder-value"
              data-operator={rule.operator}
              disabled={disabled}
              className={cn("cn-query-builder-select", valueClassName)}
            />
          }
        >
          <FacetedValue>
            {() => {
              if (selected.length > 0 && display === "summary") {
                return (
                  <span className="cn-query-builder-select-value">
                    {selected.length > 1
                      ? labels.selected(selected.length)
                      : selected[0]?.label}
                  </span>
                );
              }
              if (selected.length > 0) {
                return <QueryBuilderValueList options={selected} />;
              }
              return (
                <span className="cn-query-builder-select-value text-muted-foreground">
                  {field.placeholder ??
                    (multiple ? labels.selectValues : labels.selectValue)}
                </span>
              );
            }}
          </FacetedValue>
          <IconPlaceholder
            lucide="ChevronDownIcon"
            tabler="IconChevronDown"
            hugeicons="ArrowDown01Icon"
            phosphor="CaretDownIcon"
            remixicon="RiArrowDownSLine"
            data-slot="query-builder-select-icon"
            className="cn-query-builder-select-icon"
          />
        </FacetedTrigger>
        <FacetedContent align="start">
          <FacetedInput placeholder={labels.searchValues(field.label)} />
          <FacetedList>
            <FacetedEmpty>{labels.noValues}</FacetedEmpty>
            <FacetedGroup>
              {options.map((option) => (
                <FacetedItem key={option.value} value={option.value}>
                  {option.icon && <option.icon aria-hidden="true" />}
                  <span className="flex-1 truncate">{option.label}</span>
                  <FacetedItemIndicator />
                </FacetedItem>
              ))}
            </FacetedGroup>
            {multiple && <FacetedClear />}
          </FacetedList>
        </FacetedContent>
      </Faceted>
    );
  }

  return (
    <Input
      type={inputType}
      aria-label={field.label}
      placeholder={field.placeholder ?? labels.enterValue}
      id={id}
      {...props}
      value={typeof rule.value === "string" ? rule.value : ""}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      data-slot="query-builder-value"
      data-operator={rule.operator}
      className={valueClassName}
    />
  );
}

function getField(fields: QueryField[], name?: string) {
  return name === undefined
    ? fields[0]
    : fields.find((field) => field.name === name);
}

interface QueryBuilderAddRuleProps extends React.ComponentProps<typeof Button> {
  field?: string;
}

function QueryBuilderAddRule({
  field: fieldProp,
  onClick,
  children,
  className,
  ...props
}: QueryBuilderAddRuleProps) {
  const { fields, labels, disabled } = useQueryBuilderContext(
    "QueryBuilderAddRule",
  );
  const { group } = useGroupContext("QueryBuilderAddRule");
  const { add } = useQueryActions("QueryBuilderAddRule");
  const field = getField(fields, fieldProp);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-slot="query-builder-add-rule"
      disabled={disabled || !field}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !field) return;
        add(group.id, createQueryRule(field));
      }}
      className={cn("cn-query-builder-add-rule", className)}
    >
      {children ?? (
        <>
          <IconPlaceholder
            lucide="PlusIcon"
            tabler="IconPlus"
            hugeicons="PlusSignIcon"
            phosphor="PlusIcon"
            remixicon="RiAddLine"
          />
          {labels.addRule}
        </>
      )}
    </Button>
  );
}

interface QueryBuilderAddGroupProps extends React.ComponentProps<
  typeof Button
> {
  field?: string;
}

function QueryBuilderAddGroup({
  field: fieldProp,
  onClick,
  children,
  className,
  ...props
}: QueryBuilderAddGroupProps) {
  const { fields, labels, disabled, maxDepth } = useQueryBuilderContext(
    "QueryBuilderAddGroup",
  );
  const { group, depth } = useGroupContext("QueryBuilderAddGroup");
  const { add } = useQueryActions("QueryBuilderAddGroup");
  const field = getField(fields, fieldProp);

  if (depth >= maxDepth) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-slot="query-builder-add-group"
      disabled={disabled || !field}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !field) return;
        add(
          group.id,
          createQueryGroup(group.combinator === "and" ? "or" : "and", [
            createQueryRule(field),
          ]),
        );
      }}
      className={cn("cn-query-builder-add-group", className)}
    >
      {children ?? (
        <>
          <IconPlaceholder
            lucide="ListPlusIcon"
            tabler="IconListDetails"
            hugeicons="LeftToRightListBulletIcon"
            phosphor="ListPlusIcon"
            remixicon="RiPlayListAddLine"
          />
          {labels.addGroup}
        </>
      )}
    </Button>
  );
}

interface QueryBuilderRemoveProps extends React.ComponentProps<typeof Button> {}

function QueryBuilderRemove({
  onClick,
  children,
  className,
  ...props
}: QueryBuilderRemoveProps) {
  const { disabled, labels } = useQueryBuilderContext("QueryBuilderRemove");
  const rule = React.useContext(RuleContext);
  const group = useGroupContext("QueryBuilderRemove");
  const { remove } = useQueryActions("QueryBuilderRemove");

  const id = rule?.id ?? (group.isRoot ? undefined : group.group.id);
  if (!id) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={rule ? labels.removeRule : labels.removeGroup}
      data-slot="query-builder-remove"
      disabled={disabled}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        remove(id);
      }}
      className={cn("cn-query-builder-remove", className)}
    >
      {children ?? (
        <IconPlaceholder
          lucide="Trash2Icon"
          tabler="IconTrash"
          hugeicons="Delete02Icon"
          phosphor="TrashIcon"
          remixicon="RiDeleteBinLine"
        />
      )}
    </Button>
  );
}

export {
  QueryBuilder,
  QueryBuilderAddGroup,
  QueryBuilderAddRule,
  QueryBuilderCombinator,
  QueryBuilderConnector,
  QueryBuilderField,
  QueryBuilderGroup,
  QueryBuilderGroupContent,
  QueryBuilderGroupFooter,
  QueryBuilderGroupHeader,
  QueryBuilderGroupTitle,
  QueryBuilderNot,
  QueryBuilderOperator,
  QueryBuilderRemove,
  QueryBuilderRule,
  QueryBuilderRules,
  QueryBuilderValue,
  type QueryBuilderLabels,
};
