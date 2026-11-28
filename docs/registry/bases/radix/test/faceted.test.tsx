import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test } from "vitest";

import * as BaseFaceted from "@/registry/bases/base/ui/faceted";
import * as RadixFaceted from "@/registry/bases/radix/ui/faceted";

const items = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollIntoView ??= () => {};
});

type FacetedModule = typeof RadixFaceted | typeof BaseFaceted;

function SingleSelect({ ui }: { ui: FacetedModule }) {
  const {
    Faceted,
    FacetedContent,
    FacetedGroup,
    FacetedItem,
    FacetedList,
    FacetedTrigger,
    FacetedValue,
  } = ui;
  const [value, setValue] = React.useState<string | undefined>();

  return (
    <Faceted value={value} onValueChange={setValue} items={items}>
      <FacetedTrigger>
        <FacetedValue placeholder="Pick a status" />
      </FacetedTrigger>
      <FacetedContent>
        <FacetedList>
          <FacetedGroup>
            {items.map((item) => (
              <FacetedItem key={item.value} value={item.value}>
                {item.label}
              </FacetedItem>
            ))}
          </FacetedGroup>
        </FacetedList>
      </FacetedContent>
    </Faceted>
  );
}

function toggleActive() {
  act(() => {
    fireEvent.click(screen.getByRole("button"));
  });
  act(() => {
    fireEvent.click(screen.getByRole("option", { name: "Active" }));
  });
}

function getActiveChecked() {
  act(() => {
    fireEvent.click(screen.getByRole("button"));
  });
  const option = screen.getByRole("option", {
    name: "Active",
  });
  expect(option.hasAttribute("aria-checked")).toBe(false);
  const checked = option.getAttribute("aria-selected") === "true";
  act(() => {
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
  });
  return checked;
}

describe.each([
  ["radix", RadixFaceted],
  ["base", BaseFaceted],
])("Faceted (%s)", (_name, ui) => {
  test("keeps the indicator in sync when a single value is toggled repeatedly", () => {
    render(<SingleSelect ui={ui} />);

    for (let round = 0; round < 3; round++) {
      toggleActive();
      expect(screen.getByRole("button").textContent).toContain("Active");
      expect(getActiveChecked()).toBe(true);

      toggleActive();
      expect(screen.getByRole("button").textContent).toContain("Pick a status");
      expect(getActiveChecked()).toBe(false);
    }
  });

  test("marks only applied options as selected", () => {
    const { Faceted, FacetedContent, FacetedItem, FacetedList } = ui;
    render(
      <Faceted items={items} multiple defaultOpen>
        <FacetedContent>
          <FacetedList>
            {items.map((item) => (
              <FacetedItem key={item.value} value={item.value}>
                {item.label}
              </FacetedItem>
            ))}
          </FacetedList>
        </FacetedContent>
      </Faceted>,
    );

    const active = screen.getByRole("option", { name: "Active" });
    expect(active.closest("[cmdk-item]")?.getAttribute("data-selected")).toBe(
      "true",
    );
    expect(active.getAttribute("aria-selected")).toBe("false");

    act(() => {
      fireEvent.click(screen.getByRole("option", { name: "Inactive" }));
    });

    const inactive = screen.getByRole("option", { name: "Inactive" });
    expect(inactive.getAttribute("aria-selected")).toBe("true");
    expect(inactive.hasAttribute("aria-checked")).toBe(false);
    expect(inactive.closest("[cmdk-item]")?.getAttribute("data-selected")).toBe(
      "true",
    );
    expect(
      screen.getByRole("listbox").getAttribute("aria-multiselectable"),
    ).toBe("true");
  });

  test("leaves aria-multiselectable off in single mode", () => {
    render(<SingleSelect ui={ui} />);
    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(
      screen.getByRole("listbox").hasAttribute("aria-multiselectable"),
    ).toBe(false);
  });

  test("names the dialog, input and list after the input", () => {
    const {
      Faceted,
      FacetedContent,
      FacetedInput,
      FacetedItem,
      FacetedItemIndicator,
      FacetedList,
    } = ui;
    render(
      <Faceted items={items} defaultOpen>
        <FacetedContent>
          <FacetedInput placeholder="Search status" />
          <FacetedList>
            {items.map((item, index) => (
              <FacetedItem key={item.value} value={item.value}>
                <span>{item.label}</span>
                <FacetedItemIndicator>{index + 1}</FacetedItemIndicator>
              </FacetedItem>
            ))}
          </FacetedList>
        </FacetedContent>
      </Faceted>,
    );

    expect(screen.getByRole("dialog", { name: "Search status" })).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "Search status" }),
    ).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "Search status" })).toBeTruthy();
    expect(
      screen.getByRole("option", { name: /^Active\s*,\s*1$/ }),
    ).toBeTruthy();
  });

  test("points aria-activedescendant at the highlighted option", async () => {
    const { Faceted, FacetedContent, FacetedInput, FacetedItem, FacetedList } =
      ui;
    render(
      <Faceted items={items} multiple defaultOpen>
        <FacetedContent>
          <FacetedInput placeholder="Search status" />
          <FacetedList>
            {items.map((item) => (
              <FacetedItem key={item.value} value={item.value}>
                {item.label}
              </FacetedItem>
            ))}
          </FacetedList>
        </FacetedContent>
      </Faceted>,
    );

    act(() => {
      fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    });

    const option = screen.getByRole("option", { name: "Inactive" });
    await waitFor(() => {
      expect(
        screen.getByRole("combobox").getAttribute("aria-activedescendant"),
      ).toBe(option.id);
      expect(
        screen.getByRole("listbox").getAttribute("aria-activedescendant"),
      ).toBe(option.id);
    });
  });

  test("announces toggled options in a live region", () => {
    const { Faceted, FacetedContent, FacetedItem, FacetedList } = ui;
    render(
      <Faceted items={items} multiple defaultOpen>
        <FacetedContent>
          <FacetedList>
            {items.map((item) => (
              <FacetedItem key={item.value} value={item.value}>
                {item.label}
              </FacetedItem>
            ))}
          </FacetedList>
        </FacetedContent>
      </Faceted>,
    );

    const status = document.querySelector("[aria-live=polite]");
    act(() => {
      fireEvent.click(screen.getByRole("option", { name: "Inactive" }));
    });
    expect(status?.textContent).toBe("Inactive selected");

    act(() => {
      fireEvent.click(screen.getByRole("option", { name: "Inactive" }));
    });
    expect(status?.textContent).toBe("Inactive not selected");
  });
});
