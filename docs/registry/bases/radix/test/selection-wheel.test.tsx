import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  SelectionWheel,
  SelectionWheelContent,
  SelectionWheelIndicator,
  SelectionWheelItem,
  SelectionWheelLabel,
  SelectionWheelTrigger,
} from "@/registry/bases/radix/ui/selection-wheel";

const items = [
  { value: "sword", label: "Sword" },
  { value: "axe", label: "Axe" },
  { value: "bow", label: "Bow" },
  { value: "bomb", label: "Bomb", disabled: true },
];

function Wheel(props: React.ComponentProps<typeof SelectionWheel>) {
  return (
    <SelectionWheel {...props}>
      <SelectionWheelContent data-testid="content" aria-label="Weapon">
        <SelectionWheelIndicator data-testid="indicator" />
        {items.map((item) => (
          <SelectionWheelItem
            key={item.value}
            value={item.value}
            label={item.label}
            disabled={item.disabled}
          >
            {item.label}
          </SelectionWheelItem>
        ))}
        <SelectionWheelLabel data-testid="label">Pick</SelectionWheelLabel>
      </SelectionWheelContent>
    </SelectionWheel>
  );
}

function OverlayWheel(props: React.ComponentProps<typeof SelectionWheel>) {
  return (
    <SelectionWheel {...props}>
      <SelectionWheelTrigger data-testid="trigger">Open</SelectionWheelTrigger>
      <SelectionWheelContent data-testid="content" aria-label="Weapon">
        {items.map((item) => (
          <SelectionWheelItem
            key={item.value}
            value={item.value}
            label={item.label}
            disabled={item.disabled}
          >
            {item.label}
          </SelectionWheelItem>
        ))}
      </SelectionWheelContent>
    </SelectionWheel>
  );
}

