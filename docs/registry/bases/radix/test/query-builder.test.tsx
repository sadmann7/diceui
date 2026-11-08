import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
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

const titleField: QueryField = { value: "title", label: "Title", type: "text" };

function StatusIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} />;
}

function getStatusField(withIcons: boolean): QueryField {
  return {
    value: "status",
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
              <QueryBuilder.QueryBuilderRuleList>
                <QueryBuilder.QueryBuilderRule>
                  <QueryBuilder.QueryBuilderValue />
                </QueryBuilder.QueryBuilderRule>
              </QueryBuilder.QueryBuilderRuleList>
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

  test.each([
    [["todo"], "todo"],
    [["todo", "done"], "2 selected"],
  ])(
    "shows a label or a count in the summary display (value: %j)",
    (value, text) => {
      render(
        <QueryBuilder.QueryBuilder
          fields={[getStatusField(true)]}
          value={{
            id: "root",
            combinator: "and",
            rules: [{ id: "1", field: "status", operator: "inArray", value }],
          }}
        >
          <QueryBuilder.QueryBuilderGroup>
            <QueryBuilder.QueryBuilderGroupContent>
              <QueryBuilder.QueryBuilderRuleList>
                <QueryBuilder.QueryBuilderRule>
                  <QueryBuilder.QueryBuilderValue display="summary" />
                </QueryBuilder.QueryBuilderRule>
              </QueryBuilder.QueryBuilderRuleList>
            </QueryBuilder.QueryBuilderGroupContent>
          </QueryBuilder.QueryBuilderGroup>
        </QueryBuilder.QueryBuilder>,
      );

      const trigger = screen.getByRole("button", {
        name: `Status: ${value.join(", ")}`,
      });
      expect(trigger.textContent).toBe(text);
      expect(
        trigger.querySelector("[data-slot=faceted-badge]"),
      ).not.toBeInTheDocument();
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
            <QueryBuilder.QueryBuilderRuleList>
              <QueryBuilder.QueryBuilderRule>
                <QueryBuilder.QueryBuilderField />
                <QueryBuilder.QueryBuilderOperator />
              </QueryBuilder.QueryBuilderRule>
            </QueryBuilder.QueryBuilderRuleList>
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

  test("keeps both changes when two happen in the same event", () => {
    const onValueChange = vi.fn();
    render(
      <QueryBuilder.QueryBuilder
        fields={[titleField]}
        onValueChange={onValueChange}
      >
        <QueryBuilder.QueryBuilderGroup>
          <QueryBuilder.QueryBuilderGroupContent>
            <QueryBuilder.QueryBuilderAddRule
              onClick={() =>
                screen.getByRole("button", { name: "Add group" }).click()
              }
            />
            <QueryBuilder.QueryBuilderAddGroup />
          </QueryBuilder.QueryBuilderGroupContent>
        </QueryBuilder.QueryBuilderGroup>
      </QueryBuilder.QueryBuilder>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));

    const query = onValueChange.mock.lastCall?.[0] as QueryGroup;
    expect(query.rules).toHaveLength(2);
  });

  test("keeps the root group's ref and id off nested groups", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <QueryBuilder.QueryBuilder
        fields={[titleField]}
        value={{
          id: "root",
          combinator: "and",
          rules: [{ id: "nested", combinator: "or", rules: [] }],
        }}
      >
        <QueryBuilder.QueryBuilderGroup ref={ref} id="root-group">
          <QueryBuilder.QueryBuilderGroupContent>
            <QueryBuilder.QueryBuilderRuleList />
          </QueryBuilder.QueryBuilderGroupContent>
        </QueryBuilder.QueryBuilderGroup>
      </QueryBuilder.QueryBuilder>,
    );

    const groups = document.querySelectorAll("[data-slot=query-builder-group]");
    expect(groups).toHaveLength(2);
    expect(ref.current).toBe(groups[0]);
    expect(document.querySelectorAll("#root-group")).toHaveLength(1);
    expect(groups[0]).toHaveAttribute("role", "group");
    expect(groups[1]).toHaveAttribute("role", "listitem");
  });

  test("adds a rule for the field passed to AddRule", () => {
    const onValueChange = vi.fn();
    render(
      <QueryBuilder.QueryBuilder
        fields={[titleField, getStatusField(false)]}
        onValueChange={onValueChange}
      >
        <QueryBuilder.QueryBuilderGroup>
          <QueryBuilder.QueryBuilderGroupContent>
            <QueryBuilder.QueryBuilderAddRule field="status" />
          </QueryBuilder.QueryBuilderGroupContent>
        </QueryBuilder.QueryBuilderGroup>
      </QueryBuilder.QueryBuilder>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));

    expect(getAddedGroup(onValueChange)).toMatchObject({ field: "status" });
  });

  test("toggles the group's not and describes it in the title", () => {
    function Controlled() {
      const [value, setValue] = React.useState<QueryGroup>({
        id: "root",
        combinator: "or",
        rules: [],
      });
      return (
        <QueryBuilder.QueryBuilder
          fields={[titleField]}
          value={value}
          onValueChange={setValue}
        >
          <QueryBuilder.QueryBuilderGroup>
            <QueryBuilder.QueryBuilderGroupTitle />
            <QueryBuilder.QueryBuilderNegate />
          </QueryBuilder.QueryBuilderGroup>
        </QueryBuilder.QueryBuilder>
      );
    }
    render(<Controlled />);

    const toggle = screen.getByRole("button", { name: "Not" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByText("Any of the following are true…"),
    ).toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText("None of the following are true…"),
    ).toBeInTheDocument();
    expect(
      document.querySelector("[data-slot=query-builder-group]"),
    ).toHaveAttribute("data-not");
  });

  test("uses the labels passed to the root", () => {
    render(
      <QueryBuilder.QueryBuilder
        fields={[titleField]}
        labels={{ where: "Où", addRule: "Ajouter", removeRule: "Supprimer" }}
        value={{
          id: "root",
          combinator: "and",
          rules: [{ id: "1", field: "title", operator: "iLike", value: "" }],
        }}
      >
        <QueryBuilder.QueryBuilderGroup>
          <QueryBuilder.QueryBuilderGroupContent>
            <QueryBuilder.QueryBuilderRuleList>
              <QueryBuilder.QueryBuilderRule>
                <QueryBuilder.QueryBuilderConnector />
                <QueryBuilder.QueryBuilderRemove />
              </QueryBuilder.QueryBuilderRule>
            </QueryBuilder.QueryBuilderRuleList>
            <QueryBuilder.QueryBuilderAddRule />
          </QueryBuilder.QueryBuilderGroupContent>
        </QueryBuilder.QueryBuilderGroup>
      </QueryBuilder.QueryBuilder>,
    );

    expect(screen.getByText("Où")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Supprimer" }),
    ).toBeInTheDocument();
  });

  test("falls back to the default for labels set to undefined", () => {
    render(
      <QueryBuilder.QueryBuilder
        fields={[titleField]}
        labels={{ where: undefined, addRule: "Ajouter" }}
        value={{
          id: "root",
          combinator: "and",
          rules: [{ id: "1", field: "title", operator: "iLike", value: "" }],
        }}
      >
        <QueryBuilder.QueryBuilderGroup>
          <QueryBuilder.QueryBuilderGroupContent>
            <QueryBuilder.QueryBuilderRuleList>
              <QueryBuilder.QueryBuilderRule>
                <QueryBuilder.QueryBuilderConnector />
              </QueryBuilder.QueryBuilderRule>
            </QueryBuilder.QueryBuilderRuleList>
            <QueryBuilder.QueryBuilderAddRule />
          </QueryBuilder.QueryBuilderGroupContent>
        </QueryBuilder.QueryBuilderGroup>
      </QueryBuilder.QueryBuilder>,
    );

    expect(screen.getByText("Where")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeInTheDocument();
  });

  test("uses operatorLabel for the operator picker", () => {
    render(
      <QueryBuilder.QueryBuilder
        fields={[titleField]}
        labels={{ operatorLabel: (operator) => `op:${operator}` }}
        value={{
          id: "root",
          combinator: "and",
          rules: [{ id: "1", field: "title", operator: "iLike", value: "" }],
        }}
      >
        <QueryBuilder.QueryBuilderGroup>
          <QueryBuilder.QueryBuilderGroupContent>
            <QueryBuilder.QueryBuilderRuleList>
              <QueryBuilder.QueryBuilderRule>
                <QueryBuilder.QueryBuilderOperator />
              </QueryBuilder.QueryBuilderRule>
            </QueryBuilder.QueryBuilderRuleList>
          </QueryBuilder.QueryBuilderGroupContent>
        </QueryBuilder.QueryBuilderGroup>
      </QueryBuilder.QueryBuilder>,
    );

    expect(
      screen.getByRole("button", { name: "Operator: op:iLike" }),
    ).toHaveTextContent("op:iLike");
  });

  test("passes HTML attributes to the value control", () => {
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
            <QueryBuilder.QueryBuilderRuleList>
              <QueryBuilder.QueryBuilderRule>
                <QueryBuilder.QueryBuilderValue
                  id="title-value"
                  aria-describedby="hint"
                />
              </QueryBuilder.QueryBuilderRule>
            </QueryBuilder.QueryBuilderRuleList>
          </QueryBuilder.QueryBuilderGroupContent>
        </QueryBuilder.QueryBuilderGroup>
      </QueryBuilder.QueryBuilder>,
    );

    const input = screen.getByRole("textbox", { name: "Title" });
    expect(input).toHaveAttribute("id", "title-value");
    expect(input).toHaveAttribute("aria-describedby", "hint");
  });

  test.each([
    [{ "aria-label": "Price" }],
    [{ "aria-labelledby": "price-label" }],
  ])("names both range inputs from %o", (labelProps) => {
    render(
      <QueryBuilder.QueryBuilder
        fields={[{ value: "estimate", label: "Estimate", type: "number" }]}
        value={{
          id: "root",
          combinator: "and",
          rules: [
            {
              id: "1",
              field: "estimate",
              operator: "isBetween",
              value: ["1", "5"],
            },
          ],
        }}
      >
        <span id="price-label">Price</span>
        <QueryBuilder.QueryBuilderGroup>
          <QueryBuilder.QueryBuilderGroupContent>
            <QueryBuilder.QueryBuilderRuleList>
              <QueryBuilder.QueryBuilderRule>
                <QueryBuilder.QueryBuilderValue {...labelProps} />
              </QueryBuilder.QueryBuilderRule>
            </QueryBuilder.QueryBuilderRuleList>
          </QueryBuilder.QueryBuilderGroupContent>
        </QueryBuilder.QueryBuilderGroup>
      </QueryBuilder.QueryBuilder>,
    );

    expect(screen.getByRole("spinbutton", { name: "Price from" })).toHaveValue(
      1,
    );
    expect(screen.getByRole("spinbutton", { name: "Price to" })).toHaveValue(5);
  });

  test.each([
    [false, true],
    [true, false],
  ])(
    "disables each part when the root is %s and the part is %s",
    (rootDisabled, partDisabled) => {
      render(
        <QueryBuilder.QueryBuilder
          fields={[titleField]}
          disabled={rootDisabled}
          value={{
            id: "root",
            combinator: "and",
            rules: [{ id: "1", field: "title", operator: "iLike", value: "" }],
          }}
        >
          <QueryBuilder.QueryBuilderGroup>
            <QueryBuilder.QueryBuilderGroupContent>
              <QueryBuilder.QueryBuilderNegate disabled={partDisabled} />
              <QueryBuilder.QueryBuilderRuleList>
                <QueryBuilder.QueryBuilderRule>
                  <QueryBuilder.QueryBuilderField disabled={partDisabled} />
                  <QueryBuilder.QueryBuilderOperator disabled={partDisabled} />
                  <QueryBuilder.QueryBuilderValue disabled={partDisabled} />
                  <QueryBuilder.QueryBuilderRemove disabled={partDisabled} />
                </QueryBuilder.QueryBuilderRule>
              </QueryBuilder.QueryBuilderRuleList>
              <QueryBuilder.QueryBuilderAddRule disabled={partDisabled} />
              <QueryBuilder.QueryBuilderAddGroup disabled={partDisabled} />
            </QueryBuilder.QueryBuilderGroupContent>
          </QueryBuilder.QueryBuilderGroup>
        </QueryBuilder.QueryBuilder>,
      );

      for (const slot of [
        "negate",
        "field",
        "operator",
        "value",
        "remove",
        "add-rule",
        "add-group",
      ]) {
        expect(
          document.querySelector(`[data-slot=query-builder-${slot}]`),
          slot,
        ).toBeDisabled();
      }
    },
  );

  test("passes each rule to function children", () => {
    render(
      <QueryBuilder.QueryBuilder
        fields={[titleField]}
        value={{
          id: "root",
          combinator: "and",
          rules: [
            { id: "a", field: "title", operator: "iLike", value: "" },
            { id: "b", field: "title", operator: "eq", value: "" },
          ],
        }}
      >
        <QueryBuilder.QueryBuilderGroup>
          <QueryBuilder.QueryBuilderRuleList>
            {(rule) => <QueryBuilder.QueryBuilderRule data-id={rule.id} />}
          </QueryBuilder.QueryBuilderRuleList>
        </QueryBuilder.QueryBuilderGroup>
      </QueryBuilder.QueryBuilder>,
    );

    const rules = document.querySelectorAll("[data-slot=query-builder-rule]");
    expect([...rules].map((rule) => rule.getAttribute("data-id"))).toEqual([
      "a",
      "b",
    ]);
  });

  test("passes nested groups to function children, keeping the root layout", () => {
    render(
      <QueryBuilder.QueryBuilder
        fields={[titleField]}
        value={{
          id: "root",
          combinator: "and",
          rules: [
            { id: "a", field: "title", operator: "iLike", value: "" },
            {
              id: "nested",
              combinator: "or",
              rules: [{ id: "b", field: "title", operator: "eq", value: "" }],
            },
          ],
        }}
      >
        <QueryBuilder.QueryBuilderGroup className="root-layout">
          {(group) => (
            <QueryBuilder.QueryBuilderRuleList data-group={group.id}>
              {(node) =>
                "rules" in node ? (
                  <div data-wrapper={node.id}>
                    <QueryBuilder.QueryBuilderGroup className="extra" />
                  </div>
                ) : (
                  <QueryBuilder.QueryBuilderRule data-id={node.id} />
                )
              }
            </QueryBuilder.QueryBuilderRuleList>
          )}
        </QueryBuilder.QueryBuilderGroup>
      </QueryBuilder.QueryBuilder>,
    );

    const nested = document.querySelector("[data-wrapper=nested] > *");
    expect(nested).toHaveAttribute("data-depth", "1");
    expect(nested).toHaveClass("root-layout", "extra");
    expect(
      nested?.querySelector("[data-group=nested] [data-id=b]"),
    ).toBeInTheDocument();
  });
});

