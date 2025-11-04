"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useCallbackRef } from "@/hooks/use-callback-ref";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "ScrollSpy";
const ITEM_NAME = "ScrollSpyItem";
const CONTENT_NAME = "ScrollSpyContent";

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

interface ScrollSpyContextValue {
  offset: number;
  scrollBehavior: ScrollBehavior;
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
    rootMargin = "0px 0px -80% 0px",
    threshold = 0.1,
    offset = 0,
    scrollBehavior = "smooth",
    asChild,
    ...rootProps
  } = props;

  const store = useStoreContext(ROOT_NAME);
  const contentMapRef = React.useRef(new Map<string, Element>());
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const onContentRegister = useCallbackRef((id: string, element: Element) => {
    contentMapRef.current.set(id, element);
    observerRef.current?.observe(element);
  });

  const onContentUnregister = useCallbackRef((id: string) => {
    const element = contentMapRef.current.get(id);
    if (element) {
      observerRef.current?.unobserve(element);
      contentMapRef.current.delete(id);
    }
  });

  useIsomorphicLayoutEffect(() => {
    const visibleSections = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute("id");
          if (!sectionId) return;

          if (entry.isIntersecting) {
            visibleSections.add(sectionId);
          } else {
            visibleSections.delete(sectionId);
          }
        });

        // Find the topmost visible section
        if (visibleSections.size > 0) {
          const sections = Array.from(contentMapRef.current.entries());
          for (const [id, _] of sections) {
            if (visibleSections.has(id)) {
              store.setState("activeValue", id);
              break;
            }
          }
        }
      },
      {
        rootMargin,
        threshold,
      },
    );

    observerRef.current = observer;

    // Observe existing sections
    contentMapRef.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [rootMargin, threshold]);

  // Sync controlled value
  React.useEffect(() => {
    if (valueProp !== undefined) {
      store.setState("activeValue", valueProp);
    }
  }, [valueProp, store]);

  const contextValue = React.useMemo<ScrollSpyContextValue>(
    () => ({
      offset,
      scrollBehavior,
      onContentRegister,
      onContentUnregister,
    }),
    [offset, scrollBehavior, onContentRegister, onContentUnregister],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <ScrollSpyContext.Provider value={contextValue}>
      <RootPrimitive data-slot="scrollspy" {...rootProps} />
    </ScrollSpyContext.Provider>
  );
}

interface ScrollSpyListProps extends React.ComponentProps<"nav"> {
  asChild?: boolean;
}

function ScrollSpyList(props: ScrollSpyListProps) {
  const { asChild, ...listProps } = props;

  const ListPrimitive = asChild ? Slot : "nav";

  return <ListPrimitive data-slot="scrollspy-list" {...listProps} />;
}

interface ScrollSpyItemProps extends React.ComponentProps<"a"> {
  value: string;
  asChild?: boolean;
}

function ScrollSpyItem(props: ScrollSpyItemProps) {
  const { value, asChild, onClick, className, ...itemProps } = props;

  const { offset, scrollBehavior } = useScrollSpyContext(ITEM_NAME);
  const activeValue = useStore((state) => state.activeValue);
  const isActive = activeValue === value;

  const onItemClick = useCallbackRef(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onClick?.(event);

      const element = document.getElementById(value);
      if (!element) return;

      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: scrollBehavior,
      });
    },
  );

  const ItemPrimitive = asChild ? Slot : "a";

  return (
    <ItemPrimitive
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

interface ScrollSpyContentProps extends React.ComponentProps<"div"> {
  value: string;
  asChild?: boolean;
}

function ScrollSpyContent(props: ScrollSpyContentProps) {
  const { asChild, ref, value, ...contentProps } = props;

  const { onContentRegister, onContentUnregister } =
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
      data-slot="scrollspy-content"
      {...contentProps}
      id={value}
      ref={composedRef}
    />
  );
}

export {
  ScrollSpyRoot as Root,
  ScrollSpyList as List,
  ScrollSpyItem as Item,
  ScrollSpyContent as Content,
  //
  ScrollSpyRoot as ScrollSpy,
  ScrollSpyList,
  ScrollSpyItem,
  ScrollSpyContent,
};
