"use client";

import { composeEventHandlers, useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const ROOT_NAME = "Navigable";
const LIST_NAME = "NavigableList";
const ITEM_NAME = "NavigableItem";
const TRIGGER_NAME = "NavigableTrigger";

const NAVIGABLE_ERROR = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` components must be within \`${ROOT_NAME}\``,
  [LIST_NAME]: `\`${LIST_NAME}\` must be within \`${ROOT_NAME}\``,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${LIST_NAME}\``,
  [TRIGGER_NAME]: `\`${TRIGGER_NAME}\` must be within \`${ROOT_NAME}\``,
} as const;

interface NavigableContextValue {
  id: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
  orientation?: "horizontal" | "vertical" | "both";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
}

const NavigableContext = React.createContext<NavigableContextValue | null>(
  null,
);
NavigableContext.displayName = ROOT_NAME;

function useNavigableContext(name: keyof typeof NAVIGABLE_ERROR) {
  const context = React.useContext(NavigableContext);
  if (!context) {
    throw new Error(NAVIGABLE_ERROR[name]);
  }
  return context;
}

interface NavigableRootProps extends React.ComponentPropsWithoutRef<"div"> {
  id?: string;
  defaultSelectedIndex?: number;
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  orientation?: "horizontal" | "vertical" | "both";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
  asChild?: boolean;
}

const NavigableRoot = React.forwardRef<HTMLDivElement, NavigableRootProps>(
  (props, forwardedRef) => {
    const {
      id = React.useId(),
      defaultSelectedIndex = -1,
      selectedIndex: selectedIndexProp,
      onSelectedIndexChange,
      orientation = "vertical",
      loop = false,
      dir = "ltr",
      disabled = false,
      virtual = false,
      asChild,
      className,
      ...rootProps
    } = props;

    const [uncontrolledSelectedIndex, setUncontrolledSelectedIndex] =
      React.useState(defaultSelectedIndex);

    const selectedIndex = selectedIndexProp ?? uncontrolledSelectedIndex;
    const isControlled = selectedIndexProp !== undefined;

    const onSelect = React.useCallback(
      (index: number) => {
        if (!isControlled) {
          setUncontrolledSelectedIndex(index);
        }
        onSelectedIndexChange?.(index);
      },
      [isControlled, onSelectedIndexChange],
    );

    const contextValue = React.useMemo<NavigableContextValue>(
      () => ({
        id,
        selectedIndex,
        onSelect,
        orientation,
        loop,
        dir,
        disabled,
        virtual,
      }),
      [id, selectedIndex, onSelect, orientation, loop, dir, disabled, virtual],
    );

    const RootSlot = asChild ? Slot : "div";

    console.log({ selectedIndex });

    return (
      <NavigableContext.Provider value={contextValue}>
        <RootSlot
          data-slot="navigable"
          data-orientation={orientation}
          data-disabled={disabled ? "" : undefined}
          {...rootProps}
          ref={forwardedRef}
          className={cn("relative", className)}
        />
      </NavigableContext.Provider>
    );
  },
);
NavigableRoot.displayName = ROOT_NAME;

interface NavigableListProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const NavigableList = React.forwardRef<HTMLDivElement, NavigableListProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...listProps } = props;
    const context = useNavigableContext(LIST_NAME);
    const ListSlot = asChild ? Slot : "div";

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (context.disabled) return;

        const isVertical =
          context.orientation === "vertical" || context.orientation === "both";
        const isHorizontal =
          context.orientation === "horizontal" ||
          context.orientation === "both";
        const isRtl = context.dir === "rtl";

        let nextIndex = context.selectedIndex;

        if (isVertical && event.key === "ArrowDown") {
          event.preventDefault();
          nextIndex = context.selectedIndex + 1;
        } else if (isVertical && event.key === "ArrowUp") {
          event.preventDefault();
          nextIndex = context.selectedIndex - 1;
        } else if (
          isHorizontal &&
          event.key === (isRtl ? "ArrowLeft" : "ArrowRight")
        ) {
          event.preventDefault();
          nextIndex = context.selectedIndex + 1;
        } else if (
          isHorizontal &&
          event.key === (isRtl ? "ArrowRight" : "ArrowLeft")
        ) {
          event.preventDefault();
          nextIndex = context.selectedIndex - 1;
        } else if (event.key === "Home") {
          event.preventDefault();
          nextIndex = 0;
        } else if (event.key === "End") {
          event.preventDefault();
          nextIndex = React.Children.count(props.children) - 1;
        }

        if (context.loop) {
          const count = React.Children.count(props.children);
          nextIndex = ((nextIndex % count) + count) % count;
        } else {
          nextIndex = Math.max(
            0,
            Math.min(nextIndex, React.Children.count(props.children) - 1),
          );
        }

        if (nextIndex !== context.selectedIndex) {
          context.onSelect(nextIndex);
        }
      },
      [context, props.children],
    );

    return (
      <ListSlot
        role="listbox"
        data-slot="navigable-list"
        data-orientation={context.orientation}
        {...listProps}
        ref={forwardedRef}
        onKeyDown={composeEventHandlers(listProps.onKeyDown, onKeyDown)}
        className={cn(
          "outline-none",
          context.orientation === "horizontal" && "flex",
          className,
        )}
        tabIndex={context.disabled ? undefined : 0}
      />
    );
  },
);
NavigableList.displayName = LIST_NAME;

interface NavigableItemProps extends React.ComponentPropsWithoutRef<"div"> {
  index: number;
  asChild?: boolean;
}

const NavigableItem = React.forwardRef<HTMLDivElement, NavigableItemProps>(
  (props, forwardedRef) => {
    const { asChild, className, index, ...itemProps } = props;
    const context = useNavigableContext(ITEM_NAME);
    const ItemSlot = asChild ? Slot : "div";

    const isSelected = context.selectedIndex === index;

    return (
      <ItemSlot
        role="option"
        aria-selected={isSelected}
        data-slot="navigable-item"
        data-selected={isSelected ? "" : undefined}
        data-disabled={context.disabled ? "" : undefined}
        {...itemProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(itemProps.onClick, () => {
          if (!context.disabled) {
            context.onSelect(index);
          }
        })}
        className={cn(
          "relative cursor-default select-none ring-1 ring-transparent focus-visible:outline-none",
          "data-disabled:pointer-events-none data-disabled:opacity-50 data-selected:ring-ring",
          className,
        )}
      />
    );
  },
);
NavigableItem.displayName = ITEM_NAME;

const Navigable = NavigableRoot;
const Root = NavigableRoot;
const List = NavigableList;
const Item = NavigableItem;

export {
  Navigable,
  NavigableRoot,
  NavigableList,
  NavigableItem,
  //
  Root,
  List,
  Item,
};
