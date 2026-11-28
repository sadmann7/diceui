import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import * as BaseKanban from "@/registry/bases/base/ui/kanban";
import * as RadixKanban from "@/registry/bases/radix/ui/kanban";

const COLUMN_WIDTH = 200;
const COLUMN_GAP = 40;
const ROW_HEIGHT = 40;

function getRect(element: Element) {
  const board = element.closest("[data-slot=kanban-board]");
  const column = element.closest("[data-slot=kanban-column]");
  const item = element.closest("[data-slot=kanban-item]");
  if (!board || !column) return DOMRect.fromRect();

  const columns = [...board.querySelectorAll("[data-slot=kanban-column]")];
  const x = columns.indexOf(column) * (COLUMN_WIDTH + COLUMN_GAP);

  if (item) {
    const items = [...column.querySelectorAll("[data-slot=kanban-item]")];
    return DOMRect.fromRect({
      x,
      y: (items.indexOf(item) + 1) * ROW_HEIGHT,
      width: COLUMN_WIDTH,
      height: ROW_HEIGHT,
    });
  }

  return DOMRect.fromRect({ x, width: COLUMN_WIDTH, height: 400 });
}

beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      return getRect(this);
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function pressKey(element: Element, key: string, code = key) {
  await act(async () => {
    fireEvent.keyDown(element, { key, code });
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

describe.each([
  ["base", BaseKanban],
  ["radix", RadixKanban],
])("Kanban (%s)", (_base, Kanban) => {
  test("reorders columns with numeric keys", async () => {
    const onMove = vi.fn();

    render(
      <Kanban.Kanban
        value={{ 1: ["a"], 2: ["b"] }}
        getItemValue={(item) => item}
        onMove={onMove}
      >
        <Kanban.KanbanBoard>
          {[1, 2].map((column) => (
            <Kanban.KanbanColumn key={column} value={column}>
              <Kanban.KanbanColumnHandle aria-label={`Move ${column}`} />
            </Kanban.KanbanColumn>
          ))}
        </Kanban.KanbanBoard>
      </Kanban.Kanban>,
    );

    const handle = screen.getByLabelText("Move 1");
    handle.focus();
    await pressKey(handle, " ", "Space");
    await pressKey(handle, "ArrowRight");
    await pressKey(handle, " ", "Space");

    expect(onMove).toHaveBeenCalledWith(
      expect.objectContaining({ activeIndex: 0, overIndex: 1 }),
    );
  });
});
