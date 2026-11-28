"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ReactStore } from "@base-ui/utils/store";
import { useAnimationFrame } from "@base-ui/utils/useAnimationFrame";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { useTimeout } from "@base-ui/utils/useTimeout";
import { cn } from "cn";
import * as React from "react";

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
  valueProp: string | undefined;
}

interface StoreController {
  onValueChange?: (value: string) => void;
}

const selectors = {
  value: (state: StoreState) => state.valueProp ?? state.value,
};

type Store = ReactStore<StoreState, StoreController, typeof selectors>;

function setValue(store: Store, value: string) {
  if (Object.is(store.select("value"), value)) return;
  if (value) store.context.onValueChange?.(value);
  store.set("value", value);
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
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
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {
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

  const [store] = React.useState<Store>(
    () =>
      new ReactStore<StoreState, StoreController, typeof selectors>(
        { value: value ?? defaultValue ?? "", valueProp: value },
        { onValueChange },
        selectors,
      ),
  );

  store.useControlledProp("valueProp", value);
  store.useContextCallback("onValueChange", onValueChange);

  const sectionMapRef = React.useRef(new Map<string, Element>());
  const isScrollingRef = React.useRef(false);
  const scrollTimeout = useTimeout();
  const frame = useAnimationFrame();

  const onSectionRegister = React.useCallback(
    (id: string, element: SectionElement) => {
      sectionMapRef.current.set(id, element);
    },
    [],
  );

  const onSectionUnregister = React.useCallback((id: string) => {
    sectionMapRef.current.delete(id);
  }, []);

  const scrollToSection = React.useCallback(
    (sectionId: string) => {
      const section = scrollContainer
        ? scrollContainer.querySelector(`#${sectionId}`)
        : document.getElementById(sectionId);

      if (!section) return;

      // Keeps the observer from firing during the programmatic scroll.
      isScrollingRef.current = true;

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

      scrollTimeout.start(500, () => {
        isScrollingRef.current = false;
      });
    },
    [scrollContainer, offset, scrollBehavior, scrollTimeout],
  );

  const onScrollToSection = React.useCallback(
    (sectionId: string) => {
      setValue(store, sectionId);
      scrollToSection(sectionId);
    },
    [store, scrollToSection],
  );

  useIsoLayoutEffect(() => {
    if (value === undefined || value === store.state.value) return;
    store.set("value", value);
    scrollToSection(value);
  }, [value, scrollToSection, store]);

  useIsoLayoutEffect(() => {
    const sectionMap = sectionMapRef.current;
    if (sectionMap.size === 0) return;

    const observerRootMargin = rootMargin ?? `${-offset}px 0px -70% 0px`;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;

        frame.request(() => {
          const intersecting = entries.filter((entry) => entry.isIntersecting);

          if (intersecting.length === 0) return;

          const topmost = intersecting.reduce((prev, curr) => {
            return curr.boundingClientRect.top < prev.boundingClientRect.top
              ? curr
              : prev;
          });

          const id = topmost.target.id;
          if (id && sectionMap.has(id)) {
            setValue(store, id);
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
      frame.cancel();
    };
  }, [offset, rootMargin, threshold, scrollContainer, store, frame]);

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
          "cn-scroll-spy",
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
  extends React.ComponentProps<"nav">, useRender.ComponentProps<"nav"> {}

function ScrollSpyNav(props: ScrollSpyNavProps) {
  const { render, className, ...navProps } = props;

  const { dir, orientation } = useScrollSpyContext(NAV_NAME);

  return useRender({
    defaultTagName: "nav",
    props: mergeProps<"nav">(
      {
        dir,
        className: cn(
          "cn-scroll-spy-nav",
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
  extends React.ComponentProps<"a">, useRender.ComponentProps<"a"> {
  value: string;
}

function ScrollSpyLink(props: ScrollSpyLinkProps) {
  const { value: linkValue, render, onClick, className, ...linkProps } = props;

  const { orientation, onScrollToSection } = useScrollSpyContext(LINK_NAME);
  const store = useStoreContext(LINK_NAME);
  const value = store.useState("value");
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
        className: cn("cn-scroll-spy-link", className),
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
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {}

function ScrollSpyViewport(props: ScrollSpyViewportProps) {
  const { render, className, ...viewportProps } = props;

  const { dir, orientation } = useScrollSpyContext(VIEWPORT_NAME);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        dir,
        className: cn("cn-scroll-spy-viewport", className),
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
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {
  value: string;
}

function ScrollSpySection(props: ScrollSpySectionProps) {
  const { render, ref, value, ...sectionProps } = props;

  const { orientation, onSectionRegister, onSectionUnregister } =
    useScrollSpyContext(SECTION_NAME);
  const sectionRef = React.useRef<SectionElement>(null);
  const composedRef = useMergedRefs(ref, sectionRef);

  useIsoLayoutEffect(() => {
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
  type ScrollSpyProps,
  ScrollSpySection,
  ScrollSpyViewport,
};
