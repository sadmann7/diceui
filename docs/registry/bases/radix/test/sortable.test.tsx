import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import * as BaseKanban from "@/registry/bases/base/ui/kanban";
import * as BaseSortable from "@/registry/bases/base/ui/sortable";
import * as RadixKanban from "@/registry/bases/radix/ui/kanban";
import * as RadixSortable from "@/registry/bases/radix/ui/sortable";

afterEach(cleanup);

describe.each([
  ["base", BaseSortable],
  ["radix", RadixSortable],
])("Sortable (%s)", (_base, Sortable) => {
  test("points the handle at the item's id", () => {
    render(
      <Sortable.Sortable value={["a", "b"]} getItemValue={(item) => item}>
        <Sortable.SortableContent>
          <Sortable.SortableItem value="a" id="item-a">
            <Sortable.SortableItemHandle aria-label="Move a" />
          </Sortable.SortableItem>
          <Sortable.SortableItem value="b">
            <Sortable.SortableItemHandle aria-label="Move b" />
          </Sortable.SortableItem>
        </Sortable.SortableContent>
      </Sortable.Sortable>,
    );

    const [itemA, itemB] = document.querySelectorAll(
      "[data-slot=sortable-item]",
    );
    expect(itemA).toHaveAttribute("id", "item-a");
    expect(screen.getByLabelText("Move a")).toHaveAttribute(
      "aria-controls",
      "item-a",
    );
    expect(screen.getByLabelText("Move b")).toHaveAttribute(
      "aria-controls",
      itemB?.id,
    );
  });
});

describe.each([
  ["base", BaseKanban],
  ["radix", RadixKanban],
])("Kanban (%s)", (_base, Kanban) => {
  test("points the column and item handles at their ids", () => {
    render(
      <Kanban.Kanban value={{ todo: ["a"] }} getItemValue={(item) => item}>
        <Kanban.KanbanBoard>
          <Kanban.KanbanColumn value="todo" id="column-todo">
            <Kanban.KanbanColumnHandle aria-label="Move todo" />
            <Kanban.KanbanItem value="a" id="item-a">
              <Kanban.KanbanItemHandle aria-label="Move a" />
            </Kanban.KanbanItem>
          </Kanban.KanbanColumn>
        </Kanban.KanbanBoard>
      </Kanban.Kanban>,
    );

    expect(screen.getByLabelText("Move todo")).toHaveAttribute(
      "aria-controls",
      "column-todo",
    );
    expect(document.getElementById("column-todo")).toHaveAttribute(
      "data-slot",
      "kanban-column",
    );
    expect(screen.getByLabelText("Move a")).toHaveAttribute(
      "aria-controls",
      "item-a",
    );
    expect(document.getElementById("item-a")).toHaveAttribute(
      "data-slot",
      "kanban-item",
    );
  });
});
