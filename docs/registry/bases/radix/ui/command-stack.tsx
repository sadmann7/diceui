"use client";

import { Command as CommandPrimitive } from "cmdk";
import { cn } from "cn";
import {
  composeEventHandlers,
  useComposedRefs,
  useLayoutEffect,
} from "radix-ui/internal";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/bases/radix/ui/command";

const ROOT_NAME = "CommandStack";
const PAGE_NAME = "CommandStackPage";
const ITEM_NAME = "CommandStackItem";
const INPUT_NAME = "CommandStackInput";
const LIST_NAME = "CommandStackList";
const EMPTY_NAME = "CommandStackEmpty";
const LOADING_NAME = "CommandStackLoading";
const BREADCRUMB_NAME = "CommandStackBreadcrumb";

const DEFAULT_ROOT_PAGE = "root";

type CommandStackValue = Record<string, string[]>;
type CommandStackSelectionMode = "single" | "multiple";

const EMPTY_VALUE: CommandStackValue = {};
const NO_SELECTION: string[] = [];

interface CommandStackPageData {
  label?: React.ReactNode;
  placeholder?: string;
}

interface CommandStackStoreState {
  pages: string[];
  search: string;
  value: CommandStackValue;
  pageData: Map<string, CommandStackPageData>;
  loadingCount: number;
}

interface CommandStackController {
  pages?: string[];
  onPagesChange?: (pages: string[]) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  value?: CommandStackValue;
  onValueChange?: (value: CommandStackValue) => void;
}

interface CommandStackStore {
  subscribe: (callback: () => void) => () => void;
  getState: () => CommandStackStoreState;
  getProps: () => CommandStackController;
  notify: () => void;
  setPages: (pages: string[]) => void;
  pushPage: (page: string) => void;
  popPage: () => void;
  setSearch: (search: string) => void;
  setValue: (value: CommandStackValue) => void;
  selectItem: (
    page: string,
    itemValue: string,
    selectionMode: CommandStackSelectionMode,
  ) => void;
  registerPage: (page: string, data: CommandStackPageData) => () => void;
  registerLoading: () => () => void;
}

function getPages(
  state: CommandStackStoreState,
  props: CommandStackController,
) {
  return props.pages ?? state.pages;
}

function getActivePage(pages: string[]) {
  return pages[pages.length - 1] ?? DEFAULT_ROOT_PAGE;
}

function getSearch(
  state: CommandStackStoreState,
  props: CommandStackController,
) {
  return props.search ?? state.search;
}

function getValue(
  state: CommandStackStoreState,
  props: CommandStackController,
) {
  return props.value ?? state.value;
}

function createCommandStackStore(
  propsRef: React.RefObject<CommandStackController>,
  state: CommandStackStoreState,
): CommandStackStore {
  const listeners = new Set<() => void>();

  const store: CommandStackStore = {
    subscribe: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    getState: () => state,
    getProps: () => propsRef.current,
    notify: () => {
      for (const callback of listeners) {
        callback();
      }
    },
    setPages: (pages) => {
      if (pages.length === 0) return;
      const props = propsRef.current;
      if (props.pages === undefined) {
        state.pages = pages;
        store.notify();
      }
      props.onPagesChange?.(pages);
      store.setSearch("");
    },
    pushPage: (page) => {
      const pages = getPages(state, propsRef.current);
      if (page === getActivePage(pages)) return;
      store.setPages([...pages, page]);
    },
    popPage: () => {
      const pages = getPages(state, propsRef.current);
      if (pages.length <= 1) return;
      store.setPages(pages.slice(0, -1));
    },
    setSearch: (search) => {
      const props = propsRef.current;
      if (props.search === undefined && state.search !== search) {
        state.search = search;
        store.notify();
      }
      props.onSearchChange?.(search);
    },
    setValue: (value) => {
      const props = propsRef.current;
      if (props.value === undefined) {
        state.value = value;
        store.notify();
      }
      props.onValueChange?.(value);
    },
    selectItem: (page, itemValue, selectionMode) => {
      const value = getValue(state, propsRef.current);
      const selected = value[page] ?? NO_SELECTION;
      const isSelected = selected.includes(itemValue);
      let nextSelected: string[];
      if (selectionMode === "multiple") {
        nextSelected = isSelected
          ? selected.filter((item) => item !== itemValue)
          : [...selected, itemValue];
      } else {
        nextSelected = isSelected ? [] : [itemValue];
      }
      store.setValue({ ...value, [page]: nextSelected });
    },
    registerPage: (page, data) => {
      state.pageData = new Map(state.pageData).set(page, data);
      store.notify();
      return () => {
        const pageData = new Map(state.pageData);
        pageData.delete(page);
        state.pageData = pageData;
        store.notify();
      };
    },
    registerLoading: () => {
      state.loadingCount += 1;
      store.notify();
      return () => {
        state.loadingCount -= 1;
        store.notify();
      };
    },
  };

  return store;
}

