import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import * as Combobox from "../src/index";

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

function getInputPlaceholder(multiple?: boolean) {
  return multiple ? "Select tricks..." : "Select a trick...";
}

describe("Combobox", () => {
  function renderCombobox<T extends boolean>(
    props: Combobox.ComboboxRootProps<T> & {
      badgeListOrientation?: "horizontal" | "vertical";
    } = {},
  ) {
    const {
      value,
      multiple,
      badgeListOrientation = "horizontal",
      ...comboboxProps
    } = props;

    return render(
      <Combobox.Root value={value} multiple={multiple} {...comboboxProps}>
        <Combobox.Label>Favorite tricks</Combobox.Label>
        <Combobox.Anchor data-testid="anchor">
          {multiple ? (
            <Combobox.BadgeList orientation={badgeListOrientation}>
              {Array.isArray(value) &&
                value.map((value) => (
                  <Combobox.BadgeItem key={value} value={value}>
                    {value}
                    <Combobox.BadgeItemDelete />
                  </Combobox.BadgeItem>
                ))}
            </Combobox.BadgeList>
          ) : null}
          <Combobox.Input placeholder={getInputPlaceholder(multiple)} />
          <Combobox.Trigger data-testid="trigger">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Combobox.Trigger>
        </Combobox.Anchor>
        <Combobox.Portal data-testid="portal">
          <Combobox.Content data-testid="content">
            <Combobox.Item value="kickflip">Kickflip</Combobox.Item>
            <Combobox.Item value="heelflip">Heelflip</Combobox.Item>
            <Combobox.Item value="fs-540">FS 540</Combobox.Item>
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>,
    );
  }

  test("handles controlled state", async () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();

    renderCombobox({
      defaultValue: "kickflip",
      onOpenChange,
      onValueChange,
      onInputValueChange,
    });

    const trigger = screen.getByTestId("trigger");
    const input = screen.getByPlaceholderText(getInputPlaceholder());

    expect(input).toHaveValue("kickflip");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await waitFor(() => {
      fireEvent.click(trigger);
    });

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
    expect(kickflipOption).toHaveAttribute("aria-selected", "true");

    const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
    await waitFor(() => {
      fireEvent.click(heelflipOption);
    });
    expect(onValueChange).toHaveBeenCalledWith("heelflip");
    expect(onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.change(input, { target: { value: "fs" } });
    await waitFor(() => {
      expect(onInputValueChange).toHaveBeenCalledWith("fs");
    });
    const fs540Option = screen.getByRole("option", { name: "FS 540" });
    expect(fs540Option).toBeInTheDocument();
    expect(kickflipOption).not.toBeInTheDocument();
    expect(heelflipOption).not.toBeInTheDocument();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      expect(fs540Option).toHaveAttribute("data-highlighted", "");
      expect(input).toHaveAttribute("aria-activedescendant", fs540Option.id);
    });

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("fs-540");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("handles keyboard navigation", async () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();

    renderCombobox({
      onOpenChange,
      onValueChange,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder());
    const trigger = screen.getByTestId("trigger");

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    fireEvent.focus(input);
    await waitFor(() => {
      expect(input).toHaveFocus();
    });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
      expect(kickflipOption).toHaveAttribute("data-highlighted", "");
      expect(input).toHaveAttribute("aria-activedescendant", kickflipOption.id);
    });

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("kickflip");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("handles multiple selection", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();

    renderCombobox({
      onValueChange,
      onOpenChange,
      value: ["kickflip"],
      multiple: true,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder(true));
    const trigger = screen.getByTestId("trigger");

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
    await waitFor(() => {
      fireEvent.click(heelflipOption);
    });

    expect(onValueChange).toHaveBeenCalledWith(["kickflip", "heelflip"]);
    expect(input).toHaveValue("");

    fireEvent.keyDown(input, { key: "ArrowLeft" });
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "kickflip" })).toHaveAttribute(
        "data-highlighted",
        "",
      );
    });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(onValueChange).toHaveBeenLastCalledWith([]);
    });
  });

  test("handles badge keyboard navigation", async () => {
    const onValueChange = vi.fn();

    renderCombobox({
      value: ["kickflip", "heelflip"],
      onValueChange,
      multiple: true,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder(true));

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowLeft" });

    const lastBadge = screen
      .getByText("heelflip")
      .closest("[data-highlighted]");
    expect(lastBadge).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip"]);
  });

  test("handles default filtering", async () => {
    renderCombobox();
    const input = screen.getByPlaceholderText(getInputPlaceholder());

    fireEvent.change(input, { target: { value: "flp" } });

    const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
    const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
    const fs540Option = screen.getByRole("option", { name: "FS 540" });

    await waitFor(() => {
      expect(kickflipOption).toBeInTheDocument();
      expect(heelflipOption).toBeInTheDocument();
      expect(fs540Option).not.toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: "Kickflip" } });
    await waitFor(() => {
      expect(kickflipOption).toBeInTheDocument();
      expect(heelflipOption).not.toBeInTheDocument();
      expect(fs540Option).not.toBeInTheDocument();
    });
  });

  test("handles exact match filtering", async () => {
    renderCombobox({
      exactMatch: true,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder());
    const trigger = screen.getByTestId("trigger");

    fireEvent.click(trigger);

    const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
    const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
    const fs540Option = screen.getByRole("option", { name: "FS 540" });

    fireEvent.change(input, { target: { value: "Kickflip" } });
    await waitFor(() => {
      expect(kickflipOption).toBeInTheDocument();
      expect(heelflipOption).not.toBeInTheDocument();
      expect(fs540Option).not.toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: "kick" } });
    await waitFor(() => {
      expect(kickflipOption).toBeInTheDocument();
      expect(heelflipOption).not.toBeInTheDocument();
      expect(fs540Option).not.toBeInTheDocument();
    });
  });

  test("handles custom filtering", async () => {
    const customFilter = (options: string[], term: string) =>
      options.filter((option) =>
        option.toLowerCase().includes(term.toLowerCase()),
      );

    renderCombobox({
      onFilter: customFilter,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder());

    fireEvent.change(input, { target: { value: "FLIP" } });

    await waitFor(() => {
      expect(screen.getByText("Kickflip")).toBeInTheDocument();
      expect(screen.getByText("Heelflip")).toBeInTheDocument();
      expect(screen.queryByText("FS 540")).not.toBeInTheDocument();
    });
  });

  test("handles open on focus", async () => {
    renderCombobox({
      openOnFocus: true,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder());

    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  test("handles preserve input on blur", async () => {
    renderCombobox({
      preserveInputOnBlur: true,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder());

    fireEvent.change(input, { target: { value: "test" } });
    await waitFor(() => {
      expect(input).toHaveValue("test");
    });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(input).toHaveValue("test");
    });
  });

  test("renders without crashing", () => {
    renderCombobox();
    expect(screen.getByText("Favorite tricks")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(getInputPlaceholder()),
    ).toBeInTheDocument();
  });

  test("handles disabled state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCombobox({ disabled: true, onValueChange });

    const input = screen.getByPlaceholderText(getInputPlaceholder());
    expect(input).toBeDisabled();

    await user.click(input);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles read only state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCombobox({
      readOnly: true,
      defaultValue: "kickflip",
      onValueChange,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder());
    expect(input).toHaveAttribute("readonly");

    await user.type(input, "new value");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("supports RTL direction", async () => {
    renderCombobox({ dir: "rtl" });
    const input = screen.getByPlaceholderText(getInputPlaceholder());
    const anchor = input.closest("div[dir]");
    const trigger = screen.getByTestId("trigger");

    fireEvent.click(trigger);
    const content = screen.getByRole("listbox");

    await waitFor(() => {
      expect(content).toBeInTheDocument();
    });

    expect(anchor).toHaveAttribute("dir", "rtl");
    expect(input).toHaveAttribute("dir", "rtl");
    expect(trigger).toHaveAttribute("dir", "rtl");
    expect(content).toHaveAttribute("dir", "rtl");
  });

  test("handles autoHighlight", async () => {
    renderCombobox({ autoHighlight: true });
    const input = screen.getByPlaceholderText(getInputPlaceholder());
    const trigger = screen.getByTestId("trigger");

    fireEvent.click(trigger);

    await waitFor(() => {
      const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
      expect(kickflipOption).toHaveAttribute("data-highlighted", "");
      expect(input).toHaveAttribute("aria-activedescendant", kickflipOption.id);
    });

    fireEvent.change(input, { target: { value: "heel" } });
    await waitFor(() => {
      const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
      expect(heelflipOption).toHaveAttribute("data-highlighted", "");
      expect(input).toHaveAttribute("aria-activedescendant", heelflipOption.id);
    });
  });

  test("handles badge list orientation", async () => {
    renderCombobox({
      value: ["kickflip", "heelflip"],
      multiple: true,
    });

    const horizontalBadgeList = screen.getByRole("listbox");
    expect(horizontalBadgeList).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
    expect(horizontalBadgeList).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );

    cleanup();
    renderCombobox({
      value: ["kickflip", "heelflip"],
      multiple: true,
      badgeListOrientation: "vertical",
    });

    const verticalBadgeList = screen.getByRole("listbox");
    expect(verticalBadgeList).toHaveAttribute("data-orientation", "vertical");
    expect(verticalBadgeList).toHaveAttribute("aria-orientation", "vertical");
  });

  test("handles badge item highlighting", async () => {
    renderCombobox({
      value: ["kickflip", "heelflip"],
      multiple: true,
    });

    const badges = screen.getAllByRole("option");

    const firstBadge = badges[0];
    if (firstBadge) {
      fireEvent.focus(firstBadge);
      await waitFor(() => {
        expect(firstBadge).toHaveAttribute("data-highlighted", "");
        expect(firstBadge).toHaveAttribute("aria-selected", "true");
      });
    }

    const secondBadge = badges[1];
    if (secondBadge) {
      fireEvent.focus(secondBadge);
      await waitFor(() => {
        expect(secondBadge).toHaveAttribute("data-highlighted", "");
        expect(secondBadge).toHaveAttribute("aria-selected", "true");
        expect(firstBadge).not.toHaveAttribute("data-highlighted");
        expect(firstBadge).not.toHaveAttribute("aria-selected", "true");
      });

      fireEvent.blur(secondBadge);
      await waitFor(() => {
        expect(secondBadge).not.toHaveAttribute("data-highlighted");
        expect(secondBadge).not.toHaveAttribute("aria-selected", "true");
      });
    }
  });

  test("handles badge list keyboard navigation", async () => {
    const onValueChange = vi.fn();

    renderCombobox({
      value: ["kickflip", "heelflip"],
      onValueChange,
      multiple: true,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder(true));
    const badges = screen.getAllByRole("option");

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(badges[1]).toHaveAttribute("data-highlighted", "");
      expect(badges[1]).toHaveAttribute("aria-selected", "true");
    });

    fireEvent.keyDown(input, { key: "ArrowLeft" });
    await waitFor(() => {
      expect(badges[0]).toHaveAttribute("data-highlighted", "");
      expect(badges[0]).toHaveAttribute("aria-selected", "true");
    });

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["heelflip"]);

    fireEvent.keyDown(input, { key: "ArrowRight" });
    await waitFor(() => {
      expect(badges[0]).not.toHaveAttribute("data-highlighted");
      expect(badges[0]).not.toHaveAttribute("aria-selected", "true");
    });
  });

  test("handles backspace and delete with empty input to remove last badge", async () => {
    const onValueChange = vi.fn();
    renderCombobox({
      value: ["kickflip", "heelflip"],
      multiple: true,
      onValueChange,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder(true));

    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip"]);

    onValueChange.mockReset();
    fireEvent.keyDown(input, { key: "Delete" });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip"]);
  });

  test("handles backspace and delete with highlighted badge", async () => {
    const onValueChange = vi.fn();
    renderCombobox({
      value: ["kickflip", "heelflip", "fs-540"],
      multiple: true,
      onValueChange,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder(true));
    const badges = screen.getAllByRole("option");

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    fireEvent.keyDown(input, { key: "ArrowLeft" });

    await waitFor(() => {
      expect(badges[1]).toHaveAttribute("data-highlighted", "");
    });

    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onValueChange).toHaveBeenCalledWith(["kickflip", "fs-540"]);

    const updatedBadges = screen.getAllByRole("option");
    await waitFor(() => {
      expect(updatedBadges[0]).toHaveAttribute("data-highlighted", "");
    });

    onValueChange.mockReset();
    fireEvent.keyDown(input, { key: "Delete" });
    expect(onValueChange).toHaveBeenCalledWith(["heelflip", "fs-540"]);

    fireEvent.keyDown(input, { key: "ArrowRight" });
    fireEvent.keyDown(input, { key: "ArrowRight" });
    fireEvent.focus(input);

    const finalBadges = screen.getAllByRole("option");
    await waitFor(() => {
      expect(finalBadges[0]).not.toHaveAttribute("data-highlighted");
    });
  });

  test("handles backspace and delete with non-empty input", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();

    renderCombobox({
      value: ["kickflip", "heelflip"],
      multiple: true,
      onValueChange,
      onInputValueChange,
    });

    const input = screen.getByPlaceholderText(getInputPlaceholder(true));

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "test" } });

    await waitFor(() => {
      expect(onInputValueChange).toHaveBeenCalledWith("test");
    });

    onValueChange.mockReset();

    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "Delete" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("supports accessibility features", () => {
    renderCombobox();

    const input = screen.getByPlaceholderText(getInputPlaceholder());
    const label = screen.getByText("Favorite tricks");
    expect(input).toHaveAttribute("role", "combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(label).toHaveAttribute("for", input.id);
  });

  test("handles badge item accessibility attributes", async () => {
    renderCombobox({
      value: ["kickflip", "heelflip"],
      multiple: true,
    });

    const badges = screen.getAllByRole("option");
    expect(badges).toHaveLength(2);

    expect(badges[0]).toHaveAttribute("aria-posinset", "1");
    expect(badges[0]).toHaveAttribute("aria-setsize", "2");
    expect(badges[0]).toHaveAttribute("aria-orientation", "horizontal");
    expect(badges[0]).toHaveAttribute("data-orientation", "horizontal");

    expect(badges[1]).toHaveAttribute("aria-posinset", "2");
    expect(badges[1]).toHaveAttribute("aria-setsize", "2");
  });
});
