import { describe, expect, test } from "vitest";

import {
  addQueryNode,
  createQueryGroup,
  createQueryRule,
  formatQuery,
  matchesQuery,
  type QueryField,
  type QueryGroup,
  type QueryRule,
  removeQueryNode,
  setQueryRuleOperator,
  updateQueryNode,
} from "@/registry/bases/radix/lib/query-builder";

const titleField: QueryField = { name: "title", label: "Title", type: "text" };
const estimateField: QueryField = {
  name: "estimate",
  label: "Estimate",
  type: "number",
};
const createdAtField: QueryField = {
  name: "createdAt",
  label: "Created",
  type: "date",
  column: "tasks.created_at",
};
const archivedField: QueryField = {
  name: "archived",
  label: "Archived",
  type: "boolean",
};
const statusField: QueryField = {
  name: "status",
  label: "Status",
  type: "select",
  options: [
    { label: "Todo", value: "todo" },
    { label: "Done", value: "done" },
  ],
};

const fields = [
  titleField,
  estimateField,
  createdAtField,
  archivedField,
  statusField,
];

function rule(
  field: string,
  operator: QueryRule["operator"],
  value?: QueryRule["value"],
): QueryRule {
  return { id: `${field}-${operator}`, field, operator, value };
}

function group(
  combinator: QueryGroup["combinator"],
  rules: QueryGroup["rules"],
  not?: boolean,
): QueryGroup {
  return { id: `group-${combinator}-${rules.length}`, combinator, rules, not };
}

describe("formatQuery", () => {
  test("returns an empty clause for an empty query", () => {
    expect(formatQuery(group("and", []), fields)).toEqual({
      sql: "",
      params: [],
    });
  });

  test("skips rules that aren't filled in", () => {
    const query = group("and", [
      rule("title", "iLike", ""),
      rule("estimate", "gt", "abc"),
    ]);
    expect(formatQuery(query, fields)).toEqual({ sql: "", params: [] });
  });

  test("formats nested groups with parameters", () => {
    const query = group("and", [
      rule("status", "eq", "todo"),
      group("or", [
        rule("estimate", "gte", "5"),
        rule("archived", "eq", "false"),
      ]),
    ]);
    expect(formatQuery(query, fields)).toEqual({
      sql: `"status" = $1 AND ("estimate" >= $2 OR "archived" = $3)`,
      params: ["todo", 5, false],
    });
  });

  test("negates a group", () => {
    const query = group(
      "or",
      [rule("status", "eq", "todo"), rule("status", "eq", "done")],
      true,
    );
    expect(formatQuery(query, fields).sql).toBe(
      `NOT ("status" = $1 OR "status" = $2)`,
    );
  });

  test("uses each dialect's placeholders, quoting and case-insensitive match", () => {
    const query = group("and", [
      rule("title", "iLike", "bug"),
      rule("estimate", "lt", "3"),
    ]);
    expect(formatQuery(query, fields, { dialect: "postgres" })).toEqual({
      sql: `"title" ILIKE $1 ESCAPE '!' AND "estimate" < $2`,
      params: ["%bug%", 3],
    });
    expect(formatQuery(query, fields, { dialect: "mysql" })).toEqual({
      sql: "LOWER(`title`) LIKE LOWER(?) ESCAPE '!' AND `estimate` < ?",
      params: ["%bug%", 3],
    });
    expect(formatQuery(query, fields, { dialect: "sqlite" }).sql).toBe(
      `LOWER("title") LIKE LOWER(?) ESCAPE '!' AND "estimate" < ?`,
    );
  });

  test("escapes LIKE wildcards in values", () => {
    const query = group("and", [rule("title", "notILike", "50%_off!")]);
    expect(formatQuery(query, fields)).toEqual({
      sql: `"title" NOT ILIKE $1 ESCAPE '!'`,
      params: ["%50!%!_off!!%"],
    });
  });

  test("never puts values or unknown fields into the SQL text", () => {
    const query = group("and", [
      rule("title", "eq", "'; DROP TABLE tasks; --"),
      rule('title" = 1; --', "eq", "x"),
    ]);
    expect(formatQuery(query, fields)).toEqual({
      sql: `"title" = $1`,
      params: ["'; DROP TABLE tasks; --"],
    });
  });

  test("matches whole days and maps fields to columns", () => {
    const query = group("and", [rule("createdAt", "eq", "2026-10-18")]);
    expect(formatQuery(query, fields)).toEqual({
      sql: `("tasks"."created_at" >= $1 AND "tasks"."created_at" < $2)`,
      params: ["2026-10-18", "2026-10-19"],
    });
    const range = group("and", [
      rule("createdAt", "isBetween", ["2026-10-01", "2026-10-31"]),
    ]);
    expect(formatQuery(range, fields).params).toEqual([
      "2026-10-01",
      "2026-11-01",
    ]);
    const after = group("and", [rule("createdAt", "gt", "2026-12-31")]);
    expect(formatQuery(after, fields)).toEqual({
      sql: `"tasks"."created_at" >= $1`,
      params: ["2027-01-01"],
    });
  });

  test("formats ranges, lists and empty checks", () => {
    const query = group("and", [
      rule("estimate", "isBetween", ["1", ""]),
      rule("status", "inArray", ["todo", "done"]),
      rule("title", "isNotEmpty"),
      rule("estimate", "isEmpty"),
    ]);
    expect(formatQuery(query, fields)).toEqual({
      sql: `"estimate" >= $1 AND "status" IN ($2, $3) AND ("title" IS NOT NULL AND "title" <> '') AND "estimate" IS NULL`,
      params: [1, "todo", "done"],
    });
  });

  test("ignores operators the field doesn't allow", () => {
    const query = group("and", [rule("archived", "iLike", "true")]);
    expect(formatQuery(query, fields).sql).toBe("");
  });
});

