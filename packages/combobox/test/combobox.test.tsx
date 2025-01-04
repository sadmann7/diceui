import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { describe, expect, test, vi } from "vitest";

import * as Combobox from "../src/index";

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add to global
global.ResizeObserver = ResizeObserver;

// Mock pointer capture methods
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.hasPointerCapture = vi.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

interface ComboboxProps extends React.ComponentProps<typeof Combobox.Root> {
  dir?: "ltr" | "rtl";
}

describe("Combobox", () => {
  const renderCombobox = (props: ComboboxProps = {}) => {
    return render(
      <div dir={props.dir}>
        <Combobox.Root {...props}>
          <Combobox.Label>Favorite tricks</Combobox.Label>
          <Combobox.Anchor>
            <Combobox.Input placeholder="Select a trick..." />
            <Combobox.Trigger>&#9660;</Combobox.Trigger>
          </Combobox.Anchor>
          <Combobox.Portal>
            <Combobox.Content role="listbox">
              <Combobox.Item value="kickflip">Kickflip</Combobox.Item>
              <Combobox.Item value="heelflip">Heelflip</Combobox.Item>
              <Combobox.Item value="fs-540">FS 540</Combobox.Item>
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox.Root>
      </div>,
    );
  };

  test("renders without crashing", () => {
    renderCombobox();
    expect(screen.getByText("Favorite tricks")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Select a trick..."),
    ).toBeInTheDocument();
  });

  // test("handles controlled state", async () => {
  //   const user = userEvent.setup();
  //   const onValueChange = vi.fn();
  //   const onOpenChange = vi.fn();

  //   render(
  //     <Combobox.Root
  //       value="kickflip"
  //       onValueChange={onValueChange}
  //       onOpenChange={onOpenChange}
  //     >
  //       <Combobox.Label>Favorite tricks</Combobox.Label>
  //       <Combobox.Anchor>
  //         <Combobox.Input placeholder="Select a trick..." />
  //         <Combobox.Trigger data-testid="controlled-trigger">
  //           &#9660;
  //         </Combobox.Trigger>
  //       </Combobox.Anchor>
  //       <Combobox.Portal>
  //         <Combobox.Content>
  //           <Combobox.Item value="kickflip">Kickflip</Combobox.Item>
  //           <Combobox.Item value="heelflip">Heelflip</Combobox.Item>
  //         </Combobox.Content>
  //       </Combobox.Portal>
  //     </Combobox.Root>,
  //   );

  //   const trigger = screen.getByTestId("controlled-trigger");
  //   await user.click(trigger);

  //   await waitFor(() => {
  //     expect(onOpenChange).toHaveBeenCalledWith(true);
  //   });

  //   const listbox = await screen.findByRole("listbox");
  //   expect(listbox).toBeInTheDocument();

  //   const heelflipOption = screen.getByText("Heelflip");
  //   await user.click(heelflipOption);
  //   expect(onValueChange).toHaveBeenCalledWith("heelflip");
  // });

  // test("handles uncontrolled state", async () => {
  //   const user = userEvent.setup();
  //   const onValueChange = vi.fn();

  //   renderCombobox({ defaultValue: "kickflip", onValueChange });

  //   const trigger = screen.getByRole("button");
  //   await user.click(trigger);

  //   const listbox = await screen.findByRole("listbox");
  //   expect(listbox).toBeInTheDocument();

  //   const heelflipOption = screen.getByText("Heelflip");
  //   await user.click(heelflipOption);
  //   expect(onValueChange).toHaveBeenCalledWith("heelflip");
  // });

  // test("handles multiple selection", async () => {
  //   const user = userEvent.setup();
  //   const onValueChange = vi.fn();

  //   render(
  //     <Combobox.Root multiple onValueChange={onValueChange}>
  //       <Combobox.Label>Favorite tricks</Combobox.Label>
  //       <Combobox.Anchor>
  //         <Combobox.Input placeholder="Select tricks..." />
  //         <Combobox.Trigger>&#9660;</Combobox.Trigger>
  //       </Combobox.Anchor>
  //       <Combobox.Portal>
  //         <Combobox.Content>
  //           <Combobox.Item value="kickflip">Kickflip</Combobox.Item>
  //           <Combobox.Item value="heelflip">Heelflip</Combobox.Item>
  //         </Combobox.Content>
  //       </Combobox.Portal>
  //     </Combobox.Root>,
  //   );

  //   const trigger = screen.getByRole("button");
  //   await user.click(trigger);

  //   const listbox = await screen.findByRole("listbox");
  //   expect(listbox).toBeInTheDocument();

  //   const kickflipOption = screen.getByText("Kickflip");
  //   await user.click(kickflipOption);
  //   expect(onValueChange).toHaveBeenCalledWith(["kickflip"]);

  //   const heelflipOption = screen.getByText("Heelflip");
  //   await user.click(heelflipOption);
  //   expect(onValueChange).toHaveBeenCalledWith(["kickflip", "heelflip"]);
  // });

  // test("handles filtering", async () => {
  //   const user = userEvent.setup();
  //   const onFilter = vi.fn((options: string[], term: string) =>
  //     options.filter((option: string) => option.includes(term.toLowerCase())),
  //   );

  //   render(
  //     <Combobox.Root onFilter={onFilter}>
  //       <Combobox.Label>Favorite tricks</Combobox.Label>
  //       <Combobox.Anchor>
  //         <Combobox.Input placeholder="Select a trick..." />
  //         <Combobox.Trigger>&#9660;</Combobox.Trigger>
  //       </Combobox.Anchor>
  //       <Combobox.Portal>
  //         <Combobox.Content role="listbox">
  //           <Combobox.Item value="kickflip">Kickflip</Combobox.Item>
  //           <Combobox.Item value="heelflip">Heelflip</Combobox.Item>
  //           <Combobox.Item value="fs-540">FS 540</Combobox.Item>
  //         </Combobox.Content>
  //       </Combobox.Portal>
  //     </Combobox.Root>,
  //   );

  //   const trigger = screen.getByRole("button");
  //   await user.click(trigger);

  //   const input = screen.getByPlaceholderText("Select a trick...");
  //   await user.type(input, "flip");

  //   await waitFor(() => {
  //     expect(onFilter).toHaveBeenCalled();
  //   });
  // });

  test("handles disabled state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCombobox({ disabled: true, onValueChange });

    const input = screen.getByPlaceholderText("Select a trick...");
    expect(input).toBeDisabled();

    await user.click(input);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles read-only state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderCombobox({
      readOnly: true,
      defaultValue: "kickflip",
      onValueChange,
    });

    const input = screen.getByPlaceholderText("Select a trick...");
    expect(input).toHaveAttribute("readonly");

    await user.type(input, "new value");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("handles keyboard navigation", async () => {
    const user = userEvent.setup();
    renderCombobox({ defaultOpen: true });

    const listbox = await screen.findByRole("listbox");
    expect(listbox).toBeInTheDocument();

    // Navigate to next item
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");

    // Select with Enter
    await user.keyboard("{Enter}");
    const input = screen.getByPlaceholderText("Select a trick...");
    expect(input).toHaveValue("Heelflip");
  });

  test("supports RTL direction", () => {
    renderCombobox({ dir: "rtl" });
    const root = screen.getByRole("combobox").closest("div[dir]");
    expect(root).toHaveAttribute("dir", "rtl");
  });

  test("supports accessibility features", () => {
    renderCombobox();

    const input = screen.getByPlaceholderText("Select a trick...");
    expect(input).toHaveAttribute("role", "combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});
