"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/bases/base/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/bases/base/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/bases/base/hooks/use-lazy-ref";
import { useComposedRefs } from "@/registry/bases/base/lib/compose-refs";
import { useDirection } from "@/registry/bases/base/ui/direction";

const ROOT_NAME = "ScrollSpy";
const NAV_NAME = "ScrollSpyNav";
const LINK_NAME = "ScrollSpyLink";
const VIEWPORT_NAME = "ScrollSpyViewport";
const SECTION_NAME = "ScrollSpySection";

type Direction = "ltr" | "rtl";
type Orientation = "horizontal" | "vertical";

type LinkElement = HTMLAnchorElement;
type SectionElement = HTMLDivElement;

function getDefaultScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "smooth";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
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

function useStore<T>(
  selector: (state: StoreState) => T,
  ogStore?: Store | null,
): T {
  const contextStore = React.useContext(StoreContext);

  const store = ogStore ?? contextStore;

  if (!store) {
    throw new Error(`\`useStore\` must be used within \`${ROOT_NAME}\``);
  }

  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface ScrollSpyContextValue {
  offset: number;
  scrollBehavior: ScrollBehavior;
  dir: Direction;
  orientation: Orientation;
  scrollContainer: HTMLElement | null;
  isScrollingRef: React.RefObject<boolean>;
  onSectionRegister: (id: string, element: SectionElement) => void;
  onSectionUnregister: (id: string) => void;
  onScrollToSection: (sectionId: string) => void;
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

interface ScrollSpyProps
  extends React.ComponentProps<"div">,
    useRender.ComponentProps<"div"> {
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
}

function ScrollSpy(props: ScrollSpyProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    rootMargin,
    threshold = 0.1,
    offset = 0,
    scrollBehavior = getDefaultScrollBehavior(),
    scrollContainer = null,
    dir: dirProp,
    orientation = "horizontal",
    render,
    className,
    ...rootProps
  } = props;

  const contextDir = useDirection();
  const dir = dirProp ?? contextDir;

  const stateRef = useLazyRef<StoreState>(() => ({
    value: value ?? defaultValue ?? "",
  }));
  const listenersRef = useLazyRef(() => new Set<() => void>());
  const onValueChangeRef = useAsRef(onValueChange);

  const store = React.useMemo<Store>(() => {
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
          onValueChangeRef.current?.(value);
        }

        store.notify();
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, onValueChangeRef]);

  const sectionMapRef = React.useRef(new Map<string, Element>());
  const isScrollingRef = React.useRef(false);
  const rafIdRef = React.useRef<number | null>(null);
  const isMountedRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef<number | null>(null);

  const onSectionRegister = React.useCallback(
    (id: string, element: SectionElement) => {
      sectionMapRef.current.set(id, element);
    },
    [],
  );

  const onSectionUnregister = React.useCallback((id: string) => {
    sectionMapRef.current.delete(id);
  }, []);

  const onScrollToSection = React.useCallback(
    (sectionId: string) => {
      const section = scrollContainer
        ? scrollContainer.querySelector(`#${sectionId}`)
        : document.getElementById(sectionId);

      if (!section) {
        store.setState("value", sectionId);
        return;
      }

      // Set flag to prevent observer from firing during programmatic scroll
      isScrollingRef.current = true;
      store.setState("value", sectionId);

      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop;
        const offsetPosition =
          sectionRect.top - containerRect.top + scrollTop - offset;

        scrollContainer.scrollTo({
          top: offsetPosition,
          behavior: scrollBehavior,
        });
      } else {
        const sectionPosition = section.getBoundingClientRect().top;
        const offsetPosition = sectionPosition + window.scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: scrollBehavior,
        });
      }

      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    },
    [scrollContainer, offset, scrollBehavior, store],
  );

  useIsomorphicLayoutEffect(() => {
    const currentValue = value ?? defaultValue;
    if (currentValue === undefined) return;

    if (!isMountedRef.current) {
      isMountedRef.current = true;
      store.setState("value", currentValue);
      return;
    }

    onScrollToSection(currentValue);
  }, [value, onScrollToSection]);

  useIsomorphicLayoutEffect(() => {
    const sectionMap = sectionMapRef.current;
    if (sectionMap.size === 0) return;

    const observerRootMargin = rootMargin ?? `${-offset}px 0px -70% 0px`;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;

        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }

        rafIdRef.current = requestAnimationFrame(() => {
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
        });
      },
      {
        root: scrollContainer,
        rootMargin: observerRootMargin,
        threshold,
      },
    );

    for (const element of sectionMap.values()) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [offset, rootMargin, threshold, scrollContainer]);

  const contextValue = React.useMemo<ScrollSpyContextValue>(
    () => ({
      dir,
      orientation,
      offset,
      scrollBehavior,
      scrollContainer,
      isScrollingRef,
      onSectionRegister,
      onSectionUnregister,
      onScrollToSection,
    }),
    [
      dir,
      orientation,
      offset,
      scrollBehavior,
      scrollContainer,
      onSectionRegister,
      onSectionUnregister,
      onScrollToSection,
    ],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        dir,
        className: cn(
          "flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className,
        ),
      },
      rootProps,
    ),
    render,
    state: {
      slot: "scroll-spy",
      orientation,
    },
  });

  return (
    <StoreContext.Provider value={store}>
      <ScrollSpyContext.Provider value={contextValue}>
        {element}
      </ScrollSpyContext.Provider>
    </StoreContext.Provider>
  );
}

