"use client";

import { cn } from "cn";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";

import {
  addQueryNode,
  createQueryGroup,
  createQueryRule,
  getQueryOperatorLabel,
  getQueryOperators,
  getIsQueryGroup,
  getIsQueryRuleMultiple,
  type QueryCombinator,
  type QueryField,
  type QueryFieldOption,
  type QueryGroup,
  type QueryNode,
  type QueryOperator,
  type QueryRule,
  type QueryValue,
  removeQueryNode,
  setQueryRuleOperator,
  setQueryRuleValues,
  updateQueryNode,
} from "@/registry/bases/radix/lib/query-builder";
import { Button } from "@/registry/bases/radix/ui/button";
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
} from "@/registry/bases/radix/ui/faceted";
import { Input } from "@/registry/bases/radix/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/bases/radix/ui/select";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

const ROOT_NAME = "QueryBuilder";
const GROUP_NAME = "QueryBuilderGroup";
const RULE_NAME = "QueryBuilderRule";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface QueryBuilderContextValue {
  fields: QueryField[];
  value: QueryGroup;
  onValueChange: (value: QueryGroup) => void;
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

// Nested groups render with the same props as the group that holds them.
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
  const { value, onValueChange } = useQueryBuilderContext(consumerName);
  return React.useMemo(
    () => ({
      update: (id: string, updater: (node: QueryNode) => QueryNode) =>
        onValueChange(updateQueryNode(value, id, updater)),
      add: (groupId: string, node: QueryNode) =>
        onValueChange(addQueryNode(value, groupId, node)),
      remove: (id: string) => onValueChange(removeQueryNode(value, id)),
    }),
    [value, onValueChange],
  );
}

interface QueryBuilderProps extends Omit<DivProps, "defaultValue"> {
  fields: QueryField[];
  value?: QueryGroup;
  defaultValue?: QueryGroup;
  onValueChange?: (value: QueryGroup) => void;
  maxDepth?: number;
  disabled?: boolean;
}

function QueryBuilder({
  fields,
  value: valueProp,
  defaultValue,
  onValueChange: onValueChangeProp,
  maxDepth = 2,
  disabled = false,
  asChild,
  className,
  ...rootProps
}: QueryBuilderProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    () => defaultValue ?? createQueryGroup(),
  );
  const value = valueProp ?? uncontrolledValue;

  const onValueChange = React.useCallback(
    (next: QueryGroup) => {
      if (valueProp === undefined) setUncontrolledValue(next);
      onValueChangeProp?.(next);
    },
    [valueProp, onValueChangeProp],
  );

  const contextValue = React.useMemo<QueryBuilderContextValue>(
    () => ({ fields, value, onValueChange, maxDepth, disabled }),
    [fields, value, onValueChange, maxDepth, disabled],
  );

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <QueryBuilderContext.Provider value={contextValue}>
      <RootPrimitive
        role="group"
        data-slot="query-builder"
        data-disabled={disabled ? "" : undefined}
        {...rootProps}
        className={cn("cn-query-builder flex flex-col", className)}
      />
    </QueryBuilderContext.Provider>
  );
}

interface QueryBuilderGroupProps extends DivProps {}

function QueryBuilderGroup({
  asChild,
  className,
  ...groupProps
}: QueryBuilderGroupProps) {
  const { value } = useQueryBuilderContext(GROUP_NAME);
  const parent = React.useContext(GroupContext);
  const nestedGroup = React.useContext(NestedGroupContext);

  const group = nestedGroup ?? value;
  const template = { asChild, className, ...groupProps };
  const depth = parent ? parent.depth + 1 : 0;

  const groupContext = React.useMemo<GroupContextValue>(
    () => ({ group, depth, isRoot: !parent }),
    [group, depth, parent],
  );

  const GroupPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <GroupTemplateContext.Provider value={template}>
      <GroupContext.Provider value={groupContext}>
        <NestedGroupContext.Provider value={null}>
          <GroupPrimitive
            role="group"
            data-slot="query-builder-group"
            data-depth={depth}
            data-combinator={group.combinator}
            {...groupProps}
            className={cn("cn-query-builder-group flex", className)}
          />
        </NestedGroupContext.Provider>
      </GroupContext.Provider>
    </GroupTemplateContext.Provider>
  );
}