describe("SelectionWheel", () => {
  describe("inline", () => {
    it("renders a radiogroup of radios with positions", () => {
      render(<Wheel defaultValue="axe" />);

      const content = screen.getByRole("radiogroup", { name: "Weapon" });
      expect(content).toHaveAttribute("data-mode", "inline");
      expect(content).toHaveAttribute("data-state", "open");

      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(4);
      expect(radios[0]).toHaveAttribute("aria-posinset", "1");
      expect(radios[0]).toHaveAttribute("aria-setsize", "4");
      expect(radios[1]).toHaveAttribute("aria-checked", "true");
      expect(radios[1]).toHaveAttribute("data-state", "checked");
      expect(radios[3]).toHaveAttribute("aria-disabled", "true");
      expect(content).toHaveStyle({ "--selection-wheel-slice": "90deg" });
      expect(radios[2]).toHaveStyle({ "--selection-wheel-angle": "180deg" });
    });

    it("shows the selected label in the center", () => {
      render(<Wheel defaultValue="axe" />);
      expect(screen.getByTestId("label")).toHaveTextContent("Axe");
    });

    it("shows the placeholder when nothing is selected", () => {
      render(<Wheel />);
      expect(screen.getByTestId("label")).toHaveTextContent("Pick");
      expect(screen.getByTestId("label")).toHaveAttribute(
        "data-state",
        "empty",
      );
    });

    it("selects an item on click", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Wheel onValueChange={onValueChange} />);

      await user.click(screen.getByRole("radio", { name: "Bow" }));

      expect(onValueChange).toHaveBeenCalledWith("bow");
      expect(screen.getByRole("radio", { name: "Bow" })).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    it("does not select a disabled item", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Wheel onValueChange={onValueChange} />);

      await user.click(screen.getByRole("radio", { name: "Bomb" }));

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("highlights by pointer angle", () => {
      render(<Wheel />);
      const content = screen.getByTestId("content");
      content.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 240,
        height: 240,
        right: 240,
        bottom: 240,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      // Right of center: 90deg, second slice.
      fireEvent.pointerMove(content, { clientX: 220, clientY: 120 });
      expect(screen.getByRole("radio", { name: "Axe" })).toHaveAttribute(
        "data-highlighted",
      );
      expect(content).toHaveAttribute(
        "aria-activedescendant",
        screen.getByRole("radio", { name: "Axe" }).id,
      );
      expect(screen.getByTestId("indicator")).toHaveAttribute(
        "data-state",
        "active",
      );

      // Inside the dead zone clears the highlight.
      fireEvent.pointerMove(content, { clientX: 125, clientY: 120 });
      expect(screen.getByRole("radio", { name: "Axe" })).not.toHaveAttribute(
        "data-highlighted",
      );
      expect(screen.getByTestId("indicator")).toHaveAttribute(
        "data-state",
        "inactive",
      );

      // Disabled slice at the left (270deg) highlights nothing.
      fireEvent.pointerMove(content, { clientX: 20, clientY: 120 });
      expect(content).not.toHaveAttribute("aria-activedescendant");
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Wheel defaultValue="sword" onValueChange={onValueChange} />);

      const content = screen.getByTestId("content");
      await user.tab();
      expect(content).toHaveFocus();
      expect(screen.getByRole("radio", { name: "Sword" })).toHaveAttribute(
        "data-highlighted",
      );

      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("radio", { name: "Axe" })).toHaveAttribute(
        "data-highlighted",
      );

      // Skips the disabled item and wraps.
      await user.keyboard("{ArrowRight}{ArrowRight}");
      expect(screen.getByRole("radio", { name: "Sword" })).toHaveAttribute(
        "data-highlighted",
      );

      await user.keyboard("{ArrowLeft}");
      expect(screen.getByRole("radio", { name: "Bow" })).toHaveAttribute(
        "data-highlighted",
      );

      await user.keyboard("{Home}");
      expect(screen.getByRole("radio", { name: "Sword" })).toHaveAttribute(
        "data-highlighted",
      );

      await user.keyboard("{End}");
      expect(screen.getByRole("radio", { name: "Bow" })).toHaveAttribute(
        "data-highlighted",
      );

      await user.keyboard("2");
      expect(screen.getByRole("radio", { name: "Axe" })).toHaveAttribute(
        "data-highlighted",
      );

      await user.keyboard("{Enter}");
      expect(onValueChange).toHaveBeenCalledWith("axe");

      await user.keyboard("{Escape}");
      expect(content).not.toHaveAttribute("aria-activedescendant");
    });

    it("swaps left and right in RTL", async () => {
      const user = userEvent.setup();
      render(<Wheel dir="rtl" defaultValue="sword" />);

      await user.tab();
      await user.keyboard("{ArrowLeft}");
      expect(screen.getByRole("radio", { name: "Axe" })).toHaveAttribute(
        "data-highlighted",
      );
    });

    it("supports controlled value", () => {
      const { rerender } = render(<Wheel value="sword" />);
      expect(screen.getByRole("radio", { name: "Sword" })).toHaveAttribute(
        "aria-checked",
        "true",
      );

      rerender(<Wheel value="bow" />);
      expect(screen.getByRole("radio", { name: "Bow" })).toHaveAttribute(
        "aria-checked",
        "true",
      );
      expect(screen.getByRole("radio", { name: "Sword" })).toHaveAttribute(
        "aria-checked",
        "false",
      );
    });

    it("does nothing when disabled", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Wheel disabled onValueChange={onValueChange} />);

      const content = screen.getByTestId("content");
      expect(content).toHaveAttribute("aria-disabled", "true");
      expect(content).toHaveAttribute("tabindex", "-1");

      await user.click(screen.getByRole("radio", { name: "Bow" }));
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("menu", () => {
    it("renders menu semantics and fires onSelect", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const onValueChange = vi.fn();

      render(
        <SelectionWheel type="menu" onValueChange={onValueChange}>
          <SelectionWheelContent aria-label="Actions">
            <SelectionWheelItem value="copy" label="Copy" onSelect={onSelect}>
              Copy
            </SelectionWheelItem>
            <SelectionWheelItem value="share" label="Share">
              Share
            </SelectionWheelItem>
          </SelectionWheelContent>
        </SelectionWheel>,
      );

      expect(screen.getByRole("menu", { name: "Actions" })).toBeInTheDocument();
      const item = screen.getByRole("menuitem", { name: "Copy" });
      expect(item).not.toHaveAttribute("aria-checked");

      await user.click(item);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("overlay", () => {
    it("is closed until the trigger is activated", () => {
      render(<OverlayWheel />);

      const trigger = screen.getByTestId("trigger");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });

    it("opens with the keyboard, centered on the trigger, and closes on Escape", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<OverlayWheel defaultValue="axe" onOpenChange={onOpenChange} />);

      const trigger = screen.getByTestId("trigger");
      await user.tab();
      expect(trigger).toHaveFocus();
      await user.keyboard("{Enter}");

      expect(onOpenChange).toHaveBeenCalledWith(true);
      const content = screen.getByTestId("content");
      expect(content).toHaveAttribute("data-mode", "overlay");
      expect(content).toHaveFocus();
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(trigger).toHaveAttribute("aria-controls", content.id);
      expect(screen.getByRole("radio", { name: "Axe" })).toHaveAttribute(
        "data-highlighted",
      );

      await user.keyboard("{Escape}");
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it("picks on press, drag and release", () => {
      const onValueChange = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <OverlayWheel
          onValueChange={onValueChange}
          onOpenChange={onOpenChange}
        />,
      );

      const trigger = screen.getByTestId("trigger");
      fireEvent.pointerDown(trigger, {
        button: 0,
        pointerId: 1,
        clientX: 300,
        clientY: 300,
      });
      expect(onOpenChange).toHaveBeenCalledWith(true);
      const content = screen.getByTestId("content");
      expect(content).toHaveStyle({ left: "300px", top: "300px" });

      // Straight up from the press point: first slice.
      fireEvent.pointerMove(trigger, {
        pointerId: 1,
        clientX: 300,
        clientY: 200,
      });
      expect(screen.getByRole("radio", { name: "Sword" })).toHaveAttribute(
        "data-highlighted",
      );

      fireEvent.pointerUp(trigger, {
        pointerId: 1,
        clientX: 300,
        clientY: 200,
      });
      expect(onValueChange).toHaveBeenCalledWith("sword");
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });

    it("stays open after a tap without dragging", () => {
      const onValueChange = vi.fn();
      render(<OverlayWheel onValueChange={onValueChange} />);

      const trigger = screen.getByTestId("trigger");
      fireEvent.pointerDown(trigger, {
        button: 0,
        pointerId: 1,
        clientX: 300,
        clientY: 300,
      });
      fireEvent.pointerUp(trigger, {
        pointerId: 1,
        clientX: 300,
        clientY: 300,
      });

      expect(screen.getByTestId("content")).toBeInTheDocument();
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("keeps the wheel inside the viewport", () => {
      render(<OverlayWheel />);

      fireEvent.pointerDown(screen.getByTestId("trigger"), {
        button: 0,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
      });

      // size 240 / 2 + 8px padding
      expect(screen.getByTestId("content")).toHaveStyle({
        left: "128px",
        top: "128px",
      });
    });

    it("closes on outside pointer down", async () => {
      vi.useFakeTimers();
      try {
        const onOpenChange = vi.fn();
        render(
          <div>
            <OverlayWheel onOpenChange={onOpenChange} />
            <button data-testid="outside">Outside</button>
          </div>,
        );

        fireEvent.click(screen.getByTestId("trigger"));
        expect(screen.getByTestId("content")).toBeInTheDocument();

        vi.runAllTimers();
        fireEvent.pointerDown(screen.getByTestId("outside"));

        expect(onOpenChange).toHaveBeenLastCalledWith(false);
        expect(screen.queryByTestId("content")).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });

    it("keeps the wheel open when onSelect prevents default", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn((event: Event) => event.preventDefault());

      render(
        <SelectionWheel>
          <SelectionWheelTrigger data-testid="trigger">
            Open
          </SelectionWheelTrigger>
          <SelectionWheelContent data-testid="content">
            <SelectionWheelItem value="sword" label="Sword" onSelect={onSelect}>
              Sword
            </SelectionWheelItem>
          </SelectionWheelContent>
        </SelectionWheel>,
      );

      fireEvent.click(screen.getByTestId("trigger"));
      await user.click(screen.getByRole("radio", { name: "Sword" }));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });
});
