"use client";

import { ReactStore, useStore } from "@base-ui/utils/store";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "cn";
import { composeEventHandlers } from "radix-ui/internal";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/bases/radix/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/registry/bases/radix/ui/input-group";
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
  label: string | undefined;
}

interface CommandStackController {
  isPagesControlled: boolean;
  isValueControlled: boolean;
  onPagesChange?: (pages: string[]) => void;
  onValueChange?: (value: CommandStackValue) => void;
  setSearch: (search: string) => void;
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

const commandStackSelectors = {
  pages: (state: CommandStackStoreState) => state.pages,
  activePage: (state: CommandStackStoreState) => getActivePage(state.pages),
  value: (state: CommandStackStoreState) => state.value,
  pageData: (state: CommandStackStoreState) => state.pageData,
  label: (state: CommandStackStoreState) => state.label,
  isNested: (state: CommandStackStoreState) => state.pages.length > 1,
  isLoading: (state: CommandStackStoreState) => state.loadingCount > 0,
  isPageActive: (state: CommandStackStoreState, page: string) =>
    getActivePage(state.pages) === page,
  isItemChecked: (
    state: CommandStackStoreState,
    page: string,
    itemValue: string,
  ) => (state.value[page] ?? NO_SELECTION).includes(itemValue),
  pagePlaceholder: (state: CommandStackStoreState) =>
    state.pageData.get(getActivePage(state.pages))?.placeholder,
  announcement: (state: CommandStackStoreState) =>
    state.pages.length > 1
      ? (state.pageData.get(getActivePage(state.pages))?.label ??
        getActivePage(state.pages))
      : null,
};

type CommandStackStore = ReactStore<
  CommandStackStoreState,
  CommandStackController,
  typeof commandStackSelectors
>;

function setPages(store: CommandStackStore, pages: string[]) {
  if (pages.length === 0) return;
  store.context.onPagesChange?.(pages);
  if (!store.context.isPagesControlled) store.set("pages", pages);
  store.context.setSearch("");
}

function pushPage(store: CommandStackStore, page: string) {
  if (page === getActivePage(store.state.pages)) return;
  setPages(store, [...store.state.pages, page]);
}

function popPage(store: CommandStackStore) {
  if (store.state.pages.length <= 1) return;
  setPages(store, store.state.pages.slice(0, -1));
}

function setValue(store: CommandStackStore, value: CommandStackValue) {
  store.context.onValueChange?.(value);
  if (!store.context.isValueControlled) store.set("value", value);
}

function selectItem(
  store: CommandStackStore,
  page: string,
  itemValue: string,
  selectionMode: CommandStackSelectionMode,
) {
  const selected = store.state.value[page] ?? NO_SELECTION;
  const isSelected = selected.includes(itemValue);
  let nextSelected: string[];
  if (selectionMode === "multiple") {
    nextSelected = isSelected
      ? selected.filter((item) => item !== itemValue)
      : [...selected, itemValue];
  } else {
    nextSelected = isSelected ? [] : [itemValue];
  }
  setValue(store, { ...store.state.value, [page]: nextSelected });
}

function registerPage(
  store: CommandStackStore,
  page: string,
  data: CommandStackPageData,
) {
  store.set("pageData", new Map(store.state.pageData).set(page, data));
  return () => {
    const pageData = new Map(store.state.pageData);
    pageData.delete(page);
    store.set("pageData", pageData);
  };
}

function registerLoading(store: CommandStackStore) {
  store.set("loadingCount", store.state.loadingCount + 1);
  return () => store.set("loadingCount", store.state.loadingCount - 1);
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
  const pages = useStore(store, commandStackSelectors.pages);
  const value = useStore(store, commandStackSelectors.value);
  const search = React.useContext(CommandStackSearchContext);
  const actions = React.useMemo(
    () => ({
      pushPage: (page: string) => pushPage(store, page),
      popPage: () => popPage(store),
      setPages: (nextPages: string[]) => setPages(store, nextPages),
      setValue: (nextValue: CommandStackValue) => setValue(store, nextValue),
    }),
    [store],
  );

  return {
    pages,
    activePage: getActivePage(pages),
    search,
    value,
    ...actions,
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
  label: labelProp,
  className,
  children,
  ...props
}: CommandStackProps) {
  const [internalSearch, setInternalSearch] = React.useState(defaultSearch);
  const search = searchProp ?? internalSearch;

  const [store] = React.useState<CommandStackStore>(
    () =>
      new ReactStore<
        CommandStackStoreState,
        CommandStackController,
        typeof commandStackSelectors
      >(
        {
          pages: pages ?? defaultPages ?? [DEFAULT_ROOT_PAGE],
          value: valueProp ?? defaultValue,
          pageData: new Map(),
          loadingCount: 0,
          label: undefined,
        },
        {
          isPagesControlled: pages !== undefined,
          isValueControlled: valueProp !== undefined,
          onPagesChange,
          onValueChange,
          setSearch: () => {},
        },
        commandStackSelectors,
      ),
  );

  useIsoLayoutEffect(() => {
    Object.assign(store.context, {
      isPagesControlled: pages !== undefined,
      isValueControlled: valueProp !== undefined,
      onPagesChange,
      onValueChange,
      setSearch: (nextSearch: string) => {
        if (Object.is(nextSearch, search)) return;
        onSearchChange?.(nextSearch);
        if (searchProp === undefined) setInternalSearch(nextSearch);
      },
    } satisfies CommandStackController);
  });

  useIsoLayoutEffect(() => {
    if (pages !== undefined) store.set("pages", pages);
  }, [store, pages]);

  useIsoLayoutEffect(() => {
    if (valueProp !== undefined) store.set("value", valueProp);
  }, [store, valueProp]);

  const activePage = useStore(store, commandStackSelectors.activePage);
  const label = useStore(store, commandStackSelectors.label);
  const announcement = useStore(store, commandStackSelectors.announcement);

  const [highlightedValue, setHighlightedValue] = React.useState("");
  const [prevActivePage, setPrevActivePage] = React.useState(activePage);

  if (prevActivePage !== activePage) {
    setPrevActivePage(activePage);
    setHighlightedValue("");
  }

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;

      if (
        event.key === "Backspace" &&
        search.length === 0 &&
        store.state.pages.length > 1
      ) {
        event.preventDefault();
        popPage(store);
      }
    },
    [onKeyDownProp, search, store],
  );

  return (
    <CommandStackContext.Provider value={store}>
      <CommandStackSearchContext.Provider value={search}>
        <Command
          data-slot="command-stack"
          className={cn("cn-command-stack", className)}
          value={highlightedValue}
          onValueChange={setHighlightedValue}
          onKeyDown={onKeyDown}
          label={labelProp ?? label}
          {...props}
        >
          {children}
          <span aria-live="polite" className="cn-command-stack-2">
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
  const pages = useStore(store, commandStackSelectors.pages);
  const pageData = useStore(store, commandStackSelectors.pageData);

  return (
    <nav
      aria-label="Breadcrumb"
      data-slot="command-stack-breadcrumb"
      className={cn("cn-command-stack-breadcrumb", className)}
      {...props}
    >
      <ol className="cn-command-stack-breadcrumb-2">
        {pages.map((page, index) => {
          const isCurrent = index === pages.length - 1;

          return (
            <li
              key={`${page}-${index}`}
              data-slot="command-stack-breadcrumb-item"
              aria-current={isCurrent ? "page" : undefined}
              className="cn-command-stack-breadcrumb-item"
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
  ref,
  ...props
}: CommandStackInputProps) {
  const store = useCommandStackStore("CommandStackInput");
  const search = React.useContext(CommandStackSearchContext);
  const isNested = useStore(store, commandStackSelectors.isNested);
  const pagePlaceholder = useStore(
    store,
    commandStackSelectors.pagePlaceholder,
  );
  const label = props["aria-label"] ?? pagePlaceholder ?? placeholder;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const composedRef = useMergedRefs(ref, inputRef);

  React.useEffect(() => {
    const input = inputRef.current;
    const root = input?.closest("[cmdk-root]");
    if (!input || !root) return;

    // cmdk's own aria-activedescendant lags behind the highlighted item.
    const onSync = () => {
      const id = root.querySelector("[cmdk-item][aria-selected='true']")?.id;
      if (!id) {
        input.removeAttribute("aria-activedescendant");
        return;
      }
      if (input.getAttribute("aria-activedescendant") !== id) {
        input.setAttribute("aria-activedescendant", id);
      }
    };

    onSync();
    const observer = new MutationObserver(onSync);
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributeFilter: ["aria-selected", "aria-activedescendant"],
    });
    return () => observer.disconnect();
  }, []);

  useIsoLayoutEffect(() => {
    store.set("label", label);
    return () => store.set("label", undefined);
  }, [store, label]);

  const inputProps: React.ComponentProps<typeof CommandPrimitive.Input> = {
    ref: composedRef,
    placeholder: pagePlaceholder ?? placeholder,
    value: search,
    onValueChange: (nextSearch: string) => {
      store.context.setSearch(nextSearch);
      onValueChange?.(nextSearch);
    },
  };

  if (variant === "line") {
    return (
      <div
        data-slot="command-stack-input-wrapper"
        data-variant="line"
        className="cn-command-stack-input-wrapper"
      >
        {isNested ? (
          <CommandStackBack className="cn-command-stack-input" />
        ) : (
          <IconPlaceholder
            lucide="SearchIcon"
            tabler="IconSearch"
            hugeicons="Search01Icon"
            phosphor="MagnifyingGlassIcon"
            remixicon="RiSearchLine"
            className="cn-command-stack-input-2"
          />
        )}
        <CommandPrimitive.Input
          data-slot="command-stack-input"
          {...inputProps}
          className={cn("cn-command-stack-input-3", className)}
          {...props}
        />
      </div>
    );
  }

  return (
    <div
      data-slot="command-stack-input-wrapper"
      data-variant="default"
      className="cn-command-input-wrapper"
    >
      <InputGroup className="cn-command-input-group">
        <CommandPrimitive.Input
          data-slot="command-stack-input"
          {...inputProps}
          className={cn(
            "cn-command-input outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
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
              className="cn-command-stack-back"
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => popPage(store)}
            >
              <IconPlaceholder
                lucide="ChevronLeftIcon"
                tabler="IconChevronLeft"
                hugeicons="ArrowLeft01Icon"
                phosphor="CaretLeftIcon"
                remixicon="RiArrowLeftSLine"
                className="cn-rtl-flip"
              />
            </InputGroupButton>
          ) : (
            <IconPlaceholder
              lucide="SearchIcon"
              tabler="IconSearch"
              hugeicons="Search01Icon"
              phosphor="MagnifyingGlassIcon"
              remixicon="RiSearchLine"
              className="cn-command-input-icon"
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
      className={cn("cn-command-stack-back-2", className)}
      onPointerDown={(event) => event.preventDefault()}
      onClick={() => popPage(store)}
    >
      <IconPlaceholder
        lucide="ChevronLeftIcon"
        tabler="IconChevronLeft"
        hugeicons="ArrowLeft01Icon"
        phosphor="CaretLeftIcon"
        remixicon="RiArrowLeftSLine"
        className="cn-command-stack-back-3 cn-rtl-flip"
      />
    </button>
  );
}

function CommandStackList({
  label: labelProp,
  className,
  ref,
  ...props
}: React.ComponentProps<typeof CommandList>) {
  const store = useCommandStackStore("CommandStackList");
  const activePage = useStore(store, commandStackSelectors.activePage);
  const label = useStore(store, commandStackSelectors.label);
  const listRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useMergedRefs(ref, listRef);

  useIsoLayoutEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [activePage]);

  return (
    <CommandList
      ref={composedRef}
      data-slot="command-stack-list"
      label={labelProp ?? label}
      className={cn("cn-command-stack-list", className)}
      {...props}
    />
  );
}

function CommandStackEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandEmpty>) {
  const store = useCommandStackStore("CommandStackEmpty");
  const isLoading = useStore(store, commandStackSelectors.isLoading);

  if (isLoading) return null;

  return (
    <CommandEmpty
      data-slot="command-stack-empty"
      className={cn("[[cmdk-list]:has([cmdk-item])_&]:hidden", className)}
      {...props}
    />
  );
}

function CommandStackLoading({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Loading>) {
  const store = useCommandStackStore("CommandStackLoading");

  React.useEffect(() => registerLoading(store), [store]);

  return (
    <CommandPrimitive.Loading
      data-slot="command-stack-loading"
      className={cn("cn-command-stack-loading", className)}
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
  const isActive = useStore(store, commandStackSelectors.isPageActive, value);

  React.useEffect(() => {
    if (label === undefined && placeholder === undefined) return;
    return registerPage(store, value, { label, placeholder });
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
  const isItemChecked = useStore(
    store,
    commandStackSelectors.isItemChecked,
    pageContext?.value ?? "",
    value ?? "",
  );
  const checked =
    selectionMode && pageContext && value !== undefined
      ? isItemChecked
      : undefined;

  return (
    <CommandItem
      ref={composedRef}
      data-slot="command-stack-item"
      data-checked={checked}
      className={cn(
        "cn-command-stack-item",
        checked === undefined && "[&>svg:last-child]:hidden",
        className,
      )}
      value={value}
      onPointerDownCapture={composeEventHandlers(
        onPointerDownCapture,
        (event) => {
          // A focusable item steals the input on pointerdown.
          event.preventDefault();
          if (event.pointerType === "touch") return;
          event.currentTarget
            .closest("[cmdk-root]")
            ?.querySelector<HTMLInputElement>("[cmdk-input]")
            ?.focus();
        },
      )}
      onMouseDown={composeEventHandlers(onMouseDown, (event) => {
        // iOS Safari can emit a synthetic mousedown without a pointerdown.
        event.preventDefault();
      })}
      onSelect={(itemValue) => {
        onSelect?.(itemValue);
        if (page) {
          pushPage(store, page);
          return;
        }
        if (selectionMode && pageContext && value !== undefined) {
          selectItem(store, pageContext.value, value, selectionMode);
        }
      }}
      {...props}
    >
      {children}
      {checked && (
        <span role="img" aria-label=", checked" className="sr-only" />
      )}
      {page && (
        <IconPlaceholder
          lucide="ChevronRightIcon"
          tabler="IconChevronRight"
          hugeicons="ArrowRight01Icon"
          phosphor="CaretRightIcon"
          remixicon="RiArrowRightSLine"
          data-slot="command-stack-item-indicator"
          className="cn-command-stack-item-indicator cn-rtl-flip"
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
