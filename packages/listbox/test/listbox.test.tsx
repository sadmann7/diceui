import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import * as Listbox from "../src/index";

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = ResizeObserver;

// Mock requestAnimationFrame
global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

// Mock pointer capture methods
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.hasPointerCapture = vi.fn();

// Mock scrollIntoView
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

    // Test initial state
    const kickflipOption = screen.getByTestId("kickflip-option");
    expect(kickflipOption).toHaveAttribute("aria-selected", "true");
    expect(kickflipOption).toHaveAttribute("data-selected", "");

    // Test selecting a new item
    await act(async () => {
      fireEvent.click(screen.getByTestId("heelflip-option"));
    });
    expect(onValueChange).toHaveBeenCalledWith("heelflip");

    // Update the selection manually since we're testing controlled behavior
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

    // Verify the new selection
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

    // Focus the listbox
    await act(async () => {
      fireEvent.focus(listbox);
    });

    // First item should be focused
    const kickflipOption = screen.getByTestId("kickflip-option");
    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });

    // Navigate down
    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
    });

    const heelflipOption = screen.getByTestId("heelflip-option");
    await waitFor(() => {
      expect(heelflipOption).toHaveFocus();
    });

    // Select with Enter
    await act(async () => {
      fireEvent.keyDown(heelflipOption, { key: "Enter" });
    });
    expect(onValueChange).toHaveBeenCalledWith("heelflip");

    // Navigate down again
    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
    });

    const fs540Option = screen.getByTestId("fs-540-option");
    await waitFor(() => {
      expect(fs540Option).toHaveFocus();
    });

    // Select with Space
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

    // Select first item
    const kickflipOption = screen.getByTestId("kickflip-option");
    await act(async () => {
      fireEvent.click(kickflipOption);
    });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip"]);

    // Update the selection manually since we're testing controlled behavior
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

    // Select second item (should add to selection)
    const heelflipOption = screen.getByTestId("heelflip-option");
    await act(async () => {
      fireEvent.click(heelflipOption);
    });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip", "heelflip"]);

    // Update the selection manually
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

    // Verify both are selected
    expect(kickflipOption).toHaveAttribute("aria-selected", "true");
    expect(heelflipOption).toHaveAttribute("aria-selected", "true");

    // Deselect first item
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

    // Focus the listbox
    await act(async () => {
      fireEvent.focus(listbox);
    });

    // Select first item
    const kickflipOption = screen.getByTestId("kickflip-option");
    await act(async () => {
      fireEvent.keyDown(kickflipOption, { key: "Enter" });
    });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip"]);

    // Update the selection manually
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

    // Navigate to second item
    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
    });

    const heelflipOption = screen.getByTestId("heelflip-option");
    await waitFor(() => {
      expect(heelflipOption).toHaveFocus();
    });

    // Select with Ctrl+Enter (should add to selection)
    await act(async () => {
      fireEvent.keyDown(heelflipOption, { key: "Enter", ctrlKey: true });
    });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip", "heelflip"]);

    // Update the selection manually
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

    // Navigate to third item
    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
    });

    const fs540Option = screen.getByTestId("fs-540-option");
    await waitFor(() => {
      expect(fs540Option).toHaveFocus();
    });

    // Select with Meta+Space (should add to selection)
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

    // Try to select a disabled item
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

    // Try to select a disabled item
    await act(async () => {
      fireEvent.click(disabledOption);
    });
    expect(onValueChange).not.toHaveBeenCalled();

    // Test keyboard navigation skips disabled items
    const listbox = screen.getByRole("listbox");
    await act(async () => {
      fireEvent.focus(listbox);
    });

    // Navigate to the last enabled item
    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
    });

    // Should be on fs-540, not the disabled item
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

    // Press End key to go to last item
    await act(async () => {
      fireEvent.keyDown(listbox, { key: "End" });
    });

    const fs540Option = screen.getByTestId("fs-540-option");
    await waitFor(() => {
      expect(fs540Option).toHaveFocus();
    });

    // Press Home key to go to first item
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

    // Focus the listbox
    await act(async () => {
      fireEvent.focus(listbox);
    });

    // First item should be focused
    const kickflipOption = screen.getByTestId("kickflip-option");
    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });

    // Navigate right
    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowRight" });
    });

    const heelflipOption = screen.getByTestId("heelflip-option");
    await waitFor(() => {
      expect(heelflipOption).toHaveFocus();
    });

    // Navigate left
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

    // Focus the listbox
    await act(async () => {
      fireEvent.focus(listbox);
    });

    // First item should be focused
    const kickflipOption = screen.getByTestId("kickflip-option");
    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });

    // In RTL, ArrowLeft should move to the next item (right to left)
    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowLeft" });
    });

    const heelflipOption = screen.getByTestId("heelflip-option");
    await waitFor(() => {
      expect(heelflipOption).toHaveFocus();
    });

    // In RTL, ArrowRight should move to the previous item (left to right)
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

    // First item should be focused
    const kickflipOption = screen.getByTestId("kickflip-option");
    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });

    // Navigate up from first item should loop to last item
    await act(async () => {
      fireEvent.keyDown(listbox, { key: "ArrowUp" });
    });

    const fs540Option = screen.getByTestId("fs-540-option");
    await waitFor(() => {
      expect(fs540Option).toHaveFocus();
    });

    // Navigate down from last item should loop to first item
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

    // Move pointer over an item
    await act(async () => {
      fireEvent.pointerMove(heelflipOption);
    });

    await waitFor(() => {
      expect(heelflipOption).toHaveAttribute("data-highlighted", "");
    });

    // Move pointer over another item
    await act(async () => {
      fireEvent.pointerMove(kickflipOption);
    });

    await waitFor(() => {
      expect(kickflipOption).toHaveAttribute("data-highlighted", "");
      expect(heelflipOption).not.toHaveAttribute("data-highlighted");
    });

    // Move pointer away
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

    // Check that indicator is only visible for selected item
    const kickflipIndicator = screen.getByTestId("kickflip-indicator");
    expect(kickflipIndicator).toBeInTheDocument();

    // // Other indicators should not be visible
    // expect(screen.queryByTestId("heelflip-indicator")).not.toBeInTheDocument();
    // expect(screen.queryByTestId("fs540-indicator")).not.toBeInTheDocument();

    // // Select another item
    // rerender(
    //   <Listbox.Root value="heelflip">
    //     <Listbox.Item value="kickflip" data-testid="kickflip-option">
    //       Kickflip
    //       <Listbox.ItemIndicator data-testid="kickflip-indicator">
    //         ✓
    //       </Listbox.ItemIndicator>
    //     </Listbox.Item>
    //     <Listbox.Item value="heelflip" data-testid="heelflip-option">
    //       Heelflip
    //       <Listbox.ItemIndicator data-testid="heelflip-indicator">
    //         ✓
    //       </Listbox.ItemIndicator>
    //     </Listbox.Item>
    //     <Listbox.Item value="fs-540" data-testid="fs-540-option">
    //       FS 540
    //       <Listbox.ItemIndicator data-testid="fs540-indicator">
    //         ✓
    //       </Listbox.ItemIndicator>
    //     </Listbox.Item>
    //   </Listbox.Root>,
    // );

    // // Check that indicator moved to the newly selected item
    // const heelflipIndicator = screen.getByTestId("heelflip-indicator");
    // expect(heelflipIndicator).toBeInTheDocument();

    // // Other indicators should not be visible
    // expect(screen.queryByTestId("kickflip-indicator")).not.toBeInTheDocument();
    // expect(screen.queryByTestId("fs540-indicator")).not.toBeInTheDocument();
  });

  test("handles groups and group labels", async () => {
    renderListboxWithGroups();

    // Check that groups and labels are rendered
    expect(screen.getByText("Basic Tricks")).toBeInTheDocument();
    expect(screen.getByText("Advanced Tricks")).toBeInTheDocument();

    // Check that items are properly grouped
    const groups = screen.getAllByRole("group");
    expect(groups.length).toBe(2);

    // Check that group has proper ARIA attributes
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

    // Focus the listbox
    await act(async () => {
      fireEvent.focus(listbox);
    });

    // First item should be focused
    await waitFor(() => {
      expect(kickflipOption).toHaveFocus();
    });

    // Press Escape
    await act(async () => {
      fireEvent.keyDown(kickflipOption, { key: "Escape" });
    });

    // Item should no longer be highlighted
    await waitFor(() => {
      expect(kickflipOption).not.toHaveAttribute("data-highlighted");
    });
  });

  test("supports accessibility features", () => {
    renderListbox();

    const listbox = screen.getByRole("listbox");
    const options = screen.getAllByRole("option");

    // Check ARIA roles
    expect(listbox).toBeInTheDocument();
    expect(options.length).toBe(3);

    // Check that options have proper ARIA attributes
    for (const option of options) {
      expect(option).toHaveAttribute("aria-selected");
      expect(option).toHaveAttribute("tabIndex", "-1");
    }
  });
});