function QueryBuilderGroupHeader({
  asChild,
  className,
  ...headerProps
}: DivProps) {
  const { depth } = useGroupContext("QueryBuilderGroupHeader");
  const HeaderPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <HeaderPrimitive
      data-slot="query-builder-group-header"
      data-depth={depth}
      {...headerProps}
      className={cn(
        "cn-query-builder-group-header flex items-center",
        className,
      )}
    />
  );
}

const GROUP_TITLES: Record<QueryCombinator, string> = {
  and: "All of the following are true…",
  or: "Any of the following are true…",
};

function QueryBuilderGroupTitle({
  asChild,
  className,
  children,
  ...titleProps
}: DivProps) {
  const { group } = useGroupContext("QueryBuilderGroupTitle");
  const TitlePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <TitlePrimitive
      data-slot="query-builder-group-title"
      {...titleProps}
      className={cn("cn-query-builder-group-title", className)}
    >
      {children ?? GROUP_TITLES[group.combinator]}
    </TitlePrimitive>
  );
}

function QueryBuilderGroupFooter({
  asChild,
  className,
  ...footerProps
}: DivProps) {
  const { depth } = useGroupContext("QueryBuilderGroupFooter");
  const FooterPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <FooterPrimitive
      data-slot="query-builder-group-footer"
      data-depth={depth}
      {...footerProps}
      className={cn(
        "cn-query-builder-group-footer flex items-center",
        className,
      )}
    />
  );
}

function QueryBuilderGroupContent({
  asChild,
  className,
  ...contentProps
}: DivProps) {
  const { depth } = useGroupContext("QueryBuilderGroupContent");
  const ContentPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ContentPrimitive
      data-slot="query-builder-group-content"
      data-depth={depth}
      {...contentProps}
      className={cn(
        "cn-query-builder-group-content @container flex flex-col",
        className,
      )}
    />
  );
}

function QueryBuilderRules({
  asChild,
  className,
  children,
  ...rulesProps
}: DivProps) {
  const { group } = useGroupContext("QueryBuilderRules");
  const template = React.useContext(GroupTemplateContext);

  const RulesPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <RulesPrimitive
      role="list"
      data-slot="query-builder-rules"
      {...rulesProps}
      className={cn("cn-query-builder-rules flex flex-col", className)}
    >
      {group.rules.map((node, index) => (
        <NodeContext.Provider key={node.id} value={{ index, group }}>
          {getIsQueryGroup(node) ? (
            <NestedGroupContext.Provider value={node}>
              <QueryBuilderGroup {...template} />
            </NestedGroupContext.Provider>
          ) : (
            <RuleContext.Provider value={node}>{children}</RuleContext.Provider>
          )}
        </NodeContext.Provider>
      ))}
    </RulesPrimitive>
  );
}

function QueryBuilderRule({ asChild, className, ...ruleProps }: DivProps) {
  const rule = useRuleContext(RULE_NAME);

  const RulePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <RulePrimitive
      role="listitem"
      data-slot="query-builder-rule"
      data-operator={rule.operator}
      {...ruleProps}
      className={cn(
        "cn-query-builder-rule flex flex-wrap items-center",
        className,
      )}
    />
  );
}

const COMBINATOR_LABELS: Record<QueryCombinator, string> = {
  and: "All",
  or: "Any",
};

interface QueryBuilderCombinatorProps extends React.ComponentProps<
  typeof SelectTrigger
> {}

