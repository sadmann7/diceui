"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "ScrollSpy";
const LIST_NAME = "ScrollSpyList";
const ITEM_NAME = "ScrollSpyItem";
const CONTENT_GROUP_NAME = "ScrollSpyContentGroup";
const CONTENT_NAME = "ScrollSpyContent";

type Direction = "ltr" | "rtl";
type Orientation = "horizontal" | "vertical";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

interface StoreState {
  value: string;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useStore");

  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dir?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dir ?? contextDir ?? "ltr";
}

interface ScrollSpyContextValue {
  offset: number;
  scrollBehavior: ScrollBehavior;
  dir: Direction;
  orientation: Orientation;
  scrollContainer: HTMLElement | null;
  onContentRegister: (id: string, element: Element) => void;
  onContentUnregister: (id: string) => void;
}

const ScrollSpyContext = React.createContext<ScrollSpyContextValue | null>(
  null,
);

function useScrollSpyContext(consumerName: string) {
  const context = React.useContext(ScrollSpyContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface ScrollSpyRootProps extends React.ComponentProps<"div"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  rootMargin?: string;
  threshold?: number | number[];
  offset?: number;
  scrollBehavior?: ScrollBehavior;
  scrollContainer?: HTMLElement | null;
  dir?: Direction;
  orientation?: Orientation;
  asChild?: boolean;
}

function ScrollSpyRoot(props: ScrollSpyRootProps) {
  const { value, defaultValue, onValueChange, ...rootProps } = props;

  const stateRef = useLazyRef<StoreState>(() => ({
    value: value ?? defaultValue ?? "",
  }));
  const listenersRef = useLazyRef(() => new Set<() => void>());

  const store: Store = React.useMemo(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => {
        return stateRef.current;
      },
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        stateRef.current[key] = value;

        if (key === "value" && value) {
          onValueChange?.(value);
        }

        store.notify();
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, onValueChange]);

  return (
    <StoreContext.Provider value={store}>
      <ScrollSpyRootImpl value={value} {...rootProps} />
    </StoreContext.Provider>
  );
}

function ScrollSpyRootImpl(
  props: Omit<ScrollSpyRootProps, "defaultValue" | "onValueChange">,
) {
  const {
    value: valueProp,
    rootMargin,
    threshold = 0.1,
    offset = 0,
    scrollBehavior = "smooth",
    scrollContainer = null,
    dir: dirProp,
    orientation = "horizontal",
    asChild,
    className,
    ...rootProps
  } = props;

  const dir = useDirection(dirProp);

  const store = useStoreContext(ROOT_NAME);
  const contentMapRef = React.useRef(new Map<string, Element>());

  const onContentRegister = React.useCallback(
    (id: string, element: Element) => {
      contentMapRef.current.set(id, element);
    },
    [],
  );

  const onContentUnregister = React.useCallback((id: string) => {
    contentMapRef.current.delete(id);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const contentMap = contentMapRef.current;
    if (contentMap.size === 0) return;

    const observerRootMargin = rootMargin ?? `${-offset}px 0px -70% 0px`;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting);

        if (intersecting.length === 0) return;

        const topmost = intersecting.reduce((prev, curr) => {
          return curr.boundingClientRect.top < prev.boundingClientRect.top
            ? curr
            : prev;
        });

        const id = topmost.target.id;
        if (id && contentMap.has(id)) {
          store.setState("value", id);
        }
      },
      {
        root: scrollContainer,
        rootMargin: observerRootMargin,
        threshold,
      },
    );

    contentMap.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [offset, rootMargin, threshold, scrollContainer]);

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp]);

  const contextValue = React.useMemo<ScrollSpyContextValue>(
    () => ({
      dir,
      orientation,
      offset,
      scrollBehavior,
      scrollContainer,
      onContentRegister,
      onContentUnregister,
    }),
    [
      dir,
      orientation,
      offset,
      scrollBehavior,
      scrollContainer,
      onContentRegister,
      onContentUnregister,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <DirectionContext.Provider value={dir}>
      <ScrollSpyContext.Provider value={contextValue}>
        <RootPrimitive
          data-orientation={orientation}
          data-slot="scroll-spy"
          dir={dir}
          {...rootProps}
          className={cn(
            "flex",
            orientation === "horizontal" ? "flex-row" : "flex-col",
            className,
          )}
        />
      </ScrollSpyContext.Provider>
    </DirectionContext.Provider>
  );
}

