export type QueryFieldType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "multiSelect";

export type QueryOperator =
  | "iLike"
  | "notILike"
  | "eq"
  | "ne"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "isBetween"
  | "inArray"
  | "notInArray"
  | "isEmpty"
  | "isNotEmpty";

export type QueryCombinator = "and" | "or";

export type QueryValue = string | string[];

export interface QueryFieldOption {
  label: string;
  value: string;
}

export interface QueryField {
  name: string;
  label: string;
  type: QueryFieldType;
  /** The SQL column, like `created_at` or `tasks.title`. Defaults to `name`. */
  column?: string;
  operators?: QueryOperator[];
  options?: QueryFieldOption[];
  placeholder?: string;
}

export interface QueryRule {
  id: string;
  field: string;
  operator: QueryOperator;
  value?: QueryValue;
}

export interface QueryGroup {
  id: string;
  combinator: QueryCombinator;
  not?: boolean;
  rules: QueryNode[];
}

export type QueryNode = QueryRule | QueryGroup;

export const QUERY_OPERATORS: Record<QueryFieldType, QueryOperator[]> = {
  text: ["iLike", "notILike", "eq", "ne", "isEmpty", "isNotEmpty"],
  number: [
    "eq",
    "ne",
    "lt",
    "lte",
    "gt",
    "gte",
    "isBetween",
    "isEmpty",
    "isNotEmpty",
  ],
  date: [
    "eq",
    "ne",
    "lt",
    "gt",
    "lte",
    "gte",
    "isBetween",
    "isEmpty",
    "isNotEmpty",
  ],
  boolean: ["eq", "ne"],
  select: ["eq", "ne", "inArray", "notInArray", "isEmpty", "isNotEmpty"],
  multiSelect: ["inArray", "notInArray", "isEmpty", "isNotEmpty"],
};

const OPERATOR_LABELS: Record<QueryOperator, string> = {
  iLike: "contains",
  notILike: "does not contain",
  eq: "is",
  ne: "is not",
  lt: "is less than",
  lte: "is at most",
  gt: "is greater than",
  gte: "is at least",
  isBetween: "is between",
  inArray: "is any of",
  notInArray: "is none of",
  isEmpty: "is empty",
  isNotEmpty: "is not empty",
};

const DATE_OPERATOR_LABELS: Partial<Record<QueryOperator, string>> = {
  lt: "is before",
  lte: "is on or before",
  gt: "is after",
  gte: "is on or after",
};

export function getQueryOperators(field: QueryField): QueryOperator[] {
  return field.operators ?? QUERY_OPERATORS[field.type];
}

export function getQueryOperatorLabel(
  operator: QueryOperator,
  type?: QueryFieldType,
): string {
  return (
    (type === "date" ? DATE_OPERATOR_LABELS[operator] : undefined) ??
    OPERATOR_LABELS[operator]
  );
}

