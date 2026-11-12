import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import * as Mention from "../src/index";

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

global.getComputedStyle = vi.fn().mockReturnValue({
  getPropertyValue: () => "16px",
  lineHeight: "24px",
});

const placeholder = "Type @ to mention...";

describe("Mention", () => {
  function renderMention(props: Mention.MentionRootProps = {}) {
    return render(
      <Mention.Root {...props}>
        <Mention.Label>Mention users</Mention.Label>
        <Mention.Input placeholder={placeholder} />
        <Mention.Portal>
          <Mention.Content>
            <Mention.Item value="kickflip">Kickflip</Mention.Item>
            <Mention.Item value="heelflip">Heelflip</Mention.Item>
            <Mention.Item value="fs-540">FS 540</Mention.Item>
          </Mention.Content>
        </Mention.Portal>
      </Mention.Root>,
    );
  }

  test("renders without crashing", () => {
    renderMention();
    expect(screen.getByText("Mention users")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  test("handles controlled state", async () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();

    renderMention({
      onOpenChange,
      onValueChange,
      onInputValueChange,
    });

    const input = screen.getByPlaceholderText(placeholder);

    expect(input).toHaveValue("");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await userEvent.type(input, "@");
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
    await waitFor(() => {
      fireEvent.click(kickflipOption);
    });

    expect(onValueChange).toHaveBeenCalledWith(["kickflip"]);
    expect(onInputValueChange).toHaveBeenCalledWith("@kickflip ");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("handles keyboard navigation", async () => {
    const onValueChange = vi.fn();
    renderMention({ onValueChange });

    const input = screen.getByPlaceholderText(placeholder);

    await userEvent.type(input, "@");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Wait for requestAnimationFrame to complete.
    await new Promise((resolve) => requestAnimationFrame(resolve));

    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options[1]).toHaveAttribute("data-highlighted", "");
    });

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["heelflip"]);
    expect(input).toHaveValue("@heelflip ");
  });

  test("handles disabled state", async () => {
    const onValueChange = vi.fn();
    renderMention({ disabled: true, onValueChange });

    const input = screen.getByPlaceholderText(placeholder);
    expect(input).toBeDisabled();

    await userEvent.type(input, "@kickflip");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles read only state", async () => {
    const onValueChange = vi.fn();
    renderMention({ readonly: true, onValueChange });

    const input = screen.getByPlaceholderText(placeholder);
    expect(input).toHaveAttribute("readonly");

    await userEvent.type(input, "@kickflip");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles default filtering", async () => {
    renderMention();
    const input = screen.getByPlaceholderText(placeholder);

    await userEvent.type(input, "@");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    await userEvent.type(input, "kck");
    await waitFor(() => {
      expect(screen.getByText("Kickflip")).toBeInTheDocument();
      expect(screen.queryByText("Heelflip")).not.toBeInTheDocument();
      expect(screen.queryByText("FS 540")).not.toBeInTheDocument();
    });
  });

  test("handles exact match filtering", async () => {
    renderMention({ exactMatch: true });
    const input = screen.getByPlaceholderText(placeholder);

    await userEvent.type(input, "@");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    await userEvent.type(input, "kickflip");
    await waitFor(() => {
      expect(screen.getByText("Kickflip")).toBeInTheDocument();
      expect(screen.queryByText("Heelflip")).not.toBeInTheDocument();
      expect(screen.queryByText("FS 540")).not.toBeInTheDocument();
    });
  });

  test("handles custom filtering", async () => {
    const customFilter = (options: string[], term: string) =>
      options.filter((option) =>
        option.toLowerCase().includes(term.toLowerCase()),
      );

    renderMention({ onFilter: customFilter });
    const input = screen.getByPlaceholderText(placeholder);

    await userEvent.type(input, "@");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    await userEvent.type(input, "KICKFLIP");
    await waitFor(() => {
      expect(screen.getByText("Kickflip")).toBeInTheDocument();
      expect(screen.queryByText("Heelflip")).not.toBeInTheDocument();
      expect(screen.queryByText("FS 540")).not.toBeInTheDocument();
    });
  });

  test("handles custom trigger character", async () => {
    const onOpenChange = vi.fn();
    renderMention({ trigger: "#", onOpenChange });

    const input = screen.getByPlaceholderText(placeholder);

    await userEvent.type(input, "@");
    expect(onOpenChange).not.toHaveBeenCalledWith(true);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    // Clear the input and wait for state to update.
    fireEvent.change(input, { target: { value: "" } });

    fireEvent.change(input, { target: { value: "#" } });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  test("supports RTL direction", async () => {
    renderMention({ dir: "rtl" });
    const input = screen.getByPlaceholderText(placeholder);

    await userEvent.type(input, "@");

    const content = screen.getByRole("listbox");

    await waitFor(() => {
      expect(content).toBeInTheDocument();
    });

    expect(input).toHaveAttribute("dir", "rtl");
    expect(content).toHaveAttribute("dir", "rtl");
  });

  test("handles backspace deletion of mentions", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    renderMention({ onValueChange, onInputValueChange });

    const input = screen.getByPlaceholderText(placeholder);

    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Input element not found");
    }

    await userEvent.type(input, "@kickflip");
    const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
    await waitFor(() => {
      fireEvent.click(kickflipOption);
    });

    input.setSelectionRange(9, 9); // Position cursor at end of mention.
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(onInputValueChange).toHaveBeenLastCalledWith("");

    fireEvent.change(input, { target: { value: "" } });
    onValueChange.mockClear();
    onInputValueChange.mockClear();

    await userEvent.type(input, "@kickflip");
    await waitFor(() => {
      fireEvent.click(kickflipOption);
    });

    input.setSelectionRange(10, 10); // After space.
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onValueChange).not.toHaveBeenCalled(); // Should only remove space.
    expect(onInputValueChange).toHaveBeenCalledWith("@kickflip");
  });

  test("handles Cmd/Ctrl backspace deletion of mentions", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    renderMention({ onValueChange, onInputValueChange });

    const input = screen.getByPlaceholderText(placeholder);

    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Input element not found");
    }

    await userEvent.type(input, "@kickflip");
    const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
    await waitFor(() => {
      fireEvent.click(kickflipOption);
    });

    await userEvent.type(input, "some text @heelflip");
    const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
    await waitFor(() => {
      fireEvent.click(heelflipOption);
    });

    input.setSelectionRange(29, 29); // End of input after "@heelflip ".
    fireEvent.keyDown(input, { key: "Backspace", metaKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith(["kickflip"]);
    expect(onInputValueChange).toHaveBeenLastCalledWith("@kickflip some text ");

    fireEvent.change(input, { target: { value: "@kickflip some text " } });

    onValueChange.mockClear();
    onInputValueChange.mockClear();

    input.setSelectionRange(9, 9); // After "@kickflip".
    fireEvent.keyDown(input, { key: "Backspace", metaKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(onInputValueChange).toHaveBeenLastCalledWith("some text ");
  });

  test("supports accessibility features", () => {
    renderMention();
    const input = screen.getByPlaceholderText(placeholder);
    const label = screen.getByText("Mention users");

    expect(input).toHaveAttribute("role", "combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(label).toHaveAttribute("for", input.id);
  });

  test("removes a mention in the middle of text and updates positions correctly", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();

    renderMention({ onValueChange, onInputValueChange });

    const input = screen.getByPlaceholderText(placeholder);

    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Input element not found");
    }

    await userEvent.type(input, "@kickflip");
    const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
    await waitFor(() => {
      fireEvent.click(kickflipOption);
    });

    await userEvent.type(input, "and @heelflip");
    const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
    await waitFor(() => {
      fireEvent.click(heelflipOption);
    });

    expect(input.value).toBe("@kickflip and @heelflip ");

    // After "@kickflip".
    input.setSelectionRange(9, 9);
    fireEvent.keyDown(input, { key: "Backspace", metaKey: true });

    await waitFor(() => {
      expect(onValueChange).toHaveBeenLastCalledWith(["heelflip"]);
      expect(onInputValueChange).toHaveBeenLastCalledWith("and @heelflip ");
    });

    expect(input.value).toBe("and @heelflip ");
  });

  test("allows mention trigger in middle of text and preserves text after", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    renderMention({ onValueChange, onInputValueChange });

    const input = screen.getByPlaceholderText(placeholder);

    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Input element not found");
    }

    await userEvent.type(input, "@kickflip");
    const kickflipOption = screen.getByRole("option", { name: "Kickflip" });
    await waitFor(() => {
      fireEvent.click(kickflipOption);
    });

    await userEvent.type(input, " and then ");

    await userEvent.type(input, "@heelflip");
    const heelflipOption = screen.getByRole("option", { name: "Heelflip" });
    await waitFor(() => {
      fireEvent.click(heelflipOption);
    });

    expect(input.value).toBe("@kickflip  and then @heelflip ");
    expect(onValueChange).toHaveBeenLastCalledWith(["kickflip", "heelflip"]);
  });
});
