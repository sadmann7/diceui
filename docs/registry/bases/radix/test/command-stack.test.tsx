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
    fireEvent.click(screen.getByRole("option", { name }));
  });
}

function getChecked(name: string) {
  return screen.getByRole("option", { name }).getAttribute("aria-checked");
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
});
