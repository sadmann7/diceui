import { render, renderHook } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { useIsomorphicLayoutEffect } from "../src";
import { useCollection } from "../src/hooks/use-collection";

interface ItemData {
  id: string;
  label: string;
  value: string;
}

interface ItemProps {
  onRegister: (ref: React.RefObject<HTMLDivElement | null>) => void;
}

function Item({ onRegister }: ItemProps) {
  const itemRef = React.useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    onRegister(itemRef);
  }, [onRegister]);

  return <div ref={itemRef} data-testid="test-item" />;
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
      id: "1",
      label: "Item 1",
      value: "Value 1",
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
          onRegister={(ref) => {
            result.current.onItemRegister({
              ref,
              id: "1",
              label: "Item 1",
              value: "Value 1",
            });
          }}
        />
        <Item
          onRegister={(ref) => {
            result.current.onItemRegister({
              ref,
              id: "2",
              label: "Item 2",
              value: "Value 2",
            });
          }}
        />
        <Item
          onRegister={(ref) => {
            result.current.onItemRegister({
              ref,
              id: "3",
              label: "Item 3",
              value: "Value 3",
            });
          }}
        />
      </div>,
    );

    const items = result.current.getItems();
    expect(items).toHaveLength(3);
    expect(items.map((item) => item.id)).toEqual(["1", "2", "3"]);
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
      id: "1",
      label: "Item 1",
      value: "Value 1",
    };

    result.current.onItemRegister(itemData);
    const items = result.current.getItems();
    expect(items).toHaveLength(1);
  });

  it("should return empty array when collection ref is null", () => {
    const { result } = renderHook(() =>
      useCollection<HTMLDivElement, ItemData>(),
    );

    const itemRef = React.createRef<HTMLDivElement>();
    result.current.onItemRegister({
      ref: itemRef,
      id: "1",
      label: "Item 1",
      value: "Value 1",
    });

    expect(result.current.getItems()).toEqual([]);
  });
});
