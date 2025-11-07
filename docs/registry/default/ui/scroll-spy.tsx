"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "ScrollSpy";
const NAV_NAME = "ScrollSpyNav";
const LINK_NAME = "ScrollSpyLink";
const VIEWPORT_NAME = "ScrollSpyViewport";
const SECTION_NAME = "ScrollSpySection";

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
  onSectionRegister: (id: string, element: Element) => void;
  onSectionUnregister: (id: string) => void;
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

interface ScrollSpyProps extends React.ComponentProps<"div"> {
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

function ScrollSpy(props: ScrollSpyProps) {
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
      <ScrollSpyImpl value={value} {...rootProps} />
    </StoreContext.Provider>
  );
}

function ScrollSpyImpl(
  props: Omit<ScrollSpyProps, "defaultValue" | "onValueChange">,
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

  const sectionMapRef = React.useRef(new Map<string, Element>());

  const onSectionRegister = React.useCallback(
    (id: string, element: Element) => {
      sectionMapRef.current.set(id, element);
    },
    [],
  );

  const onSectionUnregister = React.useCallback((id: string) => {
    sectionMapRef.current.delete(id);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const sectionMap = sectionMapRef.current;
    if (sectionMap.size === 0) return;

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
        if (id && sectionMap.has(id)) {
          store.setState("value", id);
        }
      },
      {
        root: scrollContainer,
        rootMargin: observerRootMargin,
        threshold,
      },
    );

    sectionMap.forEach((element) => {
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
      onSectionRegister,
      onSectionUnregister,
    }),
    [
      dir,
      orientation,
      offset,
      scrollBehavior,
      scrollContainer,
      onSectionRegister,
      onSectionUnregister,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
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
  );
}

interface ScrollSpyNavProps extends React.ComponentProps<"nav"> {
  asChild?: boolean;
}

function ScrollSpyNav(props: ScrollSpyNavProps) {
  const { asChild, className, ...navProps } = props;

  const { dir, orientation } = useScrollSpyContext(NAV_NAME);

  const NavPrimitive = asChild ? Slot : "nav";

  return (
    <NavPrimitive
      data-orientation={orientation}
      data-slot="scroll-spy-nav"
      dir={dir}
      {...navProps}
      className={cn(
        "flex gap-2",
        orientation === "horizontal" ? "flex-col" : "flex-row",
        className,
      )}
    />
  );
}

interface ScrollSpyLinkProps extends React.ComponentProps<"a"> {
  value: string;
  asChild?: boolean;
}

function ScrollSpyLink(props: ScrollSpyLinkProps) {
  const { value: valueProp, asChild, onClick, className, ...linkProps } = props;

  const { orientation, offset, scrollBehavior, scrollContainer } =
    useScrollSpyContext(LINK_NAME);
  const store = useStoreContext(LINK_NAME);
  const value = useStore((state) => state.value);
  const isActive = value === valueProp;

  const onLinkClick = React.useCallback(
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

  const LinkPrimitive = asChild ? Slot : "a";

  return (
    <LinkPrimitive
      data-orientation={orientation}
      data-slot="scroll-spy-link"
      data-state={isActive ? "active" : "inactive"}
      {...linkProps}
      className={cn(
        "rounded px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-foreground",
        className,
      )}
      href={`#${value}`}
      onClick={onLinkClick}
    />
  );
}

interface ScrollSpyViewportProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function ScrollSpyViewport(props: ScrollSpyViewportProps) {
  const { asChild, className, ...viewportProps } = props;

  const { dir, orientation } = useScrollSpyContext(VIEWPORT_NAME);

  const ViewportPrimitive = asChild ? Slot : "div";

  return (
    <ViewportPrimitive
      data-orientation={orientation}
      data-slot="scroll-spy-viewport"
      dir={dir}
      {...viewportProps}
      className={cn("flex flex-1 flex-col gap-8", className)}
    />
  );
}

interface ScrollSpySectionProps extends React.ComponentProps<"div"> {
  value: string;
  asChild?: boolean;
}

function ScrollSpySection(props: ScrollSpySectionProps) {
  const { asChild, ref, value, ...sectionProps } = props;

  const { orientation, onSectionRegister, onSectionUnregister } =
    useScrollSpyContext(SECTION_NAME);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, sectionRef);

  useIsomorphicLayoutEffect(() => {
    const element = sectionRef.current;
    if (!element || !value) return;

    onSectionRegister(value, element);

    return () => {
      onSectionUnregister(value);
    };
  }, [value, onSectionRegister, onSectionUnregister]);

  const SectionPrimitive = asChild ? Slot : "div";

  return (
    <SectionPrimitive
      data-orientation={orientation}
      data-slot="scroll-spy-section"
      {...sectionProps}
      id={value}
      ref={composedRef}
    />
  );
}

export {
  ScrollSpy,
  ScrollSpyNav,
  ScrollSpyLink,
  ScrollSpyViewport,
  ScrollSpySection,
};
