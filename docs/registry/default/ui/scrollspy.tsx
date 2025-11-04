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

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

interface StoreState {
  activeValue: string | undefined;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

function createStore(
  listenersRef: React.RefObject<Set<() => void>>,
  stateRef: React.RefObject<StoreState>,
  onValueChange?: (value: string) => void,
): Store {
  const store: Store = {
    subscribe: (cb) => {
      if (listenersRef.current) {
        listenersRef.current.add(cb);
        return () => listenersRef.current?.delete(cb);
      }
      return () => {};
    },
    getState: () =>
      stateRef.current ?? {
        activeValue: undefined,
      },
    setState: (key, value) => {
      const state = stateRef.current;
      if (!state || Object.is(state[key], value)) return;

      if (
        key === "activeValue" &&
        (typeof value === "string" || value === undefined)
      ) {
        state.activeValue = value;
        if (value) onValueChange?.(value);
      }

      store.notify();
    },
    notify: () => {
      if (listenersRef.current) {
        for (const cb of listenersRef.current) {
          cb();
        }
      }
    },
  };

  return store;
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
  orientation?: Orientation;
  dir?: Direction;
  asChild?: boolean;
}

function ScrollSpyRoot(props: ScrollSpyRootProps) {
  const { value, defaultValue, onValueChange, ...rootProps } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    activeValue: value ?? defaultValue,
  }));

  const store = React.useMemo(
    () => createStore(listenersRef, stateRef, onValueChange),
    [listenersRef, stateRef, onValueChange],
  );

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
    rootMargin: _rootMargin = "0px 0px -80% 0px",
    threshold: _threshold = 0.1,
    offset = 0,
    scrollBehavior = "smooth",
    scrollContainer = null,
    orientation = "horizontal",
    dir: dirProp,
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

  const checkAndUpdateActiveSection = React.useCallback(() => {
    const sections = Array.from(contentMapRef.current.entries());
    if (sections.length === 0) return;

    const containerRect = scrollContainer
      ? scrollContainer.getBoundingClientRect()
      : { top: 0, height: window.innerHeight };

    const viewportHeight = scrollContainer
      ? containerRect.height
      : window.innerHeight;

    // Find the first visible section from the top
    for (const [id, element] of sections) {
      const rect = element.getBoundingClientRect();
      const elementTop = scrollContainer
        ? rect.top - containerRect.top
        : rect.top;

      // Check if element is in viewport considering offset
      // Element is considered "active" when its top is within the offset range
      if (elementTop >= -offset && elementTop <= viewportHeight * 0.3) {
        store.setState("activeValue", id);
        return;
      }
    }

    // If no section meets the criteria, find the one closest to the offset
    let closestSection: { id: string; distance: number } | null = null;

    for (const [id, element] of sections) {
      const rect = element.getBoundingClientRect();
      const elementTop = scrollContainer
        ? rect.top - containerRect.top
        : rect.top;

      const distance = Math.abs(elementTop - offset);

      if (!closestSection || distance < closestSection.distance) {
        closestSection = { id, distance };
      }
    }

    if (closestSection) {
      store.setState("activeValue", closestSection.id);
    }
  }, [scrollContainer, offset, store]);

  useIsomorphicLayoutEffect(() => {
    // Initial check
    checkAndUpdateActiveSection();

    // Throttle scroll events for performance
    let rafId: number | null = null;
    let lastTime = 0;
    const throttleMs = 100;

    function onScroll() {
      const now = Date.now();

      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        if (now - lastTime >= throttleMs) {
          checkAndUpdateActiveSection();
          lastTime = now;
        } else {
          onScroll();
        }
      });
    }

    const target = scrollContainer ?? window;
    target.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      target.removeEventListener("scroll", onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [scrollContainer, checkAndUpdateActiveSection]);

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("activeValue", valueProp);
    }
  }, [valueProp]);

  const contextValue = React.useMemo<ScrollSpyContextValue>(
    () => ({
      offset,
      scrollBehavior,
      dir,
      orientation,
      scrollContainer,
      onContentRegister,
      onContentUnregister,
    }),
    [
      offset,
      scrollBehavior,
      dir,
      orientation,
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
          data-slot="scrollspy"
          dir={dir}
          {...rootProps}
          className={cn(
            "flex gap-8",
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

  const ListPrimitive = asChild ? Slot : "nav";

  return (
    <ListPrimitive
      data-orientation={orientation}
      data-slot="scrollspy-list"
      dir={dir}
      className={cn(
        "flex gap-2",
        orientation === "horizontal" ? "flex-col" : "flex-row",
        className,
      )}
      {...listProps}
    />
  );
}

interface ScrollSpyItemProps extends React.ComponentProps<"a"> {
  value: string;
  asChild?: boolean;
}

function ScrollSpyItem(props: ScrollSpyItemProps) {
  const { value, asChild, onClick, className, ...itemProps } = props;

  const { orientation, offset, scrollBehavior, scrollContainer } =
    useScrollSpyContext(ITEM_NAME);
  const store = useStoreContext(ITEM_NAME);
  const activeValue = useStore((state) => state.activeValue);
  const isActive = activeValue === value;

  const onItemClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onClick?.(event);

      const element = document.getElementById(value);
      if (!element) return;

      // Immediately update active state
      store.setState("activeValue", value);

      if (scrollContainer) {
        // Scroll within container
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
        // Scroll window
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: scrollBehavior,
        });
      }
    },
    [offset, scrollBehavior, value, onClick, scrollContainer, store],
  );

  const ItemPrimitive = asChild ? Slot : "a";

  return (
    <ItemPrimitive
      data-orientation={orientation}
      data-slot="scrollspy-item"
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "rounded px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:font-medium data-[state=active]:text-foreground",
        className,
      )}
      {...itemProps}
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
      data-slot="scrollspy-content-group"
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
      data-slot="scrollspy-content"
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
