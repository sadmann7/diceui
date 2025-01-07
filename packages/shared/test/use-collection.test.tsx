import { render, renderHook } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { useIsomorphicLayoutEffect } from "../src";
import { useCollection } from "../src/hooks/use-collection";

interface ItemData {
  label: string;
  value: string;
  disabled: boolean;
}

interface ItemProps {
  label: string;
  value: string;
  disabled?: boolean;
  onRegister: (ref: React.RefObject<HTMLDivElement | null>) => void;
}

function Item({ label, value, disabled = false, onRegister }: ItemProps) {
  const itemRef = React.useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    onRegister(itemRef);
  }, [onRegister]);

  return (
    <div
      ref={itemRef}
      data-testid="test-item"
      data-value={value}
      data-disabled={disabled || undefined}
    >
      {label}
    </div>
  );
}

describe("useCollection", () => {
  it("should initialize with empty collection", () => {
    const { result } = renderHook(() => useCollection<HTMLDivElement>());

    expect(result.current.collectionRef.current).toBe(null);
    expect(result.current.itemMap.size).toBe(0);
    expect(result.current.getItems()).toEqual([]);
  });

  it("should register and unregister items", () => {
    const { result } = renderHook(() =>
      useCollection<HTMLDivElement, ItemData>(),
    );

    const item1Ref = React.createRef<HTMLDivElement>();
    const item1Data = {
      ref: item1Ref,
      label: "Item 1",
      value: "value-1",
      disabled: false,
    };

    const cleanup = result.current.onItemRegister(item1Data);
    expect(result.current.itemMap.size).toBe(1);
    expect(result.current.itemMap.get(item1Ref)).toBe(item1Data);

    cleanup();
    expect(result.current.itemMap.size).toBe(0);
  });

  it("should sort items based on DOM position", () => {
    const { result } = renderHook(() =>
      useCollection<HTMLDivElement, ItemData>(),
    );

    // Create a container for our collection
    render(
      <div ref={result.current.collectionRef}>
        <Item
          label="Item 1"
          value="value-1"
          onRegister={(ref) => {
            result.current.onItemRegister({
              ref,
              label: "Item 1",
              value: "value-1",
              disabled: false,
            });
          }}
        />
        <Item
          label="Item 2"
          value="value-2"
          onRegister={(ref) => {
            result.current.onItemRegister({
              ref,
              label: "Item 2",
              value: "value-2",
              disabled: false,
            });
          }}
        />
        <Item
          label="Item 3"
          value="value-3"
          disabled
          onRegister={(ref) => {
            result.current.onItemRegister({
              ref,
              label: "Item 3",
              value: "value-3",
              disabled: true,
            });
          }}
        />
      </div>,
    );

    const items = result.current.getItems();
    expect(items).toHaveLength(3);
    expect(items.map((item) => item.value)).toEqual([
      "value-1",
      "value-2",
      "value-3",
    ]);
    expect(items.map((item) => item.disabled)).toEqual([false, false, true]);
  });

  it("should handle null refs gracefully", () => {
    const { result } = renderHook(() =>
      useCollection<HTMLDivElement, ItemData>(),
    );

    // Create a container for our collection
    render(<div ref={result.current.collectionRef} />);

    const nullRef = { current: null };
    const itemData = {
      ref: nullRef,
      label: "Item 1",
      value: "value-1",
      disabled: false,
    };

    result.current.onItemRegister(itemData);
    const items = result.current.getItems();
    expect(items).toHaveLength(1);
    expect(items[0]).toBe(itemData);
  });

  it("should return empty array when collection ref is null", () => {
    const { result } = renderHook(() =>
      useCollection<HTMLDivElement, ItemData>(),
    );

    const itemRef = React.createRef<HTMLDivElement>();
    result.current.onItemRegister({
      ref: itemRef,
      label: "Item 1",
      value: "value-1",
      disabled: false,
    });

    expect(result.current.getItems()).toEqual([]);
  });

  it("should maintain disabled state of items", () => {
    const { result } = renderHook(() =>
      useCollection<HTMLDivElement, ItemData>(),
    );

    render(
      <div ref={result.current.collectionRef}>
        <Item
          label="Item 1"
          value="value-1"
          disabled
          onRegister={(ref) => {
            result.current.onItemRegister({
              ref,
              label: "Item 1",
              value: "value-1",
              disabled: true,
            });
          }}
        />
      </div>,
    );

    const items = result.current.getItems();
    expect(items).toHaveLength(1);
    expect(items[0]?.disabled).toBe(true);
  });
});