interface ScrollSpyItemGroupProps extends React.ComponentProps<"nav"> {
  asChild?: boolean;
}

function ScrollSpyItemGroup(props: ScrollSpyItemGroupProps) {
  const { asChild, className, ...listProps } = props;

  const { dir, orientation } = useScrollSpyContext(LIST_NAME);

  const ItemGroupPrimitive = asChild ? Slot : "nav";

  console.log({ orientation });

  return (
    <ItemGroupPrimitive
      data-orientation={orientation}
      data-slot="scroll-spy-list"
      dir={dir}
      {...listProps}
      className={cn(
        "flex gap-2",
        orientation === "horizontal" ? "flex-col" : "flex-row",
        className,
      )}
    />
  );
}

interface ScrollSpyItemProps extends React.ComponentProps<"a"> {
  value: string;
  asChild?: boolean;
}

function ScrollSpyItem(props: ScrollSpyItemProps) {
  const { value: valueProp, asChild, onClick, className, ...itemProps } = props;

  const { orientation, offset, scrollBehavior, scrollContainer } =
    useScrollSpyContext(ITEM_NAME);
  const store = useStoreContext(ITEM_NAME);
  const value = useStore((state) => state.value);
  const isActive = value === valueProp;

  const onItemClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onClick?.(event);

      const element = document.getElementById(valueProp);
      if (!element) return;

      store.setState("value", valueProp);

      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop;
        const offsetPosition =
          elementRect.top - containerRect.top + scrollTop - offset;

        scrollContainer.scrollTo({
          top: offsetPosition,
          behavior: scrollBehavior,
        });
      } else {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: scrollBehavior,
        });
      }
    },
    [offset, scrollBehavior, valueProp, onClick, scrollContainer, store],
  );

  const ItemPrimitive = asChild ? Slot : "a";

  return (
    <ItemPrimitive
      data-orientation={orientation}
      data-slot="scroll-spy-item"
      data-state={isActive ? "active" : "inactive"}
      {...itemProps}
      className={cn(
        "rounded px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:font-medium data-[state=active]:text-foreground",
        className,
      )}
      href={`#${value}`}
      onClick={onItemClick}
    />
  );
}

interface ScrollSpyContentGroupProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function ScrollSpyContentGroup(props: ScrollSpyContentGroupProps) {
  const { asChild, className, ...groupProps } = props;

  const { dir, orientation } = useScrollSpyContext(CONTENT_GROUP_NAME);

  const GroupPrimitive = asChild ? Slot : "div";

  return (
    <GroupPrimitive
      data-orientation={orientation}
      data-slot="scroll-spy-content-group"
      dir={dir}
      {...groupProps}
      className={cn("flex flex-1 flex-col gap-8", className)}
    />
  );
}

interface ScrollSpyContentProps extends React.ComponentProps<"div"> {
  value: string;
  asChild?: boolean;
}

function ScrollSpyContent(props: ScrollSpyContentProps) {
  const { asChild, ref, value, ...contentProps } = props;

  const { orientation, onContentRegister, onContentUnregister } =
    useScrollSpyContext(CONTENT_NAME);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, contentRef);

  useIsomorphicLayoutEffect(() => {
    const element = contentRef.current;
    if (!element || !value) return;

    onContentRegister(value, element);

    return () => {
      onContentUnregister(value);
    };
  }, [value, onContentRegister, onContentUnregister]);

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <ContentPrimitive
      data-orientation={orientation}
      data-slot="scroll-spy-content"
      {...contentProps}
      id={value}
      ref={composedRef}
    />
  );
}

export {
  ScrollSpyRoot as Root,
  ScrollSpyItemGroup as ItemGroup,
  ScrollSpyItem as Item,
  ScrollSpyContentGroup as ContentGroup,
  ScrollSpyContent as Content,
  //
  ScrollSpyRoot as ScrollSpy,
  ScrollSpyItemGroup,
  ScrollSpyItem,
  ScrollSpyContentGroup,
  ScrollSpyContent,
};
