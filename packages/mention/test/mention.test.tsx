import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import * as Mention from "../src/index";

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

// Mock getComputedStyle
global.getComputedStyle = vi.fn().mockReturnValue({
  getPropertyValue: () => "16px",
  lineHeight: "24px",
});

describe("Mention", () => {
  function renderMention(props: Mention.MentionRootProps = {}) {
    return render(
      <Mention.Root {...props}>
        <Mention.Label>Mention users</Mention.Label>
        <Mention.Input placeholder="Type @ to mention..." />
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
    expect(
      screen.getByPlaceholderText("Type @ to mention..."),
    ).toBeInTheDocument();
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

    const input = screen.getByPlaceholderText("Type @ to mention...");

    // Test initial state
    expect(input).toHaveValue("");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    // Test opening mention list with trigger
    await userEvent.type(input, "@");
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Test selecting a mention
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

    const input = screen.getByPlaceholderText("Type @ to mention...");

    // Open mention list
    await userEvent.type(input, "@");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Wait for requestAnimationFrame to complete
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Navigate to first option
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options[1]).toHaveAttribute("data-highlighted", "");
    });

    // Select highlighted option
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["heelflip"]);
    expect(input).toHaveValue("@heelflip ");
  });

  test("handles disabled state", async () => {
    const onValueChange = vi.fn();
    renderMention({ disabled: true, onValueChange });

    const input = screen.getByPlaceholderText("Type @ to mention...");
    expect(input).toBeDisabled();

    await userEvent.type(input, "@kickflip");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles read only state", async () => {
    const onValueChange = vi.fn();
    renderMention({ readonly: true, onValueChange });

    const input = screen.getByPlaceholderText("Type @ to mention...");
    expect(input).toHaveAttribute("readonly");

    await userEvent.type(input, "@kickflip");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles default filtering", async () => {
    renderMention();
    const input = screen.getByPlaceholderText("Type @ to mention...");

    // Open mention list
    await userEvent.type(input, "@");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Type to filter
    await userEvent.type(input, "kck");
    await waitFor(() => {
      expect(screen.getByText("Kickflip")).toBeInTheDocument();
      expect(screen.queryByText("Heelflip")).not.toBeInTheDocument();
      expect(screen.queryByText("FS 540")).not.toBeInTheDocument();
    });
  });

  test("handles exact match filtering", async () => {
    renderMention({ exactMatch: true });
    const input = screen.getByPlaceholderText("Type @ to mention...");

    // Open mention list
    await userEvent.type(input, "@");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Type exact match
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
    const input = screen.getByPlaceholderText("Type @ to mention...");

    // Open mention list
    await userEvent.type(input, "@");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Type to filter with custom case-insensitive filter
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

    const input = screen.getByPlaceholderText("Type @ to mention...");

    // Test that @ doesn't trigger the mention list
    await userEvent.type(input, "@");
    expect(onOpenChange).not.toHaveBeenCalledWith(true);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    // Clear the input and wait for state to update
    fireEvent.change(input, { target: { value: "" } });

    // Test that # triggers the mention list
    fireEvent.change(input, { target: { value: "#" } });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  test("supports RTL direction", async () => {
    renderMention({ dir: "rtl" });
    const input = screen.getByPlaceholderText("Type @ to mention...");

    await userEvent.type(input, "@");

    const content = screen.getByRole("listbox");

    await waitFor(() => {
      expect(content).toBeInTheDocument();
    });

    expect(input).toHaveAttribute("dir", "rtl");
    expect(content).toHaveAttribute("dir", "rtl");
  });

  test("supports accessibility features", () => {
    renderMention();
    const input = screen.getByPlaceholderText("Type @ to mention...");
    const label = screen.getByText("Mention users");

    expect(input).toHaveAttribute("role", "combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(label).toHaveAttribute("for", input.id);
  });
});
