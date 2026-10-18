"use client";

import { cn } from "cn";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";

import {
  addQueryNode,
  createQueryGroup,
  createQueryRule,
  getDefaultQueryValue,
  getQueryOperatorLabel,
  getQueryOperators,
  getIsQueryGroup,
  type QueryCombinator,
  type QueryField,
  type QueryGroup,
  type QueryNode,
  type QueryOperator,
  type QueryRule,
  type QueryValue,
  removeQueryNode,
  updateQueryNode,
} from "@/registry/bases/radix/lib/query-builder";
import { Button } from "@/registry/bases/radix/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/registry/bases/radix/ui/dropdown-menu";
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

// A rule's or nested group's place in the group that holds it.
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
  const HeaderPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <HeaderPrimitive
      data-slot="query-builder-group-header"
      {...headerProps}
      className={cn(
        "cn-query-builder-group-header flex flex-wrap items-center",
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

// "Where" before the first rule, the group's combinator before the second, and
// its label before the rest. Renders nothing in the root group's own header.
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

interface QueryBuilderFieldProps extends React.ComponentProps<
  typeof SelectTrigger
> {}

function QueryBuilderField({
  className,
  ...triggerProps
}: QueryBuilderFieldProps) {
  const { fields, disabled } = useQueryBuilderContext("QueryBuilderField");
  const rule = useRuleContext("QueryBuilderField");
  const { update } = useQueryActions("QueryBuilderField");

  return (
    <Select
      value={rule.field}
      onValueChange={(name) => {
        const field = fields.find((item) => item.name === name);
        if (!field) return;
        update(rule.id, () => ({ ...createQueryRule(field), id: rule.id }));
      }}
      disabled={disabled}
    >
      <SelectTrigger
        size="sm"
        aria-label="Field"
        data-slot="query-builder-field"
        {...triggerProps}
        className={cn("cn-query-builder-field", className)}
      >
        <SelectValue placeholder="Field" />
      </SelectTrigger>
      <SelectContent>
        {fields.map((field) => (
          <SelectItem key={field.name} value={field.name}>
            {field.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface QueryBuilderOperatorProps extends React.ComponentProps<
  typeof SelectTrigger
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

  return (
    <Select
      value={rule.operator}
      onValueChange={(next) => {
        const operator = next as QueryOperator;
        update(rule.id, (node) => ({
          ...node,
          operator,
          value: keepValue(node as QueryRule, operator)
            ? (node as QueryRule).value
            : getDefaultQueryValue(field, operator),
        }));
      }}
      disabled={disabled}
    >
      <SelectTrigger
        size="sm"
        aria-label="Operator"
        data-slot="query-builder-operator"
        {...triggerProps}
        className={cn("cn-query-builder-operator", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {getQueryOperators(field).map((operator) => (
          <SelectItem key={operator} value={operator}>
            {getQueryOperatorLabel(operator, field.type)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const ARRAY_OPERATORS: QueryOperator[] = ["isBetween", "inArray", "notInArray"];

// Switching between operators that take the same kind of value keeps it.
function keepValue(rule: QueryRule, operator: QueryOperator) {
  const wasArray = ARRAY_OPERATORS.includes(rule.operator);
  const isArray = ARRAY_OPERATORS.includes(operator);
  const needsValue = operator !== "isEmpty" && operator !== "isNotEmpty";
  return (
    needsValue &&
    rule.value !== undefined &&
    wasArray === isArray &&
    (rule.operator === "isBetween") === (operator === "isBetween")
  );
}

interface QueryBuilderValueProps extends React.ComponentProps<"div"> {}

function QueryBuilderValue({
  className,
  ...valueProps
}: QueryBuilderValueProps) {
  const { fields, disabled } = useQueryBuilderContext("QueryBuilderValue");
  const rule = useRuleContext("QueryBuilderValue");
  const { update } = useQueryActions("QueryBuilderValue");
  const field = fields.find((item) => item.name === rule.field);

  if (!field || rule.operator === "isEmpty" || rule.operator === "isNotEmpty") {
    return null;
  }

  const onChange = (value: QueryValue) =>
    update(rule.id, (node) => ({ ...node, value }));

  const inputType =
    field.type === "number"
      ? "number"
      : field.type === "date"
        ? "date"
        : "text";

  let control: React.ReactNode;

  if (rule.operator === "isBetween") {
    const [start = "", end = ""] = Array.isArray(rule.value) ? rule.value : [];
    control = (
      <>
        <Input
          type={inputType}
          aria-label={`${field.label} from`}
          value={start}
          onChange={(event) => onChange([event.target.value, end])}
          disabled={disabled}
          className="cn-query-builder-input"
        />
        <span className="cn-query-builder-value-separator">and</span>
        <Input
          type={inputType}
          aria-label={`${field.label} to`}
          value={end}
          onChange={(event) => onChange([start, event.target.value])}
          disabled={disabled}
          className="cn-query-builder-input"
        />
      </>
    );
  } else if (rule.operator === "inArray" || rule.operator === "notInArray") {
    const selected = Array.isArray(rule.value) ? rule.value : [];
    const labels = (field.options ?? [])
      .filter((option) => selected.includes(option.value))
      .map((option) => option.label);
    control = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            aria-label={field.label}
            disabled={disabled}
            className="cn-query-builder-multi-select"
          >
            <span className="truncate">
              {labels.length > 0
                ? labels.join(", ")
                : (field.placeholder ?? "Select values")}
            </span>
            <IconPlaceholder
              lucide="ChevronDownIcon"
              tabler="IconChevronDown"
              hugeicons="ArrowDown01Icon"
              phosphor="CaretDownIcon"
              remixicon="RiArrowDownSLine"
              className="cn-query-builder-multi-select-icon"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {(field.options ?? []).map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.includes(option.value)}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...selected, option.value]
                    : selected.filter((item) => item !== option.value),
                )
              }
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else if (
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
    control = (
      <Select
        value={typeof rule.value === "string" ? rule.value : ""}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger
          size="sm"
          aria-label={field.label}
          className="cn-query-builder-select"
        >
          <SelectValue placeholder={field.placeholder ?? "Select a value"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  } else {
    control = (
      <Input
        type={inputType}
        aria-label={field.label}
        placeholder={field.placeholder ?? "Enter a value"}
        value={typeof rule.value === "string" ? rule.value : ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="cn-query-builder-input"
      />
    );
  }

  return (
    <div
      data-slot="query-builder-value"
      data-operator={rule.operator}
      {...valueProps}
      className={cn("cn-query-builder-value flex items-center", className)}
    >
      {control}
    </div>
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
        add(group.id, createQueryGroup("and", [createQueryRule(field)]));
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

  // Outside a rule it removes the group, and the root group can't be removed.
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
          lucide="XIcon"
          tabler="IconX"
          hugeicons="Cancel01Icon"
          phosphor="XIcon"
          remixicon="RiCloseLine"
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
  QueryBuilderGroupHeader,
  QueryBuilderOperator,
  QueryBuilderRemove,
  QueryBuilderRule,
  QueryBuilderRules,
  QueryBuilderValue,
};
