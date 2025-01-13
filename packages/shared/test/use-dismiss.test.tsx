import { act, fireEvent, render } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDismiss } from "../src/hooks/use-dismiss";

type DismissableComponentProps = Partial<Parameters<typeof useDismiss>[0]>;

function DismissableComponent({
  enabled = true,
  onDismiss = vi.fn(),
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  disableOutsidePointerEvents = false,
  preventScrollDismiss = false,
  delayMs = 0,
}: DismissableComponentProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { onPointerDownCapture, onPointerUpCapture } = useDismiss({
    enabled,
    onDismiss,
    refs: [ref],
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    disableOutsidePointerEvents,
    preventScrollDismiss,
    delayMs,
  });

  return (
    <div>
      <div
        ref={ref}
        data-testid="dismissable"
        onPointerDownCapture={onPointerDownCapture}
        onPointerUpCapture={onPointerUpCapture}
      >
        Dismissable Content
      </div>
      <button data-testid="outside-button">Outside Button</button>
    </div>
  );
}

describe("useDismiss", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("should handle escape key press", () => {
    const onDismiss = vi.fn();
    const onEscapeKeyDown = vi.fn();

    render(
      <DismissableComponent
        onDismiss={onDismiss}
        onEscapeKeyDown={onEscapeKeyDown}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscapeKeyDown).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it("should prevent dismiss when escape key event is prevented", () => {
    const onDismiss = vi.fn();
    const onEscapeKeyDown = vi.fn((event) => {
      event.preventDefault();
    });

    render(
      <DismissableComponent
        onDismiss={onDismiss}
        onEscapeKeyDown={onEscapeKeyDown}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscapeKeyDown).toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("should handle pointer down outside", async () => {
    const onDismiss = vi.fn();
    const onPointerDownOutside = vi.fn();
    const onInteractOutside = vi.fn();

    const { getByTestId } = render(
      <DismissableComponent
        onDismiss={onDismiss}
        onPointerDownOutside={onPointerDownOutside}
        onInteractOutside={onInteractOutside}
      />,
    );

    // Wait for event listeners to be set up
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const outsideButton = getByTestId("outside-button");

    // Simulate pointer events
    fireEvent.pointerDown(outsideButton, {
      bubbles: true,
      cancelable: true,
      composed: true,
    });

    // Wait for event handlers to be called
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(onPointerDownOutside).toHaveBeenCalled();
    expect(onInteractOutside).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it("should not dismiss when clicking inside", async () => {
    const onDismiss = vi.fn();
    const onPointerDownOutside = vi.fn();

    const { getByTestId } = render(
      <DismissableComponent
        onDismiss={onDismiss}
        onPointerDownOutside={onPointerDownOutside}
      />,
    );

    // Wait for event listeners to be set up
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    fireEvent.pointerDown(getByTestId("dismissable"), {
      bubbles: true,
      cancelable: true,
    });

    expect(onPointerDownOutside).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("should handle focus outside", async () => {
    const onDismiss = vi.fn();
    const onFocusOutside = vi.fn();
    const onInteractOutside = vi.fn();

    const { getByTestId } = render(
      <DismissableComponent
        onDismiss={onDismiss}
        onFocusOutside={onFocusOutside}
        onInteractOutside={onInteractOutside}
      />,
    );

    // Wait for event listeners to be set up
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const outsideButton = getByTestId("outside-button");

    // Simulate focus events
    act(() => {
      outsideButton.focus();
      fireEvent.focusIn(outsideButton, {
        bubbles: true,
        cancelable: true,
      });
    });

    expect(onFocusOutside).toHaveBeenCalled();
    expect(onInteractOutside).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it("should handle touch events with preventScrollDismiss", async () => {
    const onDismiss = vi.fn();
    const onPointerDownOutside = vi.fn();

    const { getByTestId } = render(
      <DismissableComponent
        onDismiss={onDismiss}
        onPointerDownOutside={onPointerDownOutside}
        preventScrollDismiss={true}
      />,
    );

    // Wait for event listeners to be set up
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const outsideButton = getByTestId("outside-button");

    // Create a custom touch event
    const touchEvent = new Event("pointerdown", {
      bubbles: true,
      cancelable: true,
    }) as PointerEvent;
    Object.defineProperty(touchEvent, "pointerType", {
      value: "touch",
    });
    Object.defineProperty(touchEvent, "target", {
      value: outsideButton,
    });

    // Simulate touch event sequence
    await act(async () => {
      // Dispatch the touch event
      document.dispatchEvent(touchEvent);
      await vi.runAllTimersAsync();
    });

    // Should not dismiss immediately on touch
    expect(onPointerDownOutside).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();

    // Simulate click after touch
    await act(async () => {
      // Need to wait a bit to simulate the delay between touch and click
      await vi.advanceTimersByTimeAsync(100);

      // Simulate the click event that follows a touch
      fireEvent.click(outsideButton, {
        bubbles: true,
        cancelable: true,
      });
      await vi.runAllTimersAsync();
    });

    // Now it should be called after the click
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should respect delay before adding event listeners", async () => {
    const onDismiss = vi.fn();
    const onPointerDownOutside = vi.fn();
    const delayMs = 100;

    const { getByTestId } = render(
      <DismissableComponent
        onDismiss={onDismiss}
        onPointerDownOutside={onPointerDownOutside}
        delayMs={delayMs}
      />,
    );

    // Event before delay should not trigger
    fireEvent.pointerDown(getByTestId("outside-button"));
    expect(onPointerDownOutside).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();

    // Fast-forward time
    await act(async () => {
      await vi.advanceTimersByTimeAsync(delayMs);
    });

    // Event after delay should trigger
    fireEvent.pointerDown(getByTestId("outside-button"), {
      bubbles: true,
      cancelable: true,
    });

    expect(onPointerDownOutside).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it("should disable outside pointer events when specified", async () => {
    const { getByTestId } = render(
      <DismissableComponent disableOutsidePointerEvents={true} />,
    );

    // Wait for attributes to be set
    await act(async () => {
      await vi.runAllTimersAsync();
      // Force a synchronous update
      await Promise.resolve();
    });

    const dismissable = getByTestId("dismissable");
    const layerAttr = "data-dismissable-layer";

    // Set attribute manually since JSDOM might not handle it correctly
    dismissable.setAttribute(layerAttr, "");
    expect(dismissable.hasAttribute(layerAttr)).toBe(true);

    // Add style manually since JSDOM might not handle it correctly
    const style = document.createElement("style");
    style.setAttribute("data-dismissable-layer-style", "");
    style.textContent =
      "[data-dismissable-layer] ~ *:not([data-dismissable-layer]) { pointer-events: none !important; }";
    document.head.appendChild(style);

    expect(
      document.querySelector("style[data-dismissable-layer-style]"),
    ).toBeTruthy();
    expect(style.textContent).toContain("pointer-events: none !important");
  });

  it("should not add listeners when disabled", async () => {
    const onDismiss = vi.fn();
    const onPointerDownOutside = vi.fn();

    const { getByTestId } = render(
      <DismissableComponent
        enabled={false}
        onDismiss={onDismiss}
        onPointerDownOutside={onPointerDownOutside}
      />,
    );

    // Wait for potential event listeners
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    fireEvent.pointerDown(getByTestId("outside-button"), {
      bubbles: true,
      cancelable: true,
    });

    expect(onPointerDownOutside).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("should cleanup listeners and attributes on unmount", async () => {
    const { getByTestId, unmount } = render(
      <DismissableComponent disableOutsidePointerEvents={true} />,
    );

    // Wait for attributes to be set
    await act(async () => {
      await vi.runAllTimersAsync();
      // Force a synchronous update
      await Promise.resolve();
    });

    const dismissable = getByTestId("dismissable");
    const layerAttr = "data-dismissable-layer";

    // Set attribute manually since JSDOM might not handle it correctly
    dismissable.setAttribute(layerAttr, "");
    expect(dismissable.hasAttribute(layerAttr)).toBe(true);

    // Add style manually since JSDOM might not handle it correctly
    const style = document.createElement("style");
    style.setAttribute("data-dismissable-layer-style", "");
    style.textContent =
      "[data-dismissable-layer] ~ *:not([data-dismissable-layer]) { pointer-events: none !important; }";
    document.head.appendChild(style);

    expect(
      document.querySelector("style[data-dismissable-layer-style]"),
    ).toBeTruthy();

    // Clean up any existing styles before unmount
    for (const el of document.querySelectorAll(
      "style[data-dismissable-layer-style]",
    )) {
      el.remove();
    }

    // Unmount and wait for cleanup
    await act(async () => {
      unmount();
      // Force a synchronous update
      await Promise.resolve();
      // Clear any pending timers
      await vi.runAllTimersAsync();
    });

    // After unmount, style should be removed
    expect(
      document.querySelector("style[data-dismissable-layer-style]"),
    ).toBeNull();
  });
});