const COMPOSABLE_PARTS = [
  "QueryBuilder",
  "QueryBuilderGroup",
  "QueryBuilderGroupContent",
  "QueryBuilderGroupHeader",
  "QueryBuilderGroupTitle",
  "QueryBuilderGroupFooter",
  "QueryBuilderRule",
  "QueryBuilderConnector",
] as const;

describe.each([
  ["base", BaseQueryBuilder],
  ["radix", RadixQueryBuilder],
] as const)("composition (%s)", (base, QueryBuilder) => {
  function Part({
    name,
    target,
    children,
    ...props
  }: {
    name: (typeof COMPOSABLE_PARTS)[number];
    target: string;
    children?: React.ReactNode;
  } & Record<string, unknown>) {
    const Component = QueryBuilder[name] as React.ComponentType<
      Record<string, unknown>
    >;
    if (name !== target) return <Component {...props}>{children}</Component>;
    return base === "base" ? (
      <Component {...props} render={<section />}>
        {children}
      </Component>
    ) : (
      <Component {...props} asChild>
        <section>{children}</section>
      </Component>
    );
  }

  test.each(COMPOSABLE_PARTS)("renders %s into the given element", (target) => {
    render(
      <Part
        name="QueryBuilder"
        target={target}
        fields={[titleField]}
        value={{
          id: "root",
          combinator: "and",
          rules: [{ id: "1", field: "title", operator: "iLike", value: "" }],
        }}
      >
        <Part name="QueryBuilderGroup" target={target}>
          <Part name="QueryBuilderGroupContent" target={target}>
            <Part name="QueryBuilderGroupHeader" target={target}>
              <Part name="QueryBuilderGroupTitle" target={target} />
            </Part>
            <QueryBuilder.QueryBuilderRuleList>
              <Part name="QueryBuilderRule" target={target}>
                <Part name="QueryBuilderConnector" target={target} />
              </Part>
            </QueryBuilder.QueryBuilderRuleList>
            <Part name="QueryBuilderGroupFooter" target={target} />
          </Part>
        </Part>
      </Part>,
    );

    const slot = target.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    const element = document.querySelector(`[data-slot=${slot}]`);
    expect(element?.tagName).toBe("SECTION");
    expect(screen.getByText("Where")).toBeInTheDocument();
    expect(
      screen.getByText("All of the following are true…"),
    ).toBeInTheDocument();
  });
});