export function getIsQueryGroup(node: QueryNode): node is QueryGroup {
  return "rules" in node;
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function createQueryRule(field: QueryField): QueryRule {
  const operator = getQueryOperators(field)[0] ?? "eq";
  return {
    id: createId(),
    field: field.name,
    operator,
    value: getDefaultQueryValue(field, operator),
  };
}

export function createQueryGroup(
  combinator: QueryCombinator = "and",
  rules: QueryNode[] = [],
): QueryGroup {
  return { id: createId(), combinator, rules };
}

export function getDefaultQueryValue(
  field: QueryField,
  operator: QueryOperator,
): QueryValue | undefined {
  if (operator === "isEmpty" || operator === "isNotEmpty") return undefined;
  if (operator === "isBetween") return ["", ""];
  if (operator === "inArray" || operator === "notInArray") return [];
  if (field.type === "boolean") return "true";
  return "";
}

const ARRAY_OPERATORS: QueryOperator[] = ["isBetween", "inArray", "notInArray"];

function getIsValueKept(rule: QueryRule, operator: QueryOperator) {
  const needsValue = operator !== "isEmpty" && operator !== "isNotEmpty";
  return (
    needsValue &&
    rule.value !== undefined &&
    ARRAY_OPERATORS.includes(rule.operator) ===
      ARRAY_OPERATORS.includes(operator) &&
    (rule.operator === "isBetween") === (operator === "isBetween")
  );
}

export function setQueryRuleOperator(
  rule: QueryRule,
  field: QueryField,
  operator: QueryOperator,
): QueryRule {
  return {
    ...rule,
    operator,
    value: getIsValueKept(rule, operator)
      ? rule.value
      : getDefaultQueryValue(field, operator),
  };
}

export function updateQueryNode(
  root: QueryGroup,
  id: string,
  updater: (node: QueryNode) => QueryNode,
): QueryGroup {
  if (root.id === id) {
    const next = updater(root);
    return getIsQueryGroup(next) ? next : root;
  }
  let changed = false;
  const rules = root.rules.map((node) => {
    const next = getIsQueryGroup(node)
      ? updateQueryNode(node, id, updater)
      : node.id === id
        ? updater(node)
        : node;
    if (next !== node) changed = true;
    return next;
  });
  return changed ? { ...root, rules } : root;
}

export function removeQueryNode(root: QueryGroup, id: string): QueryGroup {
  let changed = false;
  const rules: QueryNode[] = [];
  for (const node of root.rules) {
    if (node.id === id) {
      changed = true;
      continue;
    }
    const next = getIsQueryGroup(node) ? removeQueryNode(node, id) : node;
    if (next !== node) changed = true;
    rules.push(next);
  }
  return changed ? { ...root, rules } : root;
}

export function addQueryNode(
  root: QueryGroup,
  groupId: string,
  node: QueryNode,
): QueryGroup {
  return updateQueryNode(root, groupId, (group) =>
    getIsQueryGroup(group)
      ? { ...group, rules: [...group.rules, node] }
      : group,
  );
}

function getField(fields: QueryField[], name: string) {
  return fields.find((field) => field.name === name);
}

function getIsFilled(value: unknown) {
  return typeof value === "string" && value.trim() !== "";
}

export function getIsQueryRuleActive(rule: QueryRule, field?: QueryField) {
  if (!field || !getQueryOperators(field).includes(rule.operator)) {
    return false;
  }
  const { operator, value } = rule;
  if (operator === "isEmpty" || operator === "isNotEmpty") return true;
  if (operator === "isBetween") {
    return (
      Array.isArray(value) && (getIsFilled(value[0]) || getIsFilled(value[1]))
    );
  }
  if (operator === "inArray" || operator === "notInArray") {
    return Array.isArray(value) && value.length > 0;
  }
  if (field.type === "number" && typeof value === "string") {
    return getIsFilled(value) && Number.isFinite(Number(value));
  }
  return getIsFilled(value);
}

function getDateKey(value: unknown): string | undefined {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined;
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${value.getFullYear()}-${month}-${day}`;
  }
  if (typeof value === "number") return getDateKey(new Date(value));
  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : getDateKey(new Date(value));
  }
  return undefined;
}

function getNextDateKey(key: string) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function getCellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value as string | number | boolean | bigint);
}

function getIsEmptyCell(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

function compare<T>(left: T, operator: QueryOperator, right: T) {
  switch (operator) {
    case "eq":
      return left === right;
    case "ne":
      return left !== right;
    case "lt":
      return left < right;
    case "lte":
      return left <= right;
    case "gt":
      return left > right;
    case "gte":
      return left >= right;
    default:
      return false;
  }
}

function matchesRule(cell: unknown, rule: QueryRule, field: QueryField) {
  const { operator, value } = rule;

  if (operator === "isEmpty") return getIsEmptyCell(cell);
  if (operator === "isNotEmpty") return !getIsEmptyCell(cell);

  if (operator === "inArray" || operator === "notInArray") {
    const values = Array.isArray(value) ? value : [];
    const cells = Array.isArray(cell)
      ? cell.map(getCellText)
      : [getCellText(cell)];
    const hasAny = cells.some((item) => values.includes(item));
    return operator === "inArray" ? hasAny : !hasAny;
  }

  if (field.type === "number") {
    const number = typeof cell === "number" ? cell : Number(cell);
    if (getIsEmptyCell(cell) || Number.isNaN(number)) return false;
    if (operator === "isBetween" && Array.isArray(value)) {
      const [min, max] = value;
      return (
        (!getIsFilled(min) || number >= Number(min)) &&
        (!getIsFilled(max) || number <= Number(max))
      );
    }
    return compare(number, operator, Number(value));
  }

  if (field.type === "date") {
    const key = getDateKey(cell);
    if (!key) return false;
    if (operator === "isBetween" && Array.isArray(value)) {
      const [start, end] = value;
      return (
        (!getIsFilled(start) || key >= (start as string)) &&
        (!getIsFilled(end) || key <= (end as string))
      );
    }
    return compare(key, operator, String(value));
  }

  const text = getCellText(cell);
  if (operator === "iLike" || operator === "notILike") {
    const contains = text.toLowerCase().includes(String(value).toLowerCase());
    return operator === "iLike" ? contains : !contains;
  }
  return compare(text, operator, String(value));
}

function matchesGroup(
  row: Record<string, unknown>,
  group: QueryGroup,
  fields: QueryField[],
): boolean | undefined {
  const results: boolean[] = [];
  for (const node of group.rules) {
    if (getIsQueryGroup(node)) {
      const result = matchesGroup(row, node, fields);
      if (result !== undefined) results.push(result);
      continue;
    }
    const field = getField(fields, node.field);
    if (!field || !getIsQueryRuleActive(node, field)) continue;
    results.push(matchesRule(row[field.name], node, field));
  }
  if (results.length === 0) return undefined;
  const matches =
    group.combinator === "and" ? results.every(Boolean) : results.some(Boolean);
  return group.not ? !matches : matches;
}

// Rules that aren't filled in yet are skipped, so an empty query matches everything.
export function matchesQuery(
  row: Record<string, unknown>,
  query: QueryGroup,
  fields: QueryField[],
): boolean {
  return matchesGroup(row, query, fields) ?? true;
}

export type SqlDialect = "postgres" | "mysql" | "sqlite";

export interface FormatQueryOptions {
  dialect?: SqlDialect;
}

export interface FormattedQuery {
  sql: string;
  params: unknown[];
}

function quoteIdentifier(identifier: string, dialect: SqlDialect) {
  const quote = dialect === "mysql" ? "`" : '"';
  return identifier
    .split(".")
    .map((part) => `${quote}${part.replaceAll(quote, quote + quote)}${quote}`)
    .join(".");
}

// `!` escapes LIKE wildcards in every dialect, unlike `\`.
function escapeLike(value: string) {
  return value.replace(/[!%_]/g, "!$&");
}

function formatRule(
  rule: QueryRule,
  field: QueryField,
  dialect: SqlDialect,
  addParam: (value: unknown) => string,
): string | undefined {
  const column = quoteIdentifier(field.column ?? field.name, dialect);
  const { operator, value } = rule;

  if (operator === "isEmpty" || operator === "isNotEmpty") {
    const isText = field.type === "text" || field.type === "select";
    if (operator === "isEmpty") {
      return isText
        ? `(${column} IS NULL OR ${column} = '')`
        : `${column} IS NULL`;
    }
    return isText
      ? `(${column} IS NOT NULL AND ${column} <> '')`
      : `${column} IS NOT NULL`;
  }

  if (operator === "inArray" || operator === "notInArray") {
    const values = Array.isArray(value) ? value : [];
    const list = values.map((item) => addParam(item)).join(", ");
    return `${column} ${operator === "inArray" ? "IN" : "NOT IN"} (${list})`;
  }

  if (operator === "iLike" || operator === "notILike") {
    const pattern = addParam(`%${escapeLike(String(value))}%`);
    const negate = operator === "notILike" ? "NOT " : "";
    return dialect === "postgres"
      ? `${column} ${negate}ILIKE ${pattern} ESCAPE '!'`
      : `LOWER(${column}) ${negate}LIKE LOWER(${pattern}) ESCAPE '!'`;
  }

  if (field.type === "date") {
    if (operator === "isBetween" && Array.isArray(value)) {
      const [start, end] = value;
      const parts = [
        getIsFilled(start) ? `${column} >= ${addParam(start)}` : undefined,
        getIsFilled(end)
          ? `${column} < ${addParam(getNextDateKey(end as string))}`
          : undefined,
      ].filter(Boolean);
      return parts.length > 1 ? `(${parts.join(" AND ")})` : parts[0];
    }
    // A date matches the whole day, from its start to the next day's start.
    const day = String(value);
    const nextDay = getNextDateKey(day);
    switch (operator) {
      case "eq":
        return `(${column} >= ${addParam(day)} AND ${column} < ${addParam(nextDay)})`;
      case "ne":
        return `(${column} < ${addParam(day)} OR ${column} >= ${addParam(nextDay)})`;
      case "lt":
        return `${column} < ${addParam(day)}`;
      case "lte":
        return `${column} < ${addParam(nextDay)}`;
      case "gt":
        return `${column} >= ${addParam(nextDay)}`;
      case "gte":
        return `${column} >= ${addParam(day)}`;
      default:
        return undefined;
    }
  }

  const toParam = (input: unknown) => {
    if (field.type === "number") return Number(input);
    if (field.type === "boolean") return input === "true";
    return input;
  };

  if (operator === "isBetween" && Array.isArray(value)) {
    const [min, max] = value;
    const parts = [
      getIsFilled(min) ? `${column} >= ${addParam(toParam(min))}` : undefined,
      getIsFilled(max) ? `${column} <= ${addParam(toParam(max))}` : undefined,
    ].filter(Boolean);
    return parts.length > 1 ? `(${parts.join(" AND ")})` : parts[0];
  }

  const symbols: Partial<Record<QueryOperator, string>> = {
    eq: "=",
    ne: "<>",
    lt: "<",
    lte: "<=",
    gt: ">",
    gte: ">=",
  };
  const symbol = symbols[operator];
  return symbol ? `${column} ${symbol} ${addParam(toParam(value))}` : undefined;
}

function formatGroup(
  group: QueryGroup,
  fields: QueryField[],
  dialect: SqlDialect,
  addParam: (value: unknown) => string,
): string | undefined {
  const parts: string[] = [];
  for (const node of group.rules) {
    if (getIsQueryGroup(node)) {
      const part = formatGroup(node, fields, dialect, addParam);
      if (part) parts.push(`(${part})`);
      continue;
    }
    const field = getField(fields, node.field);
    if (!field || !getIsQueryRuleActive(node, field)) continue;
    const part = formatRule(node, field, dialect, addParam);
    if (part) parts.push(part);
  }
  if (parts.length === 0) return undefined;
  const sql = parts.join(group.combinator === "and" ? " AND " : " OR ");
  return group.not ? `NOT (${sql})` : sql;
}

// Columns only come from `fields`, so column names never come from user input.
export function formatQuery(
  query: QueryGroup,
  fields: QueryField[],
  options: FormatQueryOptions = {},
): FormattedQuery {
  const { dialect = "postgres" } = options;
  const params: unknown[] = [];
  const addParam = (value: unknown) => {
    params.push(value);
    return dialect === "postgres" ? `$${params.length}` : "?";
  };
  const sql = formatGroup(query, fields, dialect, addParam) ?? "";
  return { sql, params };
}
