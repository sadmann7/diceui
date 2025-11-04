"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useCallbackRef } from "@/hooks/use-callback-ref";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "ScrollSpy";

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

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

type ScrollSpyContextValue = {
  offset: number;
  scrollBehavior: ScrollBehavior;
  registerSection: (id: string, element: Element) => void;
  unregisterSection: (id: string) => void;
};

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
    className,
    ref,
    children,
    ...rootProps
  } = props;

  const store = useStoreContext(ROOT_NAME);
  const sectionsMapRef = React.useRef(new Map<string, Element>());
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const registerSection = useCallbackRef((id: string, element: Element) => {
    sectionsMapRef.current.set(id, element);
    observerRef.current?.observe(element);
  });

  const unregisterSection = useCallbackRef((id: string) => {
    const element = sectionsMapRef.current.get(id);
    if (element) {
      observerRef.current?.unobserve(element);
      sectionsMapRef.current.delete(id);
    }
  });

  React.useEffect(() => {
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
          const sections = Array.from(sectionsMapRef.current.entries());
          for (const [id, element] of sections) {
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
    sectionsMapRef.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [rootMargin, threshold, store]);

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
      registerSection,
      unregisterSection,
    }),
    [offset, scrollBehavior, registerSection, unregisterSection],
  );

  const Component = asChild ? Slot : "div";

  return (
    <ScrollSpyContext.Provider value={contextValue}>
      <Component
        data-slot="scrollspy"
        ref={ref}
        className={cn("scrollspy", className)}
        {...rootProps}
      >
        {children}
      </Component>
    </ScrollSpyContext.Provider>
  );
}

interface ScrollSpyItemProps extends React.ComponentProps<"a"> {
  value: string;
  active?: boolean;
  asChild?: boolean;
}

function ScrollSpyItem(props: ScrollSpyItemProps) {
  const {
    value,
    active: activeProp,
    asChild,
    className,
    onClick,
    ref,
    ...itemProps
  } = props;

  const { offset, scrollBehavior } = useScrollSpyContext("ScrollSpy.Item");
  const activeValue = useStore((state) => state.activeValue);
  const isActive = activeProp ?? activeValue === value;

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

  const Component = asChild ? Slot : "a";

  return (
    <Component
      data-slot="scrollspy-item"
      data-active={isActive ? "" : undefined}
      ref={ref}
      href={`#${value}`}
      onClick={onItemClick}
      className={cn(
        "scrollspy-item",
        isActive && "scrollspy-item-active",
        className,
      )}
      {...itemProps}
    />
  );
}

interface ScrollSpyContentProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function ScrollSpyContent(props: ScrollSpyContentProps) {
  const { asChild, className, ref, id, ...contentProps } = props;

  const { registerSection, unregisterSection } =
    useScrollSpyContext("ScrollSpy.Content");
  const contentRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, contentRef);

  React.useEffect(() => {
    const element = contentRef.current;
    if (!element || !id) return;

    registerSection(id, element);

    return () => {
      unregisterSection(id);
    };
  }, [id, registerSection, unregisterSection]);

  const Component = asChild ? Slot : "div";

  return (
    <Component
      data-slot="scrollspy-content"
      ref={composedRef}
      id={id}
      className={cn("scrollspy-content", className)}
      {...contentProps}
    />
  );
}

export {
  ScrollSpyRoot as Root,
  ScrollSpyItem as Item,
  ScrollSpyContent as Content,
};
