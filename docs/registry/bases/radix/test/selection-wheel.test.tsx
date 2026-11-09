import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "radix-ui";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SelectionWheel,
  SelectionWheelArea,
  SelectionWheelContent,
  SelectionWheelIndicator,
  SelectionWheelItem,
  SelectionWheelLabel,
  SelectionWheelSub,
  SelectionWheelSubContent,
  SelectionWheelSubTrigger,
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

function AreaWheel(
  props: React.ComponentProps<typeof SelectionWheel> & { openKey?: string },
) {
  const { openKey, ...rootProps } = props;
  return (
    <SelectionWheel {...rootProps}>
      <SelectionWheelArea data-testid="area" openKey={openKey}>
        Canvas
      </SelectionWheelArea>
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

function NestedWheel(
  props: React.ComponentProps<typeof SelectionWheel> & { overlay?: boolean },
) {
  const { overlay, ...rootProps } = props;
  return (
    <SelectionWheel {...rootProps}>
      {overlay ? (
        <SelectionWheelTrigger data-testid="trigger">
          Open
        </SelectionWheelTrigger>
      ) : null}
      <SelectionWheelContent data-testid="content" aria-label="Weapon">
        <SelectionWheelItem value="sword" label="Sword">
          Sword
        </SelectionWheelItem>
        <SelectionWheelSub>
          <SelectionWheelSubTrigger value="magic" label="Magic">
            Magic
          </SelectionWheelSubTrigger>
          <SelectionWheelSubContent>
            <SelectionWheelItem value="fire" label="Fire">
              Fire
            </SelectionWheelItem>
            <SelectionWheelItem value="ice" label="Ice">
              Ice
            </SelectionWheelItem>
            <SelectionWheelItem value="bolt" label="Bolt">
              Bolt
            </SelectionWheelItem>
          </SelectionWheelSubContent>
        </SelectionWheelSub>
        <SelectionWheelItem value="bow" label="Bow">
          Bow
        </SelectionWheelItem>
        <SelectionWheelLabel data-testid="label">Pick</SelectionWheelLabel>
      </SelectionWheelContent>
    </SelectionWheel>
  );
}

function expectCenteredAt(x: number, y: number) {
  fireEvent.pointerMove(screen.getByTestId("content"), {
    clientX: x,
    clientY: y - 100,
  });
  expect(screen.getByRole("radio", { name: "Sword" })).toHaveAttribute(
    "data-highlighted",
  );
}

describe("SelectionWheel", () => {
  describe("inline", () => {
    it("hides items until they are positioned", () => {
      const html = renderToString(<Wheel />);
      const hidden = html.match(/visibility:hidden/g) ?? [];
      expect(hidden).toHaveLength(4);

      render(<Wheel />);
      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).not.toHaveStyle({ visibility: "hidden" });
      }
    });

    it("renders the wheel on the server", () => {
      const html = renderToString(<Wheel />);

      expect(html).toContain('data-slot="selection-wheel-content"');
      expect(html).toContain('data-mode="inline"');
    });

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

    it("picks nothing on a click in the center", () => {
      const onValueChange = vi.fn();
      render(<Wheel defaultValue="axe" onValueChange={onValueChange} />);

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
      fireEvent.pointerDown(content, {
        button: 0,
        pointerId: 1,
        clientX: 120,
        clientY: 120,
      });
      content.focus();
      fireEvent.click(content, { clientX: 120, clientY: 120, detail: 1 });

      expect(onValueChange).not.toHaveBeenCalled();
      expect(content).not.toHaveAttribute("aria-activedescendant");
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

  describe("content presses", () => {
    const rect = {
      left: 0,
      top: 0,
      width: 240,
      height: 240,
      right: 240,
      bottom: 240,
      x: 0,
      y: 0,
      toJSON: () => {},
    };

    it("picks once on touch drag and release", () => {
      const onSelect = vi.fn();
      render(
        <SelectionWheel type="menu">
          <SelectionWheelContent data-testid="content" aria-label="Actions">
            <SelectionWheelItem value="copy" label="Copy" onSelect={onSelect}>
              Copy
            </SelectionWheelItem>
            <SelectionWheelItem value="share" label="Share">
              Share
            </SelectionWheelItem>
          </SelectionWheelContent>
        </SelectionWheel>,
      );
      const content = screen.getByTestId("content");
      content.getBoundingClientRect = () => rect;

      fireEvent.pointerDown(content, {
        button: 0,
        pointerId: 1,
        pointerType: "touch",
        clientX: 120,
        clientY: 120,
      });
      fireEvent.pointerMove(content, {
        pointerId: 1,
        pointerType: "touch",
        clientX: 120,
        clientY: 20,
      });
      fireEvent.pointerUp(content, {
        pointerId: 1,
        pointerType: "touch",
        clientX: 120,
        clientY: 20,
      });
      expect(onSelect).toHaveBeenCalledTimes(1);

      fireEvent.click(content);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("clears the highlight when the press is cancelled", () => {
      render(<Wheel />);
      const content = screen.getByTestId("content");
      content.getBoundingClientRect = () => rect;

      fireEvent.pointerDown(content, {
        button: 0,
        pointerId: 1,
        pointerType: "touch",
        clientX: 220,
        clientY: 120,
      });
      expect(content).toHaveAttribute("aria-activedescendant");

      fireEvent.pointerCancel(content, { pointerId: 1, pointerType: "touch" });
      expect(content).not.toHaveAttribute("aria-activedescendant");
    });
  });

  describe("nested", () => {
    it("shows only the top level at first", () => {
      render(<NestedWheel />);

      const radios = screen.getAllByRole("radio");
      expect(radios.map((radio) => radio.getAttribute("aria-label"))).toEqual([
        "Sword",
        "Magic",
        "Bow",
      ]);
      expect(radios[1]).toHaveAttribute("data-sub");
      expect(radios[1]).toHaveAttribute("aria-setsize", "3");
    });

    it("opens the sub wheel without picking", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NestedWheel onValueChange={onValueChange} />);

      await user.click(screen.getByRole("radio", { name: "Magic" }));

      expect(onValueChange).not.toHaveBeenCalled();
      const radios = screen.getAllByRole("radio");
      expect(radios.map((radio) => radio.getAttribute("aria-label"))).toEqual([
        "Fire",
        "Ice",
        "Bolt",
      ]);
      expect(radios[1]).toHaveAttribute("aria-posinset", "2");
      expect(radios[1]).toHaveStyle({ "--selection-wheel-angle": "120deg" });
      expect(screen.getByTestId("label")).toHaveTextContent("Magic");
    });

    it("picks inside the sub wheel and marks its trigger checked", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NestedWheel onValueChange={onValueChange} />);

      await user.click(screen.getByRole("radio", { name: "Magic" }));
      await user.click(screen.getByRole("radio", { name: "Ice" }));
      expect(onValueChange).toHaveBeenCalledWith("ice");

      screen.getByTestId("content").focus();
      await user.keyboard("{Escape}");

      expect(screen.getByRole("radio", { name: "Magic" })).toHaveAttribute(
        "aria-checked",
        "true",
      );
      expect(screen.getByTestId("label")).toHaveTextContent("Ice");
    });

    it("goes back on Backspace and Escape", async () => {
      const user = userEvent.setup();
      render(<NestedWheel />);

      screen.getByTestId("content").focus();
      await user.keyboard("{ArrowRight}{Enter}");
      expect(screen.getByRole("radio", { name: "Fire" })).toBeInTheDocument();

      await user.keyboard("{Backspace}");
      expect(screen.getByRole("radio", { name: "Magic" })).toBeInTheDocument();

      await user.keyboard("{ArrowRight}{Enter}{Escape}");
      expect(screen.getByRole("radio", { name: "Magic" })).toBeInTheDocument();
    });

    it("goes back on a click in the center", async () => {
      const user = userEvent.setup();
      render(<NestedWheel />);

      await user.click(screen.getByRole("radio", { name: "Magic" }));

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
      fireEvent.pointerDown(content, { button: 0, clientX: 120, clientY: 120 });
      fireEvent.click(content, { clientX: 120, clientY: 120, detail: 1 });

      expect(screen.getByRole("radio", { name: "Magic" })).toBeInTheDocument();
    });

    it("steps back before closing the overlay on Escape", async () => {
      const user = userEvent.setup();
      render(<NestedWheel overlay />);

      fireEvent.click(screen.getByTestId("trigger"));
      await user.keyboard("{ArrowRight}{Enter}");
      expect(screen.getByRole("radio", { name: "Fire" })).toBeInTheDocument();

      await user.keyboard("{Escape}");
      expect(screen.getByRole("radio", { name: "Magic" })).toBeInTheDocument();

      await user.keyboard("{Escape}");
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });

    it("starts at the top level when reopened", async () => {
      const user = userEvent.setup();
      render(<NestedWheel overlay />);

      fireEvent.click(screen.getByTestId("trigger"));
      await user.keyboard("{ArrowRight}{Enter}");
      await user.keyboard("{Tab}");
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("radio", { name: "Magic" })).toBeInTheDocument();
    });
  });

  describe("area", () => {
    it("opens at the pointer on right-click", () => {
      render(<AreaWheel />);
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();

      fireEvent.contextMenu(screen.getByTestId("area"), {
        clientX: 300,
        clientY: 300,
      });

      expect(screen.getByTestId("content")).toHaveAttribute(
        "data-mode",
        "overlay",
      );
      expectCenteredAt(300, 300);
    });

    it("picks on right-button drag and release", () => {
      const onValueChange = vi.fn();
      render(<AreaWheel onValueChange={onValueChange} />);

      fireEvent.contextMenu(screen.getByTestId("area"), {
        clientX: 300,
        clientY: 300,
        buttons: 2,
      });
      fireEvent.pointerMove(document, { clientX: 300, clientY: 200 });
      fireEvent.pointerUp(document, { clientX: 300, clientY: 200 });

      expect(onValueChange).toHaveBeenCalledWith("sword");
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });

    it("stays open after a right-click without dragging", () => {
      render(<AreaWheel />);

      fireEvent.contextMenu(screen.getByTestId("area"), {
        clientX: 300,
        clientY: 300,
        buttons: 2,
      });
      fireEvent.pointerMove(document, { clientX: 302, clientY: 301 });
      fireEvent.pointerUp(document, { clientX: 302, clientY: 301 });

      expect(screen.getByTestId("content")).toHaveFocus();
    });

    it("picks on key hold and release", () => {
      const onValueChange = vi.fn();
      render(<AreaWheel openKey="q" onValueChange={onValueChange} />);

      const area = screen.getByTestId("area");
      area.focus();
      fireEvent.pointerMove(area, { clientX: 300, clientY: 300 });
      fireEvent.keyDown(area, { key: "q" });
      expect(screen.getByTestId("content")).toBeInTheDocument();

      fireEvent.pointerMove(document, { clientX: 300, clientY: 200 });
      fireEvent.keyUp(document, { key: "q" });

      expect(onValueChange).toHaveBeenCalledWith("sword");
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
      expect(area).toHaveFocus();
    });

    it("cancels when the key is released without a pick", () => {
      const onValueChange = vi.fn();
      render(<AreaWheel openKey="q" onValueChange={onValueChange} />);

      const area = screen.getByTestId("area");
      area.focus();
      fireEvent.keyDown(area, { key: "q" });
      expect(screen.getByTestId("content")).toBeInTheDocument();
      expect(
        screen.getByTestId("content").querySelector("[data-highlighted]"),
      ).toBeNull();

      fireEvent.keyUp(document, { key: "q" });

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
      expect(area).toHaveFocus();
    });
  });

  describe("overlay", () => {
    it("keeps focus on the wheel after a tap", () => {
      render(<OverlayWheel defaultValue="axe" />);

      const trigger = screen.getByTestId("trigger");
      fireEvent.pointerDown(trigger, {
        button: 0,
        pointerId: 1,
        clientX: 300,
        clientY: 300,
      });
      trigger.focus();
      fireEvent.pointerUp(trigger, {
        pointerId: 1,
        clientX: 300,
        clientY: 300,
      });

      const content = screen.getByTestId("content");
      expect(content).toHaveFocus();
      expect(screen.getByRole("radio", { name: "Axe" })).toHaveAttribute(
        "data-highlighted",
      );
    });

    it("centers on the trigger when opened by prop", () => {
      render(<OverlayWheel defaultOpen />);

      expectCenteredAt(128, 128);
    });

    it("returns focus to the trigger when closed by prop", () => {
      const { rerender } = render(<OverlayWheel open />);
      expect(screen.getByTestId("content")).toHaveFocus();

      rerender(<OverlayWheel open={false} />);

      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
      expect(screen.getByTestId("trigger")).toHaveFocus();
    });

    it("ignores jitter after a press near the viewport edge", () => {
      const onValueChange = vi.fn();
      render(<OverlayWheel onValueChange={onValueChange} />);

      const trigger = screen.getByTestId("trigger");
      fireEvent.pointerDown(trigger, {
        button: 0,
        pointerId: 1,
        clientX: 0,
        clientY: 0,
      });
      fireEvent.pointerMove(trigger, {
        pointerId: 1,
        clientX: 2,
        clientY: 1,
      });
      expect(
        screen.getByTestId("content").querySelector("[data-highlighted]"),
      ).toBeNull();

      fireEvent.pointerUp(trigger, { pointerId: 1, clientX: 2, clientY: 1 });
      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("highlights once the pointer travels past the threshold", () => {
      render(<OverlayWheel />);

      const trigger = screen.getByTestId("trigger");
      fireEvent.pointerDown(trigger, {
        button: 0,
        pointerId: 1,
        clientX: 300,
        clientY: 300,
      });
      fireEvent.pointerMove(trigger, {
        pointerId: 1,
        clientX: 300,
        clientY: 200,
      });
      expect(screen.getByRole("radio", { name: "Sword" })).toHaveAttribute(
        "data-highlighted",
      );
    });

    it("renders no wheel on the server", () => {
      const html = renderToString(<OverlayWheel />);

      expect(html).toContain('data-slot="selection-wheel-trigger"');
      expect(html).not.toContain('data-slot="selection-wheel-content"');
    });

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
      expect(content).toBeInTheDocument();

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
      expectCenteredAt(128, 128);
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

        vi.advanceTimersByTime(1);
        fireEvent.pointerDown(screen.getByTestId("outside"));
        fireEvent.click(screen.getByTestId("outside"));
        vi.advanceTimersByTime(1);

        expect(onOpenChange).toHaveBeenLastCalledWith(false);
        expect(screen.queryByTestId("content")).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });

    it("closes on Tab and returns focus to the trigger", async () => {
      const user = userEvent.setup();
      render(<OverlayWheel />);

      fireEvent.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveFocus();

      await user.keyboard("{Tab}");

      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
      expect(screen.getByTestId("trigger")).toHaveFocus();
    });

    it("closes only the wheel on Escape inside a dialog", async () => {
      const user = userEvent.setup();
      render(
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <Dialog.Content data-testid="dialog" aria-describedby={undefined}>
              <Dialog.Title>Dialog</Dialog.Title>
              <OverlayWheel />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>,
      );

      fireEvent.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveFocus();

      await user.keyboard("{Escape}");

      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByTestId("trigger")).toHaveFocus();
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
