import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import * as Listbox from "../src/listbox";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.hasPointerCapture = vi.fn();

Element.prototype.scrollIntoView = vi.fn();

describe("Listbox", () => {
  beforeEach(() => {
    cleanup();
  });

  function renderListbox<T extends boolean>(
    props: Listbox.ListboxRootProps<T> = {},
  ) {
    const { value, multiple, children, ...listboxProps } = props;

    return render(
      <Listbox.Root value={value} multiple={multiple} {...listboxProps}>
        <Listbox.Item value="kickflip" data-testid="kickflip-option">
          Kickflip
          <Listbox.ItemIndicator data-testid="kickflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="heelflip" data-testid="heelflip-option">
          Heelflip
          <Listbox.ItemIndicator data-testid="heelflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="fs-540" data-testid="fs-540-option">
          FS 540
          <Listbox.ItemIndicator data-testid="fs540-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        {children}
      </Listbox.Root>,
    );
  }

  function renderListboxWithGroups<T extends boolean>(
    props: Listbox.ListboxRootProps<T> = {},
  ) {
    const { value, multiple, ...listboxProps } = props;

    return render(
      <Listbox.Root value={value} multiple={multiple} {...listboxProps}>
        <Listbox.Group>
          <Listbox.GroupLabel>Basic Tricks</Listbox.GroupLabel>
          <Listbox.Item value="kickflip" data-testid="kickflip-option">
            Kickflip
            <Listbox.ItemIndicator data-testid="kickflip-indicator">
              ✓
            </Listbox.ItemIndicator>
          </Listbox.Item>
          <Listbox.Item value="heelflip" data-testid="heelflip-option">
            Heelflip
            <Listbox.ItemIndicator data-testid="heelflip-indicator">
              ✓
            </Listbox.ItemIndicator>
          </Listbox.Item>
        </Listbox.Group>
        <Listbox.Group>
          <Listbox.GroupLabel>Advanced Tricks</Listbox.GroupLabel>
          <Listbox.Item value="fs-540" data-testid="fs-540-option">
            FS 540
            <Listbox.ItemIndicator data-testid="fs540-indicator">
              ✓
            </Listbox.ItemIndicator>
          </Listbox.Item>
        </Listbox.Group>
      </Listbox.Root>,
    );
  }

  test("renders without crashing", () => {
    renderListbox();
    expect(screen.getByText("Kickflip")).toBeInTheDocument();
    expect(screen.getByText("Heelflip")).toBeInTheDocument();
    expect(screen.getByText("FS 540")).toBeInTheDocument();
  });

  test("handles controlled state", async () => {
    const onValueChange = vi.fn();

    const { rerender } = renderListbox({
      defaultValue: "kickflip",
      onValueChange,
    });

    const kickflipOption = screen.getByTestId("kickflip-option");
    expect(kickflipOption).toHaveAttribute("aria-selected", "true");
    expect(kickflipOption).toHaveAttribute("data-selected", "");

    await act(async () => {
      fireEvent.click(screen.getByTestId("heelflip-option"));
    });
    expect(onValueChange).toHaveBeenCalledWith("heelflip");

    // Controlled, so the selection is updated by hand.
    rerender(
      <Listbox.Root value="heelflip" onValueChange={onValueChange}>
        <Listbox.Item value="kickflip" data-testid="kickflip-option">
          Kickflip
          <Listbox.ItemIndicator data-testid="kickflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="heelflip" data-testid="heelflip-option">
          Heelflip
          <Listbox.ItemIndicator data-testid="heelflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="fs-540" data-testid="fs-540-option">
          FS 540
          <Listbox.ItemIndicator data-testid="fs540-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
      </Listbox.Root>,
    );

    const heelflipOption = screen.getByTestId("heelflip-option");
    expect(heelflipOption).toHaveAttribute("aria-selected", "true");
    expect(heelflipOption).toHaveAttribute("data-selected", "");
    expect(kickflipOption).not.toHaveAttribute("data-selected");
  });

  test("handles keyboard navigation", async () => {
    const onValueChange = vi.fn();

    renderListbox({
      onValueChange,
    });

    const listbox = screen.getByRole("listbox");

    await act(async () => {
      fireEvent.focus(listbox);
    });

    const kickflipOption = screen.getByTestId("kickflip-option");
    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });

    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
    });

    const heelflipOption = screen.getByTestId("heelflip-option");
    await waitFor(() => {
      expect(heelflipOption).toHaveFocus();
    });

    await act(async () => {
      fireEvent.keyDown(heelflipOption, { key: "Enter" });
    });
    expect(onValueChange).toHaveBeenCalledWith("heelflip");

    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
    });

    const fs540Option = screen.getByTestId("fs-540-option");
    await waitFor(() => {
      expect(fs540Option).toHaveFocus();
    });

    await act(async () => {
      fireEvent.keyDown(fs540Option, { key: " " });
    });
    expect(onValueChange).toHaveBeenCalledWith("fs-540");
  });

  test("handles multiple selection", async () => {
    const onValueChange = vi.fn();

    const { rerender } = renderListbox({
      multiple: true,
      onValueChange,
    });

    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");

    const kickflipOption = screen.getByTestId("kickflip-option");
    await act(async () => {
      fireEvent.click(kickflipOption);
    });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip"]);

    // Controlled, so the selection is updated by hand.
    rerender(
      <Listbox.Root multiple value={["kickflip"]} onValueChange={onValueChange}>
        <Listbox.Item value="kickflip" data-testid="kickflip-option">
          Kickflip
          <Listbox.ItemIndicator data-testid="kickflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="heelflip" data-testid="heelflip-option">
          Heelflip
          <Listbox.ItemIndicator data-testid="heelflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="fs-540" data-testid="fs-540-option">
          FS 540
          <Listbox.ItemIndicator data-testid="fs540-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
      </Listbox.Root>,
    );

    const heelflipOption = screen.getByTestId("heelflip-option");
    await act(async () => {
      fireEvent.click(heelflipOption);
    });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip", "heelflip"]);

    rerender(
      <Listbox.Root
        multiple
        value={["kickflip", "heelflip"]}
        onValueChange={onValueChange}
      >
        <Listbox.Item value="kickflip" data-testid="kickflip-option">
          Kickflip
          <Listbox.ItemIndicator data-testid="kickflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="heelflip" data-testid="heelflip-option">
          Heelflip
          <Listbox.ItemIndicator data-testid="heelflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="fs-540" data-testid="fs-540-option">
          FS 540
          <Listbox.ItemIndicator data-testid="fs540-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
      </Listbox.Root>,
    );

    expect(kickflipOption).toHaveAttribute("aria-selected", "true");
    expect(heelflipOption).toHaveAttribute("aria-selected", "true");

    await act(async () => {
      fireEvent.click(kickflipOption);
    });
    expect(onValueChange).toHaveBeenCalledWith(["heelflip"]);
  });

  test("handles keyboard multiple selection with Ctrl/Meta key", async () => {
    const onValueChange = vi.fn();

    const { rerender } = renderListbox({
      multiple: true,
      onValueChange,
    });

    const listbox = screen.getByRole("listbox");

    await act(async () => {
      fireEvent.focus(listbox);
    });

    const kickflipOption = screen.getByTestId("kickflip-option");
    await act(async () => {
      fireEvent.keyDown(kickflipOption, { key: "Enter" });
    });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip"]);

    // Controlled, so the selection is updated by hand.
    rerender(
      <Listbox.Root multiple value={["kickflip"]} onValueChange={onValueChange}>
        <Listbox.Item value="kickflip" data-testid="kickflip-option">
          Kickflip
          <Listbox.ItemIndicator data-testid="kickflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="heelflip" data-testid="heelflip-option">
          Heelflip
          <Listbox.ItemIndicator data-testid="heelflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="fs-540" data-testid="fs-540-option">
          FS 540
          <Listbox.ItemIndicator data-testid="fs540-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
      </Listbox.Root>,
    );

    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
    });

    const heelflipOption = screen.getByTestId("heelflip-option");
    await waitFor(() => {
      expect(heelflipOption).toHaveFocus();
    });

    await act(async () => {
      fireEvent.keyDown(heelflipOption, { key: "Enter", ctrlKey: true });
    });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip", "heelflip"]);

    rerender(
      <Listbox.Root
        multiple
        value={["kickflip", "heelflip"]}
        onValueChange={onValueChange}
      >
        <Listbox.Item value="kickflip" data-testid="kickflip-option">
          Kickflip
          <Listbox.ItemIndicator data-testid="kickflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="heelflip" data-testid="heelflip-option">
          Heelflip
          <Listbox.ItemIndicator data-testid="heelflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="fs-540" data-testid="fs-540-option">
          FS 540
          <Listbox.ItemIndicator data-testid="fs540-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
      </Listbox.Root>,
    );

    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
    });

    const fs540Option = screen.getByTestId("fs-540-option");
    await waitFor(() => {
      expect(fs540Option).toHaveFocus();
    });

    await act(async () => {
      fireEvent.keyDown(fs540Option, { key: " ", metaKey: true });
    });
    expect(onValueChange).toHaveBeenCalledWith([
      "kickflip",
      "heelflip",
      "fs-540",
    ]);
  });

  test("handles disabled state", async () => {
    const onValueChange = vi.fn();

    renderListbox({
      disabled: true,
      onValueChange,
    });

    const kickflipOption = screen.getByTestId("kickflip-option");
    expect(kickflipOption).toHaveAttribute("data-disabled", "");

    await act(async () => {
      fireEvent.click(kickflipOption);
    });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles disabled items", async () => {
    const onValueChange = vi.fn();

    renderListbox({
      onValueChange,
      children: (
        <Listbox.Item value="impossible" disabled data-testid="disabled-option">
          Impossible
          <Listbox.ItemIndicator data-testid="impossible-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
      ),
    });

    const disabledOption = screen.getByTestId("disabled-option");
    expect(disabledOption).toHaveAttribute("data-disabled", "");

    await act(async () => {
      fireEvent.click(disabledOption);
    });
    expect(onValueChange).not.toHaveBeenCalled();

    const listbox = screen.getByRole("listbox");
    await act(async () => {
      fireEvent.focus(listbox);
    });

    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
    });

    const fs540Option = screen.getByTestId("fs-540-option");
    await waitFor(() => {
      expect(fs540Option).toHaveFocus();
    });
  });

  test("handles Home and End keys", async () => {
    renderListbox();

    const listbox = screen.getByRole("listbox");
    await act(async () => {
      fireEvent.focus(listbox);
    });

    await act(async () => {
      fireEvent.keyDown(listbox, { key: "End" });
    });

    const fs540Option = screen.getByTestId("fs-540-option");
    await waitFor(() => {
      expect(fs540Option).toHaveFocus();
    });

    await act(async () => {
      fireEvent.keyDown(listbox, { key: "Home" });
    });

    const kickflipOption = screen.getByTestId("kickflip-option");
    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });
  });

  test("handles horizontal orientation", async () => {
    const onValueChange = vi.fn();

    renderListbox({
      orientation: "horizontal",
      onValueChange,
    });

    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("data-orientation", "horizontal");

    await act(async () => {
      fireEvent.focus(listbox);
    });

    const kickflipOption = screen.getByTestId("kickflip-option");
    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });

    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowRight" });
    });

    const heelflipOption = screen.getByTestId("heelflip-option");
    await waitFor(() => {
      expect(heelflipOption).toHaveFocus();
    });

    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowLeft" });
    });

    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });
  });

  test("handles RTL direction", async () => {
    renderListbox({
      dir: "rtl",
      orientation: "horizontal",
    });

    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("dir", "rtl");

    await act(async () => {
      fireEvent.focus(listbox);
    });

    const kickflipOption = screen.getByTestId("kickflip-option");
    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });

    // In RTL, ArrowLeft moves to the next item.
    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowLeft" });
    });

    const heelflipOption = screen.getByTestId("heelflip-option");
    await waitFor(() => {
      expect(heelflipOption).toHaveFocus();
    });

    // In RTL, ArrowRight moves to the previous item.
    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowRight" });
    });

    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });
  });

  test("handles loop navigation", async () => {
    renderListbox({
      loop: true,
    });

    const listbox = screen.getByRole("listbox");
    await act(async () => {
      fireEvent.focus(listbox);
    });

    const kickflipOption = screen.getByTestId("kickflip-option");
    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });

    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowUp" });
    });

    const fs540Option = screen.getByTestId("fs-540-option");
    await waitFor(() => {
      expect(fs540Option).toHaveFocus();
    });

    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
    });

    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });
  });

  test("handles item highlighting on pointer move", async () => {
    renderListbox();

    const kickflipOption = screen.getByTestId("kickflip-option");
    const heelflipOption = screen.getByTestId("heelflip-option");

    await act(async () => {
      fireEvent.pointerMove(heelflipOption);
    });

    await waitFor(() => {
      expect(heelflipOption).toHaveAttribute("data-highlighted", "");
    });

    await act(async () => {
      fireEvent.pointerMove(kickflipOption);
    });

    await waitFor(() => {
      expect(kickflipOption).toHaveAttribute("data-highlighted", "");
      expect(heelflipOption).not.toHaveAttribute("data-highlighted");
    });

    await act(async () => {
      fireEvent.pointerLeave(kickflipOption);
    });

    await waitFor(() => {
      expect(kickflipOption).not.toHaveAttribute("data-highlighted");
    });
  });

  test("handles item indicator visibility", async () => {
    const { rerender } = renderListbox({
      value: "kickflip",
    });

    const kickflipOption = screen.getByTestId("kickflip-option");
    expect(kickflipOption).toHaveAttribute("aria-selected", "true");
    expect(kickflipOption).toHaveAttribute("data-selected", "");

    const heelflipOption = screen.getByTestId("heelflip-option");
    const fs540Option = screen.getByTestId("fs-540-option");
    expect(heelflipOption).toHaveAttribute("aria-selected", "false");
    expect(fs540Option).toHaveAttribute("aria-selected", "false");
    expect(heelflipOption).not.toHaveAttribute("data-selected");
    expect(fs540Option).not.toHaveAttribute("data-selected");

    rerender(
      <Listbox.Root value="heelflip">
        <Listbox.Item value="kickflip" data-testid="kickflip-option">
          Kickflip
          <Listbox.ItemIndicator data-testid="kickflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="heelflip" data-testid="heelflip-option">
          Heelflip
          <Listbox.ItemIndicator data-testid="heelflip-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
        <Listbox.Item value="fs-540" data-testid="fs-540-option">
          FS 540
          <Listbox.ItemIndicator data-testid="fs540-indicator">
            ✓
          </Listbox.ItemIndicator>
        </Listbox.Item>
      </Listbox.Root>,
    );

    expect(heelflipOption).toHaveAttribute("aria-selected", "true");
    expect(heelflipOption).toHaveAttribute("data-selected", "");
    expect(kickflipOption).toHaveAttribute("aria-selected", "false");
    expect(kickflipOption).not.toHaveAttribute("data-selected");
  });

  test("handles groups and group labels", async () => {
    renderListboxWithGroups();

    expect(screen.getByText("Basic Tricks")).toBeInTheDocument();
    expect(screen.getByText("Advanced Tricks")).toBeInTheDocument();

    const groups = screen.getAllByRole("group");
    expect(groups.length).toBe(2);

    const firstGroup = groups[0] as HTMLElement;
    expect(firstGroup).toHaveAttribute("aria-labelledby");

    const labelId = firstGroup.getAttribute("aria-labelledby");
    expect(labelId).not.toBeNull();

    if (labelId) {
      const label = document.getElementById(labelId);
      expect(label).not.toBeNull();
      if (label) {
        expect(label).toHaveTextContent("Basic Tricks");
      }
    }
  });

  test("handles Escape key to clear focus", async () => {
    renderListbox();

    const listbox = screen.getByRole("listbox");
    const kickflipOption = screen.getByTestId("kickflip-option");

    await act(async () => {
      fireEvent.focus(listbox);
    });

    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });

    await act(async () => {
      fireEvent.keyDown(kickflipOption, { key: "Escape" });
    });

    await waitFor(() => {
      expect(kickflipOption).not.toHaveAttribute("data-highlighted");
    });
  });

  test("supports accessibility features", () => {
    renderListbox();

    const listbox = screen.getByRole("listbox");
    const options = screen.getAllByRole("option");

    expect(listbox).toBeInTheDocument();
    expect(options.length).toBe(3);

    for (const option of options) {
      expect(option).toHaveAttribute("aria-selected");
      expect(option).toHaveAttribute("tabIndex", "-1");
    }
  });
});
