import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test } from "vitest";

import * as BaseCommandStack from "@/registry/bases/base/ui/command-stack";
import * as RadixCommandStack from "@/registry/bases/radix/ui/command-stack";

const items = ["Active", "Inactive"];

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollIntoView ??= () => {};
});

type CommandStackModule = typeof RadixCommandStack | typeof BaseCommandStack;

function Selectable({
  ui,
  selectionMode,
}: {
  ui: CommandStackModule;
  selectionMode: "single" | "multiple";
}) {
  const {
    CommandStack,
    CommandStackGroup,
    CommandStackItem,
    CommandStackList,
    CommandStackPage,
  } = ui;
  const [value, setValue] = React.useState<Record<string, string[]>>({});

  return (
    <>
      <CommandStack value={value} onValueChange={setValue}>
        <CommandStackList>
          <CommandStackPage value="root" selectionMode={selectionMode}>
            <CommandStackGroup>
              {items.map((item) => (
                <CommandStackItem key={item} value={item}>
                  {item}
                </CommandStackItem>
              ))}
            </CommandStackGroup>
          </CommandStackPage>
        </CommandStackList>
      </CommandStack>
      <output>{(value.root ?? []).join(",")}</output>
    </>
  );
}

function toggle(name: string) {
  act(() => {
    fireEvent.click(
      screen.getByRole("option", {
        name: new RegExp(`^${name}(\\s*, checked)?$`),
      }),
    );
  });
}

function getChecked(name: string) {
  const option = screen.getByRole("option", {
    name: new RegExp(`^${name}(\\s*, checked)?$`),
  });
  expect(option.hasAttribute("aria-checked")).toBe(false);
  return String(option.querySelector("[aria-label=', checked']") !== null);
}

function getValue() {
  return screen.getByRole("status").textContent;
}

describe.each([
  ["radix", RadixCommandStack],
  ["base", BaseCommandStack],
])("CommandStack (%s)", (_name, ui) => {
  test("toggles a single value repeatedly", () => {
    render(<Selectable ui={ui} selectionMode="single" />);

    for (let round = 0; round < 3; round++) {
      toggle("Active");
      expect(getValue()).toBe("Active");
      expect(getChecked("Active")).toBe("true");

      toggle("Active");
      expect(getValue()).toBe("");
      expect(getChecked("Active")).toBe("false");
    }

    toggle("Active");
    toggle("Inactive");
    expect(getValue()).toBe("Inactive");
    expect(getChecked("Active")).toBe("false");
    expect(getChecked("Inactive")).toBe("true");
  });

  test("adds and removes values in multiple mode", () => {
    render(<Selectable ui={ui} selectionMode="multiple" />);

    toggle("Active");
    toggle("Inactive");
    expect(getValue()).toBe("Active,Inactive");
    expect(getChecked("Active")).toBe("true");
    expect(getChecked("Inactive")).toBe("true");

    toggle("Active");
    expect(getValue()).toBe("Inactive");
    expect(getChecked("Active")).toBe("false");
    expect(getChecked("Inactive")).toBe("true");
  });

  test("leaves the checked word off navigation items", () => {
    const {
      CommandStack,
      CommandStackItem,
      CommandStackList,
      CommandStackPage,
    } = ui;
    render(
      <CommandStack>
        <CommandStackList>
          <CommandStackPage value="root">
            <CommandStackItem value="status" page="status">
              Status
            </CommandStackItem>
          </CommandStackPage>
        </CommandStackList>
      </CommandStack>,
    );

    expect(screen.getByRole("option", { name: "Status" })).toBeTruthy();
  });

  test("names the input and list after the input", () => {
    const {
      CommandStack,
      CommandStackInput,
      CommandStackItem,
      CommandStackList,
      CommandStackPage,
    } = ui;
    render(
      <CommandStack>
        <CommandStackInput placeholder="Filter..." />
        <CommandStackList>
          <CommandStackPage value="root">
            <CommandStackItem value="status">Status</CommandStackItem>
          </CommandStackPage>
        </CommandStackList>
      </CommandStack>,
    );

    expect(screen.getByRole("combobox", { name: "Filter..." })).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "Filter..." })).toBeTruthy();
  });

  test("drops a nested page's name after going back", () => {
    const {
      CommandStack,
      CommandStackInput,
      CommandStackItem,
      CommandStackList,
      CommandStackPage,
    } = ui;
    render(
      <CommandStack>
        <CommandStackInput />
        <CommandStackList>
          <CommandStackPage value="root">
            <CommandStackItem value="projects" page="projects">
              Projects
            </CommandStackItem>
          </CommandStackPage>
          <CommandStackPage value="projects" placeholder="Search projects...">
            <CommandStackItem value="alpha">Alpha</CommandStackItem>
          </CommandStackPage>
        </CommandStackList>
      </CommandStack>,
    );

    act(() => {
      fireEvent.click(screen.getByRole("option", { name: "Projects" }));
    });
    expect(
      screen.getByRole("listbox", { name: "Search projects..." }),
    ).toBeTruthy();

    act(() => {
      fireEvent.keyDown(screen.getByRole("combobox"), { key: "Backspace" });
    });
    expect(screen.getByRole("listbox", { name: "Suggestions" })).toBeTruthy();
  });
});