function useCommandStackSelector<T>(
  store: CommandStackStore,
  selector: (state: CommandStackStoreState, props: CommandStackController) => T,
): T {
  const getSnapshot = () => selector(store.getState(), store.getProps());
  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

const CommandStackStoreContext = React.createContext<CommandStackStore | null>(
  null,
);

function useCommandStackStore(consumerName: string) {
  const store = React.useContext(CommandStackStoreContext);
  if (!store) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return store;
}

interface CommandStackPageContextValue {
  value: string;
  selectionMode?: CommandStackSelectionMode;
}

const CommandStackPageContext =
  React.createContext<CommandStackPageContextValue | null>(null);

function useCommandStack() {
  const store = useCommandStackStore("useCommandStack");
  const pages = useCommandStackSelector(store, getPages);
  const search = useCommandStackSelector(store, getSearch);
  const value = useCommandStackSelector(store, getValue);

  return {
    pages,
    activePage: getActivePage(pages),
    search,
    value,
    pushPage: store.pushPage,
    popPage: store.popPage,
    setPages: store.setPages,
    setValue: store.setValue,
  };
}

interface CommandStackProps extends Omit<
  React.ComponentProps<typeof Command>,
  "value" | "defaultValue" | "onValueChange"
> {
  value?: CommandStackValue;
  defaultValue?: CommandStackValue;
  onValueChange?: (value: CommandStackValue) => void;
  pages?: string[];
  defaultPages?: string[];
  onPagesChange?: (pages: string[]) => void;
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;
}

function CommandStack({
  pages: pagesProp,
  defaultPages,
  onPagesChange,
  search: searchProp,
  defaultSearch = "",
  onSearchChange,
  value: valueProp,
  defaultValue = EMPTY_VALUE,
  onValueChange,
  onKeyDown: onKeyDownProp,
  className,
  children,
  ...commandProps
}: CommandStackProps) {
  const controller: CommandStackController = {
    pages: pagesProp,
    onPagesChange,
    search: searchProp,
    onSearchChange,
    value: valueProp,
    onValueChange,
  };
  const propsRef = React.useRef(controller);
  propsRef.current = controller;

  const storeRef = React.useRef<CommandStackStore | null>(null);
  storeRef.current ??= createCommandStackStore(propsRef, {
    pages: defaultPages ?? [DEFAULT_ROOT_PAGE],
    search: defaultSearch,
    value: defaultValue,
    pageData: new Map(),
    loadingCount: 0,
  });
  const store = storeRef.current;

  const activePage = useCommandStackSelector(store, (state, stackProps) =>
    getActivePage(getPages(state, stackProps)),
  );
  const announcement = useCommandStackSelector(store, (state, stackProps) => {
    const pages = getPages(state, stackProps);
    if (pages.length <= 1) return null;
    const page = getActivePage(pages);
    return state.pageData.get(page)?.label ?? page;
  });

  useLayoutEffect(() => {
    if (
      pagesProp !== undefined ||
      searchProp !== undefined ||
      valueProp !== undefined
    ) {
      store.notify();
    }
  }, [store, pagesProp, searchProp, valueProp]);

  const [isResettingHighlight, setIsResettingHighlight] = React.useState(false);
  const [prevActivePage, setPrevActivePage] = React.useState(activePage);

  if (prevActivePage !== activePage) {
    setPrevActivePage(activePage);
    setIsResettingHighlight(true);
  }

  React.useEffect(() => {
    if (isResettingHighlight) setIsResettingHighlight(false);
  }, [isResettingHighlight]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;

      const state = store.getState();
      const stackProps = store.getProps();
      if (
        event.key === "Backspace" &&
        getSearch(state, stackProps).length === 0 &&
        getPages(state, stackProps).length > 1
      ) {
        event.preventDefault();
        store.popPage();
      }
    },
    [onKeyDownProp, store],
  );

  return (
    <CommandStackStoreContext.Provider value={store}>
      <Command
        data-slot="command-stack"
        className={cn("h-auto", className)}
        value={isResettingHighlight ? "" : undefined}
        onKeyDown={onKeyDown}
        {...commandProps}
      >
        {children}
        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </Command>
    </CommandStackStoreContext.Provider>
  );
}