interface ScrollSpyNavProps
  extends React.ComponentProps<"nav">,
    useRender.ComponentProps<"nav"> {}

function ScrollSpyNav(props: ScrollSpyNavProps) {
  const { render, className, ...navProps } = props;

  const { dir, orientation } = useScrollSpyContext(NAV_NAME);

  return useRender({
    defaultTagName: "nav",
    props: mergeProps<"nav">(
      {
        dir,
        className: cn(
          "flex gap-2",
          orientation === "horizontal" ? "flex-col" : "flex-row",
          className,
        ),
      },
      navProps,
    ),
    render,
    state: {
      slot: "scroll-spy-nav",
      orientation,
    },
  });
}

interface ScrollSpyLinkProps
  extends React.ComponentProps<"a">,
    useRender.ComponentProps<"a"> {
  value: string;
}

function ScrollSpyLink(props: ScrollSpyLinkProps) {
  const { value: linkValue, render, onClick, className, ...linkProps } = props;

  const { orientation, onScrollToSection } = useScrollSpyContext(LINK_NAME);
  const value = useStore((state) => state.value);
  const isActive = value === linkValue;

  const onLinkClick = React.useCallback(
    (event: React.MouseEvent<LinkElement>) => {
      event.preventDefault();
      onClick?.(event);
      onScrollToSection(linkValue);
    },
    [linkValue, onClick, onScrollToSection],
  );

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        href: `#${linkValue}`,
        className: cn(
          "rounded px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-foreground",
          className,
        ),
        onClick: onLinkClick,
      },
      linkProps,
    ),
    render,
    state: {
      slot: "scroll-spy-link",
      orientation,
      state: isActive ? "active" : "inactive",
    },
  });
}

interface ScrollSpyViewportProps
  extends React.ComponentProps<"div">,
    useRender.ComponentProps<"div"> {}

function ScrollSpyViewport(props: ScrollSpyViewportProps) {
  const { render, className, ...viewportProps } = props;

  const { dir, orientation } = useScrollSpyContext(VIEWPORT_NAME);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        dir,
        className: cn("flex flex-1 flex-col gap-8", className),
      },
      viewportProps,
    ),
    render,
    state: {
      slot: "scroll-spy-viewport",
      orientation,
    },
  });
}

interface ScrollSpySectionProps
  extends React.ComponentProps<"div">,
    useRender.ComponentProps<"div"> {
  value: string;
}

function ScrollSpySection(props: ScrollSpySectionProps) {
  const { render, ref, value, ...sectionProps } = props;

  const { orientation, onSectionRegister, onSectionUnregister } =
    useScrollSpyContext(SECTION_NAME);
  const sectionRef = React.useRef<SectionElement>(null);
  const composedRef = useComposedRefs(ref, sectionRef);

  useIsomorphicLayoutEffect(() => {
    const element = sectionRef.current;
    if (!element || !value) return;

    onSectionRegister(value, element);

    return () => {
      onSectionUnregister(value);
    };
  }, [value, onSectionRegister, onSectionUnregister]);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        id: value,
        ref: composedRef,
      },
      sectionProps,
    ),
    render,
    state: {
      slot: "scroll-spy-section",
      orientation,
    },
  });
}

export {
  ScrollSpy,
  ScrollSpyLink,
  ScrollSpyNav,
  ScrollSpySection,
  ScrollSpyViewport,
  //
  type ScrollSpyProps,
};
