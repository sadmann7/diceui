import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import type {
  QueryField,
  QueryGroup,
} from "@/registry/bases/radix/lib/query-builder";

import * as BaseQueryBuilder from "@/registry/bases/base/ui/query-builder";
import * as RadixQueryBuilder from "@/registry/bases/radix/ui/query-builder";

afterEach(cleanup);

const titleField: QueryField = { name: "title", label: "Title", type: "text" };

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
});