function CommandStackBreadcrumb({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  const store = useCommandStackStore(BREADCRUMB_NAME);
  const pages = useCommandStackSelector(store, getPages);
  const pageData = useCommandStackSelector(store, (state) => state.pageData);

  return (
    <nav
      aria-label="Breadcrumb"
      data-slot="command-stack-breadcrumb"
      className={cn("px-1 pt-1", className)}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {pages.map((page, index) => {
          const isCurrent = index === pages.length - 1;

          return (
            <li
              key={`${page}-${index}`}
              data-slot="command-stack-breadcrumb-item"
              aria-current={isCurrent ? "page" : undefined}
              className="inline-flex h-5 items-center rounded-sm bg-muted px-1.5 text-xs font-medium text-muted-foreground aria-[current=page]:text-foreground"
            >
              {pageData.get(page)?.label ?? page}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CommandStackInput({
  placeholder,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof CommandInput>, "value">) {
  const store = useCommandStackStore(INPUT_NAME);
  const search = useCommandStackSelector(store, getSearch);
  const pagePlaceholder = useCommandStackSelector(
    store,
    (state, stackProps) =>
      state.pageData.get(getActivePage(getPages(state, stackProps)))
        ?.placeholder,
  );

  return (
    <CommandInput
      data-slot="command-stack-input"
      placeholder={pagePlaceholder ?? placeholder}
      value={search}
      onValueChange={(nextSearch) => {
        store.setSearch(nextSearch);
        onValueChange?.(nextSearch);
      }}
      {...props}
    />
  );
}

function CommandStackList({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof CommandList>) {
  const store = useCommandStackStore(LIST_NAME);
  const activePage = useCommandStackSelector(store, (state, stackProps) =>
    getActivePage(getPages(state, stackProps)),
  );
  const listRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, listRef);

  useLayoutEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [activePage]);

  return (
    <CommandList
      ref={composedRef}
      data-slot="command-stack-list"
      className={cn("[&_[cmdk-list-sizer]:has(>[cmdk-item])]:p-1", className)}
      {...props}
    />
  );
}

function CommandStackEmpty({
  ...props
}: React.ComponentProps<typeof CommandEmpty>) {
  const store = useCommandStackStore(EMPTY_NAME);
  const isLoading = useCommandStackSelector(
    store,
    (state) => state.loadingCount > 0,
  );

  if (isLoading) return null;

  return <CommandEmpty data-slot="command-stack-empty" {...props} />;
}

function CommandStackLoading({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Loading>) {
  const store = useCommandStackStore(LOADING_NAME);

  React.useEffect(() => store.registerLoading(), [store]);

  return (
    <CommandPrimitive.Loading
      data-slot="command-stack-loading"
      className={cn(
        "flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

interface CommandStackPageProps {
  value: string;
  label?: React.ReactNode;
  placeholder?: string;
  selectionMode?: CommandStackSelectionMode;
  children?: React.ReactNode;
}

function CommandStackPage({
  value,
  label,
  placeholder,
  selectionMode,
  children,
}: CommandStackPageProps) {
  const store = useCommandStackStore(PAGE_NAME);
  const isActive = useCommandStackSelector(
    store,
    (state, stackProps) => getActivePage(getPages(state, stackProps)) === value,
  );

  React.useEffect(() => {
    if (label === undefined && placeholder === undefined) return;
    return store.registerPage(value, { label, placeholder });
  }, [store, value, label, placeholder]);

  const pageContextValue = React.useMemo<CommandStackPageContextValue>(
    () => ({ value, selectionMode }),
    [value, selectionMode],
  );

  if (!isActive) return null;

  return (
    <CommandStackPageContext.Provider value={pageContextValue}>
      {children}
    </CommandStackPageContext.Provider>
  );
}

function CommandStackGroup({
  ...props
}: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup data-slot="command-stack-group" {...props} />;
}

interface CommandStackItemProps extends React.ComponentProps<
  typeof CommandItem
> {
  page?: string;
}

function CommandStackItem({
  page,
  value,
  onSelect,
  onPointerDownCapture,
  onMouseDown,
  className,
  ...props
}: CommandStackItemProps) {
  const store = useCommandStackStore(ITEM_NAME);
  const pageContext = React.useContext(CommandStackPageContext);
  const selectionMode = page ? undefined : pageContext?.selectionMode;
  const checked = useCommandStackSelector(store, (state, stackProps) =>
    selectionMode && pageContext && value !== undefined
      ? (
          getValue(state, stackProps)[pageContext.value] ?? NO_SELECTION
        ).includes(value)
      : undefined,
  );

  return (
    <CommandItem
      data-slot="command-stack-item"
      data-checked={checked}
      aria-checked={checked}
      className={cn(
        "scroll-my-1",
        checked === undefined && "[&>svg:last-child]:hidden",
        className,
      )}
      value={value}
      onPointerDownCapture={composeEventHandlers(
        onPointerDownCapture,
        (event) => {
          // A focusable item steals the input on pointerdown.
          event.preventDefault();
        },
      )}
      onMouseDown={composeEventHandlers(onMouseDown, (event) => {
        // iOS Safari can emit a synthetic mousedown without a pointerdown.
        event.preventDefault();
      })}
      onSelect={(itemValue) => {
        onSelect?.(itemValue);
        if (page) {
          store.pushPage(page);
          return;
        }
        if (selectionMode && pageContext && value !== undefined) {
          store.selectItem(pageContext.value, value, selectionMode);
        }
      }}
      {...props}
    />
  );
}

function CommandStackShortcut({
  ...props
}: React.ComponentProps<typeof CommandShortcut>) {
  return <CommandShortcut data-slot="command-stack-shortcut" {...props} />;
}

function CommandStackSeparator({
  ...props
}: React.ComponentProps<typeof CommandSeparator>) {
  return <CommandSeparator data-slot="command-stack-separator" {...props} />;
}

export {
  CommandStack,
  CommandStackBreadcrumb,
  CommandStackEmpty,
  CommandStackGroup,
  CommandStackInput,
  CommandStackItem,
  CommandStackList,
  CommandStackLoading,
  CommandStackPage,
  CommandStackSeparator,
  CommandStackShortcut,
  useCommandStack,
  type CommandStackSelectionMode,
  type CommandStackValue,
};
