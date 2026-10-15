"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "cn";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/bases/base/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/registry/bases/base/ui/input-group";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

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
  value: CommandStackValue;
  pageData: Map<string, CommandStackPageData>;
  loadingCount: number;
}

interface CommandStackController {
  isPagesControlled: boolean;
  isValueControlled: boolean;
  onPagesChange?: (pages: string[]) => void;
  onValueChange?: (value: CommandStackValue) => void;
  setSearch: (search: string) => void;
}

interface CommandStackStore {
  controller: CommandStackController;
  subscribe: (callback: () => void) => () => void;
  getState: () => CommandStackStoreState;
  notify: () => void;
  sync: (changes: Partial<CommandStackStoreState>) => void;
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

function scrollWhenFocused(node: HTMLElement | null) {
  if (!node) return;
  node.scrollIntoView = (options) => {
    if (node.closest("[cmdk-root]")?.contains(document.activeElement)) {
      HTMLElement.prototype.scrollIntoView.call(node, options);
    }
  };
}

function scrollHeadingWhenFocused(node: HTMLDivElement | null) {
  scrollWhenFocused(
    node?.querySelector<HTMLElement>("[cmdk-group-heading]") ?? null,
  );
}

function getActivePage(pages: string[]) {
  return pages[pages.length - 1] ?? DEFAULT_ROOT_PAGE;
}

function createCommandStackStore(
  state: CommandStackStoreState,
): CommandStackStore {
  const listeners = new Set<() => void>();

  const store: CommandStackStore = {
    controller: {
      isPagesControlled: false,
      isValueControlled: false,
      setSearch: () => {},
    },
    subscribe: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    getState: () => state,
    notify: () => {
      for (const callback of listeners) {
        callback();
      }
    },
    sync: (changes) => {
      let hasChanged = false;
      for (const key of Object.keys(
        changes,
      ) as (keyof CommandStackStoreState)[]) {
        const nextValue = changes[key];
        if (nextValue === undefined || Object.is(state[key], nextValue))
          continue;
        Object.assign(state, { [key]: nextValue });
        hasChanged = true;
      }
      if (hasChanged) store.notify();
    },
    setPages: (pages) => {
      if (pages.length === 0) return;
      store.controller.onPagesChange?.(pages);
      if (!store.controller.isPagesControlled) {
        state.pages = pages;
        store.notify();
      }
      store.setSearch("");
    },
    pushPage: (page) => {
      if (page === getActivePage(state.pages)) return;
      store.setPages([...state.pages, page]);
    },
    popPage: () => {
      if (state.pages.length <= 1) return;
      store.setPages(state.pages.slice(0, -1));
    },
    setSearch: (search) => store.controller.setSearch(search),
    setValue: (value) => {
      store.controller.onValueChange?.(value);
      if (!store.controller.isValueControlled) {
        state.value = value;
        store.notify();
      }
    },
    selectItem: (page, itemValue, selectionMode) => {
      const selected = state.value[page] ?? NO_SELECTION;
      const isSelected = selected.includes(itemValue);
      let nextSelected: string[];
      if (selectionMode === "multiple") {
        nextSelected = isSelected
          ? selected.filter((item) => item !== itemValue)
          : [...selected, itemValue];
      } else {
        nextSelected = isSelected ? [] : [itemValue];
      }
      store.setValue({ ...state.value, [page]: nextSelected });
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
  selector: (state: CommandStackStoreState) => T,
): T {
  const getSnapshot = () => selector(store.getState());
  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

function selectPages(state: CommandStackStoreState) {
  return state.pages;
}

function selectActivePage(state: CommandStackStoreState) {
  return getActivePage(state.pages);
}

function selectValue(state: CommandStackStoreState) {
  return state.value;
}

const CommandStackContext = React.createContext<CommandStackStore | null>(null);

function useCommandStackStore(consumerName: string) {
  const store = React.useContext(CommandStackContext);
  if (!store) {
    throw new Error(`\`${consumerName}\` must be used within \`CommandStack\``);
  }
  return store;
}

const CommandStackSearchContext = React.createContext("");

interface CommandStackPageContextValue {
  value: string;
  selectionMode?: CommandStackSelectionMode;
}

const CommandStackPageContext =
  React.createContext<CommandStackPageContextValue | null>(null);

function useCommandStack() {
  const store = useCommandStackStore("useCommandStack");
  const pages = useCommandStackSelector(store, selectPages);
  const value = useCommandStackSelector(store, selectValue);
  const search = React.useContext(CommandStackSearchContext);

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
  pages,
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
  ...props
}: CommandStackProps) {
  const [internalSearch, setInternalSearch] = React.useState(defaultSearch);
  const search = searchProp ?? internalSearch;

  const [store] = React.useState(() =>
    createCommandStackStore({
      pages: pages ?? defaultPages ?? [DEFAULT_ROOT_PAGE],
      value: valueProp ?? defaultValue,
      pageData: new Map(),
      loadingCount: 0,
    }),
  );

  useIsoLayoutEffect(() => {
    store.controller = {
      isPagesControlled: pages !== undefined,
      isValueControlled: valueProp !== undefined,
      onPagesChange,
      onValueChange,
      setSearch: (nextSearch) => {
        if (Object.is(nextSearch, search)) return;
        onSearchChange?.(nextSearch);
        if (searchProp === undefined) setInternalSearch(nextSearch);
      },
    };
  });

  useIsoLayoutEffect(() => {
    store.sync({ pages, value: valueProp });
  }, [store, pages, valueProp]);

  const activePage = useCommandStackSelector(store, selectActivePage);
  const announcement = useCommandStackSelector(store, (state) =>
    state.pages.length > 1
      ? (state.pageData.get(getActivePage(state.pages))?.label ??
        getActivePage(state.pages))
      : null,
  );

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

      if (
        event.key === "Backspace" &&
        search.length === 0 &&
        store.getState().pages.length > 1
      ) {
        event.preventDefault();
        store.popPage();
      }
    },
    [onKeyDownProp, search, store],
  );

  return (
    <CommandStackContext.Provider value={store}>
      <CommandStackSearchContext.Provider value={search}>
        <Command
          data-slot="command-stack"
          className={cn("h-auto", className)}
          value={isResettingHighlight ? "" : undefined}
          onKeyDown={onKeyDown}
          {...props}
        >
          {children}
          <span aria-live="polite" className="sr-only">
            {announcement}
          </span>
        </Command>
      </CommandStackSearchContext.Provider>
    </CommandStackContext.Provider>
  );
}

function CommandStackBreadcrumb({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  const store = useCommandStackStore("CommandStackBreadcrumb");
  const pages = useCommandStackSelector(store, selectPages);
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

interface CommandStackInputProps extends Omit<
  React.ComponentProps<typeof CommandPrimitive.Input>,
  "value"
> {
  variant?: "default" | "line";
}

function CommandStackInput({
  variant = "default",
  placeholder,
  onValueChange,
  className,
  ...props
}: CommandStackInputProps) {
  const store = useCommandStackStore("CommandStackInput");
  const search = React.useContext(CommandStackSearchContext);
  const isNested = useCommandStackSelector(
    store,
    (state) => state.pages.length > 1,
  );
  const pagePlaceholder = useCommandStackSelector(
    store,
    (state) => state.pageData.get(getActivePage(state.pages))?.placeholder,
  );

  const inputProps = {
    "data-slot": "command-stack-input",
    placeholder: pagePlaceholder ?? placeholder,
    value: search,
    onValueChange: (nextSearch: string) => {
      store.setSearch(nextSearch);
      onValueChange?.(nextSearch);
    },
  };

  if (variant === "line") {
    return (
      <div
        data-slot="command-stack-input-wrapper"
        data-variant="line"
        className="-mx-1 -mt-1 mb-1 flex h-10 items-center gap-2 border-b px-4"
      >
        {isNested ? (
          <CommandStackBack className="-m-1" />
        ) : (
          <IconPlaceholder
            lucide="SearchIcon"
            tabler="IconSearch"
            hugeicons="Search01Icon"
            phosphor="MagnifyingGlassIcon"
            remixicon="RiSearchLine"
            className="size-4 shrink-0 text-muted-foreground"
          />
        )}
        <CommandPrimitive.Input
          {...inputProps}
          className={cn(
            "h-full w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
      </div>
    );
  }

  return (
    <div
      data-slot="command-stack-input-wrapper"
      data-variant="default"
      className="p-1 pb-0"
    >
      <InputGroup className="h-8! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:ps-2!">
        <CommandPrimitive.Input
          {...inputProps}
          className={cn(
            "w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        <InputGroupAddon>
          {isNested ? (
            <InputGroupButton
              size="icon-xs"
              aria-label="Back"
              data-slot="command-stack-back"
              className="-me-1"
              onPointerDown={(event) => event.preventDefault()}
              onClick={store.popPage}
            >
              <IconPlaceholder
                lucide="ChevronLeftIcon"
                tabler="IconChevronLeft"
                hugeicons="ArrowLeft01Icon"
                phosphor="CaretLeftIcon"
                remixicon="RiArrowLeftSLine"
                className="rtl:rotate-180"
              />
            </InputGroupButton>
          ) : (
            <IconPlaceholder
              lucide="SearchIcon"
              tabler="IconSearch"
              hugeicons="Search01Icon"
              phosphor="MagnifyingGlassIcon"
              remixicon="RiSearchLine"
              className="size-4 shrink-0 opacity-50"
            />
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

function CommandStackBack({ className }: { className?: string }) {
  const store = useCommandStackStore("CommandStackBack");

  return (
    <button
      type="button"
      aria-label="Back"
      data-slot="command-stack-back"
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-hidden hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      onPointerDown={(event) => event.preventDefault()}
      onClick={store.popPage}
    >
      <IconPlaceholder
        lucide="ChevronLeftIcon"
        tabler="IconChevronLeft"
        hugeicons="ArrowLeft01Icon"
        phosphor="CaretLeftIcon"
        remixicon="RiArrowLeftSLine"
        className="size-4 rtl:rotate-180"
      />
    </button>
  );
}

function CommandStackList({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof CommandList>) {
  const store = useCommandStackStore("CommandStackList");
  const activePage = useCommandStackSelector(store, selectActivePage);
  const listRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useMergedRefs(ref, listRef);

  useIsoLayoutEffect(() => {
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
  const store = useCommandStackStore("CommandStackEmpty");
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
  const store = useCommandStackStore("CommandStackLoading");

  React.useEffect(() => store.registerLoading(), [store]);

  return (
    <CommandPrimitive.Loading
      data-slot="command-stack-loading"
      className={cn(
        "py-6 text-sm text-muted-foreground *:flex *:items-center *:justify-center *:gap-2",
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
  const store = useCommandStackStore("CommandStackPage");
  const isActive = useCommandStackSelector(
    store,
    (state) => getActivePage(state.pages) === value,
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
  ref,
  ...props
}: React.ComponentProps<typeof CommandGroup>) {
  const composedRef = useMergedRefs(ref, scrollHeadingWhenFocused);

  return (
    <CommandGroup
      ref={composedRef}
      data-slot="command-stack-group"
      {...props}
    />
  );
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
  children,
  ref,
  ...props
}: CommandStackItemProps) {
  const store = useCommandStackStore("CommandStackItem");
  const composedRef = useMergedRefs(ref, scrollWhenFocused);
  const pageContext = React.useContext(CommandStackPageContext);
  const selectionMode = page ? undefined : pageContext?.selectionMode;
  const checked = useCommandStackSelector(store, (state) =>
    selectionMode && pageContext && value !== undefined
      ? (state.value[pageContext.value] ?? NO_SELECTION).includes(value)
      : undefined,
  );

  return (
    <CommandItem
      ref={composedRef}
      data-slot="command-stack-item"
      data-checked={checked}
      aria-checked={checked}
      className={cn(
        checked === undefined && "[&>svg:last-child]:hidden",
        className,
      )}
      value={value}
      {...mergeProps<"div">(
        {
          onPointerDownCapture(event) {
            // A focusable item steals the input on pointerdown.
            event.preventDefault();
          },
          onMouseDown(event) {
            // iOS Safari can emit a synthetic mousedown without a pointerdown.
            event.preventDefault();
          },
        },
        { onPointerDownCapture, onMouseDown },
      )}
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
    >
      {children}
      {page && (
        <IconPlaceholder
          lucide="ChevronRightIcon"
          tabler="IconChevronRight"
          hugeicons="ArrowRight01Icon"
          phosphor="CaretRightIcon"
          remixicon="RiArrowRightSLine"
          data-slot="command-stack-item-indicator"
          className="ms-auto text-muted-foreground rtl:rotate-180 [[class*='ms-auto']~&]:ms-0"
        />
      )}
    </CommandItem>
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
