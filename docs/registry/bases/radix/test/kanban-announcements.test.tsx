import { virtual } from "@guidepup/virtual-screen-reader";
import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import * as BaseKanban from "@/registry/bases/base/ui/kanban";
import * as RadixKanban from "@/registry/bases/radix/ui/kanban";

const COLUMN_WIDTH = 200;
const COLUMN_GAP = 20;
const HEADER_HEIGHT = 40;
const ROW_HEIGHT = 50;

const columnTitles: Record<string, string> = {
  todo: "To Do",
  done: "Done",
};

const tasks = {
  todo: [
    { id: "1", title: "Write docs" },
    { id: "2", title: "Fix bug" },
  ],
  done: [{ id: "3", title: "Ship it" }],
};

function getColumnLeft(column: Element) {
  const index = [...(column.parentElement?.children ?? [])].indexOf(column);
  return index * (COLUMN_WIDTH + COLUMN_GAP);
}

function getRect(element: Element) {
  const column = element.closest("[data-slot=kanban-column]");
  if (!column) return DOMRect.fromRect();
  const left = getColumnLeft(column);

  const item = element.closest("[data-slot=kanban-item]");
  if (item?.parentElement) {
    const index = [...item.parentElement.children].indexOf(item);
    return DOMRect.fromRect({
      x: left + 10,
      y: HEADER_HEIGHT + index * ROW_HEIGHT,
      width: COLUMN_WIDTH - 20,
      height: ROW_HEIGHT - 10,
    });
  }

  if (element.closest("[data-slot=kanban-column-handle]")) {
    return DOMRect.fromRect({
      x: left + COLUMN_WIDTH - 30,
      width: 30,
      height: 30,
    });
  }

  return DOMRect.fromRect({ x: left, width: COLUMN_WIDTH, height: 400 });
}

beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      return getRect(this);
    },
  );
});

afterEach(async () => {
  await virtual.stop();
  vi.restoreAllMocks();
});

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

async function pressKey(element: Element, key: string, code = key) {
  fireEvent.keyDown(element, { key, code });
  await settle();
}

async function drag(
  element: Element,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  fireEvent.mouseDown(element, { clientX: from.x, clientY: from.y, button: 0 });
  await settle();
  for (let step = 1; step <= 8; step++) {
    fireEvent.mouseMove(document, {
      clientX: from.x + ((to.x - from.x) * step) / 8,
      clientY: from.y + ((to.y - from.y) * step) / 8,
    });
    await settle();
  }
  fireEvent.mouseUp(document, { clientX: to.x, clientY: to.y });
  await settle();
}

async function getAnnouncements() {
  const log = await virtual.spokenPhraseLog();
  return log.filter((phrase) => phrase.startsWith("assertive: "));
}

describe.each([
  ["base", BaseKanban],
  ["radix", RadixKanban],
])("Kanban announcements (%s)", (_base, ui) => {
  function Board() {
    const [value, setValue] =
      React.useState<Record<string, { id: string; title: string }[]>>(tasks);

    return (
      <ui.Kanban
        value={value}
        onValueChange={setValue}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.title}
        getColumnLabel={(column) => columnTitles[column] ?? String(column)}
      >
        <ui.KanbanBoard>
          {Object.entries(value).map(([column, items]) => (
            <ui.KanbanColumn key={column} value={column}>
              <ui.KanbanColumnHandle
                aria-label={`Reorder ${columnTitles[column]}`}
              />
              {items.map((item) => (
                <ui.KanbanItem key={item.id} value={item.id} asHandle>
                  {item.title}
                </ui.KanbanItem>
              ))}
            </ui.KanbanColumn>
          ))}
        </ui.KanbanBoard>
      </ui.Kanban>
    );
  }

  async function renderBoard() {
    render(<Board />);
    await settle();
    await virtual.start({ container: document.body });
    await virtual.clearSpokenPhraseLog();
  }

  function getItem(name: string) {
    return screen.getByRole("button", { name });
  }

  function getBoard() {
    return [...document.querySelectorAll("[data-slot=kanban-column]")].map(
      (column) =>
        [...column.querySelectorAll("[data-slot=kanban-item]")].map(
          (item) => item.textContent,
        ),
    );
  }

  test("announces a keyboard drag once per position", async () => {
    await renderBoard();

    const item = getItem("Fix bug");
    item.focus();
    await virtual.clearSpokenPhraseLog();
    await pressKey(item, " ", "Space");
    await pressKey(item, "ArrowUp");
    await pressKey(item, "ArrowRight");
    await pressKey(getItem("Fix bug"), " ", "Space");

    expect(await getAnnouncements()).toEqual([
      "assertive: Grabbed Fix bug, To Do, position 2 of 2. Use the arrow keys to move it, Space or Enter to drop it, or Escape to cancel.",
      "assertive: Fix bug, position 1 of 2.",
      "assertive: Fix bug, Done, position 1 of 2.",
      "assertive: Dropped Fix bug in Done at position 1 of 2.",
    ]);
    expect(getBoard()).toEqual([["Write docs"], ["Fix bug", "Ship it"]]);
  });

  test("announces a cancelled keyboard drag", async () => {
    await renderBoard();

    const item = getItem("Write docs");
    item.focus();
    await virtual.clearSpokenPhraseLog();
    await pressKey(item, " ", "Space");
    await pressKey(item, "ArrowDown");
    await pressKey(item, "Escape");

    expect(await getAnnouncements()).toEqual([
      "assertive: Grabbed Write docs, To Do, position 1 of 2. Use the arrow keys to move it, Space or Enter to drop it, or Escape to cancel.",
      "assertive: Write docs, position 2 of 2.",
      "assertive: Cancelled. Write docs is back in To Do at position 1 of 2.",
    ]);
    expect(getBoard()).toEqual([["Write docs", "Fix bug"], ["Ship it"]]);
  });

  test("announces a mouse drag to another column without the keyboard hint", async () => {
    await renderBoard();

    await drag(
      getItem("Write docs"),
      { x: 100, y: HEADER_HEIGHT + 20 },
      { x: COLUMN_WIDTH + COLUMN_GAP + 100, y: HEADER_HEIGHT + 20 },
    );

    expect(await getAnnouncements()).toEqual([
      "assertive: Grabbed Write docs, To Do, position 1 of 2.",
      "assertive: Write docs, Done, position 1 of 2.",
      "assertive: Dropped Write docs in Done at position 1 of 2.",
    ]);
    expect(getBoard()).toEqual([["Fix bug"], ["Write docs", "Ship it"]]);
  });

  test("announces a column drag", async () => {
    await renderBoard();

    await drag(
      screen.getByLabelText("Reorder To Do"),
      { x: COLUMN_WIDTH - 15, y: 15 },
      { x: COLUMN_WIDTH * 2 + COLUMN_GAP - 15, y: 15 },
    );

    expect(await getAnnouncements()).toEqual([
      "assertive: Grabbed To Do, position 1 of 2.",
      "assertive: To Do, position 2 of 2.",
      "assertive: Dropped To Do at position 2 of 2.",
    ]);
    expect(getBoard()).toEqual([["Ship it"], ["Write docs", "Fix bug"]]);
  });
});
