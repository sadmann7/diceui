import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import type {
  QueryField,
  QueryGroup,
} from "@/registry/bases/radix/lib/query-builder";

import * as BaseQueryBuilder from "@/registry/bases/base/ui/query-builder";
import * as RadixQueryBuilder from "@/registry/bases/radix/ui/query-builder";

afterEach(cleanup);

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const titleField: QueryField = { name: "title", label: "Title", type: "text" };

function StatusIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} />;
}

function getStatusField(withIcons: boolean): QueryField {
  return {
    name: "status",
    label: "Status",
    type: "select",
    options: ["todo", "doing", "done"].map((value) => ({
      label: value,
      value,
      icon: withIcons ? StatusIcon : undefined,
    })),
  };
}

function getAddedGroup(onValueChange: ReturnType<typeof vi.fn>) {
  const query = onValueChange.mock.lastCall?.[0] as QueryGroup | undefined;
  return query?.rules.at(-1);
}

describe.each([
  ["base", BaseQueryBuilder],
  ["radix", RadixQueryBuilder],
])("QueryBuilder (%s)", (_base, QueryBuilder) => {
  test.each([
    ["and", "or"],
    ["or", "and"],
  ] as const)(
    "adds a nested group with the opposite of a %s group's combinator",
    (combinator, expected) => {
      const onValueChange = vi.fn();
      render(
        <QueryBuilder.QueryBuilder
          fields={[titleField]}
          value={{ id: "root", combinator, rules: [] }}
          onValueChange={onValueChange}
        >
          <QueryBuilder.QueryBuilderGroup>
            <QueryBuilder.QueryBuilderGroupContent>
              <QueryBuilder.QueryBuilderAddGroup />
            </QueryBuilder.QueryBuilderGroupContent>
          </QueryBuilder.QueryBuilderGroup>
        </QueryBuilder.QueryBuilder>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Add group" }));

      expect(getAddedGroup(onValueChange)).toMatchObject({
        combinator: expected,
        rules: [{ field: "title" }],
      });
    },
  );

  test.each([
    [false, [], "Select values"],
    [false, ["todo"], "todo"],
    [false, ["todo", "done"], "tododone"],
    [false, ["done", "todo"], "donetodo"],
    [true, ["todo", "done"], "tododone"],
  ])(
    "shows selected labels without icons (icons: %s, value: %j)",
    (withIcons, value, text) => {
      render(
        <QueryBuilder.QueryBuilder
          fields={[getStatusField(withIcons)]}
          value={{
            id: "root",
            combinator: "and",
            rules: [{ id: "1", field: "status", operator: "inArray", value }],
          }}
        >
          <QueryBuilder.QueryBuilderGroup>
            <QueryBuilder.QueryBuilderGroupContent>
              <QueryBuilder.QueryBuilderRules>
                <QueryBuilder.QueryBuilderRule>
                  <QueryBuilder.QueryBuilderValue />
                </QueryBuilder.QueryBuilderRule>
              </QueryBuilder.QueryBuilderRules>
            </QueryBuilder.QueryBuilderGroupContent>
          </QueryBuilder.QueryBuilderGroup>
        </QueryBuilder.QueryBuilder>,
      );

      const name = `Status: ${value.join(", ") || "no value"}`;
      const trigger = screen.getByRole("button", { name });
      expect(trigger.textContent).toBe(text);
      expect(trigger.querySelectorAll("svg")).toHaveLength(1);
    },
  );

  test("names the field and operator triggers with their current choice", () => {
    render(
      <QueryBuilder.QueryBuilder
        fields={[titleField]}
        value={{
          id: "root",
          combinator: "and",
          rules: [{ id: "1", field: "title", operator: "iLike", value: "" }],
        }}
      >
        <QueryBuilder.QueryBuilderGroup>
          <QueryBuilder.QueryBuilderGroupContent>
            <QueryBuilder.QueryBuilderRules>
              <QueryBuilder.QueryBuilderRule>
                <QueryBuilder.QueryBuilderField />
                <QueryBuilder.QueryBuilderOperator />
              </QueryBuilder.QueryBuilderRule>
            </QueryBuilder.QueryBuilderRules>
          </QueryBuilder.QueryBuilderGroupContent>
        </QueryBuilder.QueryBuilderGroup>
      </QueryBuilder.QueryBuilder>,
    );

    expect(
      screen.getByRole("button", { name: "Field: Title" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Operator: contains" }),
    ).toBeInTheDocument();
  });
});