function QueryBuilderCombinator({
  className,
  ...triggerProps
}: QueryBuilderCombinatorProps) {
  const { disabled } = useQueryBuilderContext("QueryBuilderCombinator");
  const { group } = useGroupContext("QueryBuilderCombinator");
  const { update } = useQueryActions("QueryBuilderCombinator");

  return (
    <Select
      value={group.combinator}
      onValueChange={(combinator) =>
        update(group.id, (node) => ({
          ...node,
          combinator: combinator as QueryCombinator,
        }))
      }
      disabled={disabled}
    >
      <SelectTrigger
        size="sm"
        aria-label="Combinator"
        data-slot="query-builder-combinator"
        {...triggerProps}
        className={cn("cn-query-builder-combinator", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(["and", "or"] as const).map((combinator) => (
          <SelectItem key={combinator} value={combinator}>
            {COMBINATOR_LABELS[combinator]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const CONNECTOR_LABELS: Record<QueryCombinator, string> = {
  and: "And",
  or: "Or",
};

interface QueryBuilderConnectorProps extends React.ComponentProps<"div"> {}

function QueryBuilderConnector({
  className,
  ...connectorProps
}: QueryBuilderConnectorProps) {
  const { disabled } = useQueryBuilderContext("QueryBuilderConnector");
  const node = React.useContext(NodeContext);
  const { update } = useQueryActions("QueryBuilderConnector");

  if (!node) return null;

  const { index, group } = node;
  const target = group.rules[index];

  return (
    <div
      data-slot="query-builder-connector"
      data-type={target && getIsQueryGroup(target) ? "group" : "rule"}
      {...connectorProps}
      className={cn("cn-query-builder-connector flex items-center", className)}
    >
      {index === 1 ? (
        <Select
          value={group.combinator}
          onValueChange={(combinator) =>
            update(group.id, (item) => ({
              ...item,
              combinator: combinator as QueryCombinator,
            }))
          }
          disabled={disabled}
        >
          <SelectTrigger
            size="sm"
            aria-label="Combinator"
            className="cn-query-builder-connector-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["and", "or"] as const).map((combinator) => (
              <SelectItem key={combinator} value={combinator}>
                {CONNECTOR_LABELS[combinator]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="cn-query-builder-connector-label">
          {index === 0 ? "Where" : CONNECTOR_LABELS[group.combinator]}
        </span>
      )}
    </div>
  );
}

interface QueryBuilderFieldProps extends React.ComponentProps<typeof Button> {}

function QueryBuilderField({
  className,
  ...triggerProps
}: QueryBuilderFieldProps) {
  const { fields, disabled } = useQueryBuilderContext("QueryBuilderField");
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
        update(rule.id, () => ({ ...createQueryRule(field), id: rule.id }));
      }}
    >
      <FacetedTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={current ? `Field: ${current.label}` : "Field"}
          data-slot="query-builder-field"
          disabled={disabled}
          {...triggerProps}
          className={cn(
            "cn-query-builder-field cn-query-builder-select",
            className,
          )}
        >
          <FacetedValue>
            {([item]) => (
              <span
                className={cn(
                  "cn-query-builder-select-value",
                  !item && "text-muted-foreground",
                )}
              >
                {item ? item.label : "Field"}
              </span>
            )}
          </FacetedValue>
          <IconPlaceholder
            lucide="ChevronDownIcon"
            tabler="IconChevronDown"
            hugeicons="ArrowDown01Icon"
            phosphor="CaretDownIcon"
            remixicon="RiArrowDownSLine"
            className="cn-query-builder-select-icon"
          />
        </Button>
      </FacetedTrigger>
      <FacetedContent align="start">
        <FacetedInput placeholder="Search fields" />
        <FacetedList>
          <FacetedEmpty>No fields found.</FacetedEmpty>
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
  ...triggerProps
}: QueryBuilderOperatorProps) {
  const { fields, disabled } = useQueryBuilderContext("QueryBuilderOperator");
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
      <FacetedTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={`Operator: ${getQueryOperatorLabel(rule.operator, field.type)}`}
          data-slot="query-builder-operator"
          disabled={disabled}
          {...triggerProps}
          className={cn(
            "cn-query-builder-operator cn-query-builder-select",
            className,
          )}
        >
          <FacetedValue>
            {([item]) => (
              <span className="cn-query-builder-select-value">
                {item?.label}
              </span>
            )}
          </FacetedValue>
          <IconPlaceholder
            lucide="ChevronDownIcon"
            tabler="IconChevronDown"
            hugeicons="ArrowDown01Icon"
            phosphor="CaretDownIcon"
            remixicon="RiArrowDownSLine"
            className="cn-query-builder-select-icon"
          />
        </Button>
      </FacetedTrigger>
      <FacetedContent align="start">
        <FacetedInput placeholder="Search operators" />
        <FacetedList>
          <FacetedEmpty>No operators found.</FacetedEmpty>
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
  const [visibleCount, setVisibleCount] = React.useState(options.length);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    function measure() {
      if (!list) return;
      const widths = Array.from(
        list.querySelectorAll<HTMLElement>(
          "[data-slot=query-builder-value-item]",
        ),
        (item) => {
          const label = item.lastElementChild;
          if (!label) return item.getBoundingClientRect().width;
          return (
            item.getBoundingClientRect().width -
            label.getBoundingClientRect().width +
            label.scrollWidth
          );
        },
      );
      const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
      const available = list.getBoundingClientRect().width;
      const total = widths.reduce((sum, width) => sum + width + gap, -gap);
      if (total <= available) {
        setVisibleCount(widths.length);
        return;
      }
      const badge = list.querySelector("[data-slot=faceted-badge]");
      let used = badge?.getBoundingClientRect().width ?? 24;
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
          data-slot="query-builder-value-item"
          data-hidden={index >= visibleCount ? "" : undefined}
          data-separator={index < visibleCount - 1 ? "" : undefined}
          className="cn-query-builder-value-item"
        >
          <span className="cn-query-builder-value-label">{label}</span>
        </span>
      ))}
      {hiddenCount > 0 && (
        <FacetedBadge className="cn-query-builder-value-count">
          +{hiddenCount}
        </FacetedBadge>
      )}
    </span>
  );
}

interface QueryBuilderValueProps {
  className?: string;
}

function QueryBuilderValue({ className }: QueryBuilderValueProps) {
  const { fields, disabled } = useQueryBuilderContext("QueryBuilderValue");
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
          aria-label={`${field.label} from`}
          data-slot="query-builder-value"
          data-operator={rule.operator}
          value={start}
          onChange={(event) => onChange([event.target.value, end])}
          disabled={disabled}
          className={valueClassName}
        />
        <span className="cn-query-builder-value-separator">and</span>
        <Input
          type={inputType}
          aria-label={`${field.label} to`}
          data-slot="query-builder-value"
          data-operator={rule.operator}
          value={end}
          onChange={(event) => onChange([start, event.target.value])}
          disabled={disabled}
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
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ]
        : (field.options ?? []);
    const multiple = getIsQueryRuleMultiple(rule, field);
    const selected = options.filter((option) =>
      getSelectedValues(rule.value).includes(option.value),
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
        <FacetedTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            aria-label={`${field.label}: ${selectedLabels || "no value"}`}
            title={selected.length > 1 ? selectedLabels : undefined}
            data-slot="query-builder-value"
            data-operator={rule.operator}
            disabled={disabled}
            className={cn("cn-query-builder-select", valueClassName)}
          >
            <FacetedValue>
              {() => {
                if (selected.length > 0) {
                  return <QueryBuilderValueList options={selected} />;
                }
                return (
                  <span className="cn-query-builder-select-value text-muted-foreground">
                    {field.placeholder ??
                      (multiple ? "Select values" : "Select a value")}
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
              className="cn-query-builder-select-icon"
            />
          </Button>
        </FacetedTrigger>
        <FacetedContent align="start">
          <FacetedInput placeholder={`Search ${field.label.toLowerCase()}`} />
          <FacetedList>
            <FacetedEmpty>No results.</FacetedEmpty>
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
      placeholder={field.placeholder ?? "Enter a value"}
      value={typeof rule.value === "string" ? rule.value : ""}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      data-slot="query-builder-value"
      data-operator={rule.operator}
      className={valueClassName}
    />
  );
}

interface QueryBuilderAddRuleProps extends React.ComponentProps<
  typeof Button
> {}

function QueryBuilderAddRule({
  onClick,
  children,
  className,
  ...buttonProps
}: QueryBuilderAddRuleProps) {
  const { fields, disabled } = useQueryBuilderContext("QueryBuilderAddRule");
  const { group } = useGroupContext("QueryBuilderAddRule");
  const { add } = useQueryActions("QueryBuilderAddRule");
  const [field] = fields;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-slot="query-builder-add-rule"
      disabled={disabled || !field}
      {...buttonProps}
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
          Add rule
        </>
      )}
    </Button>
  );
}

interface QueryBuilderAddGroupProps extends React.ComponentProps<
  typeof Button
> {}

function QueryBuilderAddGroup({
  onClick,
  children,
  className,
  ...buttonProps
}: QueryBuilderAddGroupProps) {
  const { fields, disabled, maxDepth } = useQueryBuilderContext(
    "QueryBuilderAddGroup",
  );
  const { group, depth } = useGroupContext("QueryBuilderAddGroup");
  const { add } = useQueryActions("QueryBuilderAddGroup");
  const [field] = fields;

  if (depth >= maxDepth) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-slot="query-builder-add-group"
      disabled={disabled || !field}
      {...buttonProps}
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
          Add group
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
  ...buttonProps
}: QueryBuilderRemoveProps) {
  const { disabled } = useQueryBuilderContext("QueryBuilderRemove");
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
      aria-label={rule ? "Remove rule" : "Remove group"}
      data-slot="query-builder-remove"
      disabled={disabled}
      {...buttonProps}
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
  QueryBuilderOperator,
  QueryBuilderRemove,
  QueryBuilderRule,
  QueryBuilderRules,
  QueryBuilderValue,
};
