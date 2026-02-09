import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialContent,
  SpeedDialItem,
  SpeedDialLabel,
  SpeedDialTrigger,
} from "@/registry/bases/radix/ui/speed-dial";

describe("SpeedDial", () => {
  function SpeedDialTest(props: React.ComponentProps<typeof SpeedDial>) {
    return (
      <SpeedDial {...props}>
        <SpeedDialTrigger data-testid="trigger">
          <span>+</span>
        </SpeedDialTrigger>
        <SpeedDialContent data-testid="content">
          <SpeedDialItem>
            <SpeedDialAction data-testid="action-home">
              <span>Home</span>
            </SpeedDialAction>
            <SpeedDialLabel>Home</SpeedDialLabel>
          </SpeedDialItem>
          <SpeedDialItem>
            <SpeedDialAction data-testid="action-share">
              <span>Share</span>
            </SpeedDialAction>
            <SpeedDialLabel>Share</SpeedDialLabel>
          </SpeedDialItem>
          <SpeedDialItem>
            <SpeedDialAction data-testid="action-edit">
              <span>Edit</span>
            </SpeedDialAction>
            <SpeedDialLabel>Edit</SpeedDialLabel>
          </SpeedDialItem>
        </SpeedDialContent>
      </SpeedDial>
    );
  }

  describe("Basic Rendering", () => {
    it("renders speed dial with trigger", () => {
      render(<SpeedDialTest />);

      const trigger = screen.getByTestId("trigger");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("renders with correct data attributes when closed", () => {
      render(<SpeedDialTest />);

      const trigger = screen.getByTestId("trigger");
      expect(trigger).toHaveAttribute("data-state", "closed");
    });

    it("does not render content when closed", () => {
      render(<SpeedDialTest />);

      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });
  });

  describe("Open/Close Behavior", () => {
    it("opens speed dial when trigger is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(<SpeedDialTest onOpenChange={onOpenChange} />);

      const trigger = screen.getByTestId("trigger");
      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("supports controlled open state", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      const { rerender } = render(
        <SpeedDialTest open={false} onOpenChange={onOpenChange} />,
      );

      const trigger = screen.getByTestId("trigger");
      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(true);

      // Simulate parent component updating open state
      rerender(<SpeedDialTest open onOpenChange={onOpenChange} />);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Disabled State", () => {
    it("disables trigger when disabled prop is true", () => {
      render(<SpeedDialTest disabled />);

      const trigger = screen.getByTestId("trigger");
      expect(trigger).toBeDisabled();
    });

    it("does not open when disabled", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(<SpeedDialTest disabled onOpenChange={onOpenChange} />);

      const trigger = screen.getByTestId("trigger");
      await user.click(trigger);

      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe("ARIA Attributes", () => {
    it("has correct ARIA attributes on trigger", () => {
      render(<SpeedDialTest />);

      const trigger = screen.getByTestId("trigger");
      expect(trigger).toHaveAttribute("role", "button");
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("aria-controls");
    });

    it("updates aria-expanded when opening", async () => {
      const user = userEvent.setup();
      render(<SpeedDialTest />);

      const trigger = screen.getByTestId("trigger");
      await user.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Bug Fixes - O(n²) Performance", () => {
    it("handles many children efficiently (O(n) not O(n²))", () => {
      function ManyItemsSpeedDial() {
        const items = Array.from({ length: 50 }, (_, i) => (
          <SpeedDialItem key={i}>
            <SpeedDialAction data-testid={`action-${i}`}>
              <span>Action {i}</span>
            </SpeedDialAction>
            <SpeedDialLabel>Action {i}</SpeedDialLabel>
          </SpeedDialItem>
        ));

        return (
          <SpeedDial defaultOpen>
            <SpeedDialTrigger data-testid="trigger">
              <span>+</span>
            </SpeedDialTrigger>
            <SpeedDialContent data-testid="content">{items}</SpeedDialContent>
          </SpeedDial>
        );
      }

      const start = performance.now();
      render(<ManyItemsSpeedDial />);
      const end = performance.now();
      const renderTime = end - start;

      // Should complete quickly even with 50 items
      // If O(n²) bug exists, this would take significantly longer
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe("Bug Fixes - Disabled State Updates", () => {
    it("updates disabled state properly when prop changes", () => {
      const { rerender } = render(<SpeedDialTest disabled={false} />);

      const trigger = screen.getByTestId("trigger");
      expect(trigger).not.toBeDisabled();

      rerender(<SpeedDialTest disabled />);

      expect(trigger).toBeDisabled();
    });
  });

  describe("Bug Fixes - Rapid Toggle", () => {
    it("handles rapid open/close without errors", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(<SpeedDialTest onOpenChange={onOpenChange} />);

      const trigger = screen.getByTestId("trigger");

      // Rapidly toggle
      await user.click(trigger); // Open
      await user.click(trigger); // Close immediately
      await user.click(trigger); // Open again

      // Should handle without errors
      expect(onOpenChange).toHaveBeenCalledTimes(3);
      expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
      expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
      expect(onOpenChange).toHaveBeenNthCalledWith(3, true);
    });
  });

  describe("Action Selection", () => {
    it("prevents closing when onSelect prevents default", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onSelect = vi.fn((event: Event) => {
        event.preventDefault();
      });

      function CustomSpeedDial() {
        return (
          <SpeedDial open onOpenChange={onOpenChange}>
            <SpeedDialTrigger data-testid="trigger">
              <span>+</span>
            </SpeedDialTrigger>
            <SpeedDialContent data-testid="content">
              <SpeedDialItem>
                <SpeedDialAction data-testid="action" onSelect={onSelect}>
                  <span>Home</span>
                </SpeedDialAction>
                <SpeedDialLabel>Home</SpeedDialLabel>
              </SpeedDialItem>
            </SpeedDialContent>
          </SpeedDial>
        );
      }

      render(<CustomSpeedDial />);

      const action = screen.getByTestId("action");
      await user.click(action);

      expect(onSelect).toHaveBeenCalled();
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });

    it("supports disabled actions", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      function CustomSpeedDial() {
        return (
          <SpeedDial open>
            <SpeedDialTrigger data-testid="trigger">
              <span>+</span>
            </SpeedDialTrigger>
            <SpeedDialContent data-testid="content">
              <SpeedDialItem>
                <SpeedDialAction
                  data-testid="action"
                  disabled
                  onSelect={onSelect}
                >
                  <span>Home</span>
                </SpeedDialAction>
                <SpeedDialLabel>Home</SpeedDialLabel>
              </SpeedDialItem>
            </SpeedDialContent>
          </SpeedDial>
        );
      }

      render(<CustomSpeedDial />);

      const action = screen.getByTestId("action");
      expect(action).toBeDisabled();

      await user.click(action);

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe("Side Variations", () => {
    it.each([
      "top",
      "bottom",
      "left",
      "right",
    ] as const)("renders with side=%s", (side) => {
      render(<SpeedDialTest open side={side} />);

      const content = screen.getByTestId("content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("data-side", side);
    });

    it("applies correct orientation for vertical sides", () => {
      render(<SpeedDialTest open side="top" />);

      const content = screen.getByTestId("content");
      expect(content).toHaveAttribute("aria-orientation", "vertical");
    });

    it("applies correct orientation for horizontal sides", () => {
      render(<SpeedDialTest open side="left" />);

      const content = screen.getByTestId("content");
      expect(content).toHaveAttribute("aria-orientation", "horizontal");
    });
  });

  describe("ForceMount", () => {
    it("keeps content mounted when forceMount is true", () => {
      function ForceMountSpeedDial() {
        return (
          <SpeedDial open={false}>
            <SpeedDialTrigger data-testid="trigger">
              <span>+</span>
            </SpeedDialTrigger>
            <SpeedDialContent forceMount data-testid="content">
              <SpeedDialItem>
                <SpeedDialAction>
                  <span>Home</span>
                </SpeedDialAction>
                <SpeedDialLabel>Home</SpeedDialLabel>
              </SpeedDialItem>
            </SpeedDialContent>
          </SpeedDial>
        );
      }

      render(<ForceMountSpeedDial />);

      // Content should be in DOM even when closed
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });
});