describe("matchesQuery", () => {
  const rows = [
    {
      title: "Fix login bug",
      estimate: 3,
      createdAt: "2026-10-18T09:00:00",
      archived: false,
      status: "todo",
    },
    {
      title: "Write docs",
      estimate: 8,
      createdAt: "2026-09-01",
      archived: true,
      status: "done",
    },
    {
      title: "",
      estimate: null,
      createdAt: "2026-10-20",
      archived: false,
      status: "todo",
    },
  ];

  function filter(query: QueryGroup) {
    return rows
      .filter((row) => matchesQuery(row, query, fields))
      .map((row) => row.title);
  }

  test("matches everything when no rule is filled in", () => {
    expect(filter(group("and", [rule("title", "iLike", "")]))).toHaveLength(3);
  });

  test("agrees with the SQL semantics for nested groups", () => {
    const query = group("and", [
      rule("status", "eq", "todo"),
      group("or", [rule("title", "iLike", "BUG"), rule("estimate", "isEmpty")]),
    ]);
    expect(filter(query)).toEqual(["Fix login bug", ""]);
  });

  test("matches dates by day and ranges with one side open", () => {
    expect(
      filter(group("and", [rule("createdAt", "eq", "2026-10-18")])),
    ).toEqual(["Fix login bug"]);
    expect(
      filter(
        group("and", [rule("createdAt", "isBetween", ["2026-10-01", ""])]),
      ),
    ).toEqual(["Fix login bug", ""]);
    expect(
      filter(group("and", [rule("estimate", "isBetween", ["", "5"])])),
    ).toEqual(["Fix login bug"]);
  });

  test("handles booleans, lists and negated groups", () => {
    expect(filter(group("and", [rule("archived", "eq", "true")]))).toEqual([
      "Write docs",
    ]);
    expect(
      filter(group("and", [rule("status", "notInArray", ["done"])])),
    ).toEqual(["Fix login bug", ""]);
    expect(filter(group("and", [rule("status", "eq", "todo")], true))).toEqual([
      "Write docs",
    ]);
  });
});

describe("query tree helpers", () => {
  test("add, update and remove nodes without mutating", () => {
    const root = createQueryGroup();
    const child = createQueryGroup("or");
    const titleRule = createQueryRule(titleField);

    const withChild = addQueryNode(root, root.id, child);
    const withRule = addQueryNode(withChild, child.id, titleRule);
    expect(root.rules).toHaveLength(0);
    expect((withRule.rules[0] as QueryGroup).rules).toEqual([titleRule]);

    const updated = updateQueryNode(withRule, titleRule.id, (node) => ({
      ...node,
      value: "bug",
    }));
    expect(((updated.rules[0] as QueryGroup).rules[0] as QueryRule).value).toBe(
      "bug",
    );
    expect(updateQueryNode(updated, "missing", (node) => node)).toBe(updated);

    expect(
      (removeQueryNode(updated, titleRule.id).rules[0] as QueryGroup).rules,
    ).toEqual([]);
  });

  test("new rules start with the field's first operator and an empty value", () => {
    expect(createQueryRule(titleField)).toMatchObject({
      field: "title",
      operator: "iLike",
      value: "",
    });
    expect(createQueryRule(archivedField)).toMatchObject({
      field: "archived",
      operator: "eq",
      value: "true",
    });
  });
});

describe("setQueryRuleOperator", () => {
  test("keeps a value between operators of the same shape", () => {
    expect(
      setQueryRuleOperator(rule("estimate", "gt", "5"), estimateField, "lte"),
    ).toMatchObject({ operator: "lte", value: "5" });
    expect(
      setQueryRuleOperator(
        rule("status", "inArray", ["todo", "done"]),
        statusField,
        "notInArray",
      ),
    ).toMatchObject({ operator: "notInArray", value: ["todo", "done"] });
  });

  test("wraps a single value when switching to a list operator", () => {
    expect(
      setQueryRuleOperator(
        rule("status", "eq", "todo"),
        statusField,
        "inArray",
      ),
    ).toMatchObject({ operator: "inArray", value: ["todo"] });
    expect(
      setQueryRuleOperator(rule("status", "eq", ""), statusField, "notInArray"),
    ).toMatchObject({ operator: "notInArray", value: [] });
  });

  test("keeps the first value when switching to a single-value operator", () => {
    expect(
      setQueryRuleOperator(
        rule("status", "inArray", ["todo", "done"]),
        statusField,
        "ne",
      ),
    ).toMatchObject({ operator: "ne", value: "todo" });
    expect(
      setQueryRuleOperator(rule("status", "inArray", []), statusField, "eq"),
    ).toMatchObject({ operator: "eq", value: "" });
  });

  test("resets the value for ranges and empty checks", () => {
    expect(
      setQueryRuleOperator(
        rule("estimate", "gt", "5"),
        estimateField,
        "isBetween",
      ),
    ).toMatchObject({ operator: "isBetween", value: ["", ""] });
    expect(
      setQueryRuleOperator(
        rule("estimate", "isBetween", ["3", "8"]),
        estimateField,
        "gt",
      ),
    ).toMatchObject({ operator: "gt", value: "" });
    expect(
      setQueryRuleOperator(
        rule("title", "iLike", "bug"),
        titleField,
        "isEmpty",
      ),
    ).toMatchObject({ operator: "isEmpty", value: undefined });
  });
});
