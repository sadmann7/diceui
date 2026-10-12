"use client";

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
} from "@/registry/bases/radix/ui/command";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

const ROOT_NAME = "CommandStack";
const PAGE_NAME = "CommandStackPage";
const ITEM_NAME = "CommandStackItem";
const INPUT_NAME = "CommandStackInput";
const EMPTY_NAME = "CommandStackEmpty";
const LOADING_NAME = "CommandStackLoading";
const BREADCRUMB_NAME = "CommandStackBreadcrumb";

const DEFAULT_ROOT_PAGE = "root";

type CommandStackValue = Record<string, string[]>;
type CommandStackSelectionMode = "single" | "multiple";

const EMPTY_VALUE: CommandStackValue = {};
const NO_SELECTION: string[] = [];

interface CommandStackContextValue {
  pages: string[];
  activePage: string;
  search: string;
  value: CommandStackValue;
  labels: Map<string, React.ReactNode>;
  isLoading: boolean;
  onSearchChange: (search: string) => void;
  pushPage: (page: string) => void;
  popPage: () => void;
  setPages: (pages: string[]) => void;
  setValue: (value: CommandStackValue) => void;
  selectItem: (
    page: string,
    itemValue: string,
    selectionMode: CommandStackSelectionMode,
  ) => void;
  registerLabel: (page: string, label: React.ReactNode) => () => void;
  registerLoading: () => () => void;
}

const CommandStackContext =
  React.createContext<CommandStackContextValue | null>(null);

function useCommandStackContext(consumerName: string) {
  const context = React.useContext(CommandStackContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface CommandStackPageContextValue {
  value: string;
  selectionMode?: CommandStackSelectionMode;
}

const CommandStackPageContext =
  React.createContext<CommandStackPageContextValue | null>(null);

function useCommandStack() {
  const {
    pages,
    activePage,
    search,
    value,
    pushPage,
    popPage,
    setPages,
    setValue,
  } = useCommandStackContext("useCommandStack");

  return {
    pages,
    activePage,
    search,
    value,
    pushPage,
    popPage,
    setPages,
    setValue,
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
  onSearchChange: onSearchChangeProp,
  value: valueProp,
  defaultValue = EMPTY_VALUE,
  onValueChange,
  onKeyDown: onKeyDownProp,
  className,
  children,
  ...commandProps
}: CommandStackProps) {
  const [pagesState, setPagesState] = React.useState<string[]>(
    () => defaultPages ?? [DEFAULT_ROOT_PAGE],
  );
  const pages = pagesProp ?? pagesState;
  const activePage = pages[pages.length - 1] ?? DEFAULT_ROOT_PAGE;

  const [searchState, setSearchState] = React.useState(defaultSearch);
  const [highlight, setHighlight] = React.useState("");
  const [valueState, setValueState] = React.useState(defaultValue);
  const value = valueProp ?? valueState;

  const setValue = React.useCallback(
    (nextValue: CommandStackValue) => {
      if (valueProp === undefined) setValueState(nextValue);
      onValueChange?.(nextValue);
    },
    [valueProp, onValueChange],
  );

  const selectItem = React.useCallback(
    (
      page: string,
      itemValue: string,
      selectionMode: CommandStackSelectionMode,
    ) => {
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
      setValue({ ...value, [page]: nextSelected });
    },
    [value, setValue],
  );

  const search = searchProp ?? searchState;

  const [labels, setLabels] = React.useState<Map<string, React.ReactNode>>(
    () => new Map(),
  );
  const [loadingCount, setLoadingCount] = React.useState(0);
  const onSearchChange = React.useCallback(
    (nextSearch: string) => {
      if (searchProp === undefined) setSearchState(nextSearch);
      onSearchChangeProp?.(nextSearch);
    },
    [searchProp, onSearchChangeProp],
  );

  const setPages = React.useCallback(
    (nextPages: string[]) => {
      if (nextPages.length === 0) return;
      if (pagesProp === undefined) setPagesState(nextPages);
      onPagesChange?.(nextPages);
      onSearchChange("");
      setHighlight("");
    },
    [pagesProp, onPagesChange, onSearchChange],
  );

  const pushPage = React.useCallback(
    (page: string) => {
      if (page === activePage) return;
      setPages([...pages, page]);
    },
    [pages, activePage, setPages],
  );

  const popPage = React.useCallback(() => {
    if (pages.length <= 1) return;
    setPages(pages.slice(0, -1));
  }, [pages, setPages]);

  const registerLabel = React.useCallback(
    (page: string, label: React.ReactNode) => {
      setLabels((prev) => new Map(prev).set(page, label));
      return () => {
        setLabels((prev) => {
          const next = new Map(prev);
          next.delete(page);
          return next;
        });
      };
    },
    [],
  );

  const registerLoading = React.useCallback(() => {
    setLoadingCount((count) => count + 1);
    return () => setLoadingCount((count) => count - 1);
  }, []);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;

      if (
        event.key === "Backspace" &&
        search.length === 0 &&
        pages.length > 1
      ) {
        event.preventDefault();
        popPage();
      }
    },
    [onKeyDownProp, search, pages.length, popPage],
  );

  const contextValue = React.useMemo<CommandStackContextValue>(
    () => ({
      pages,
      activePage,
      search,
      value,
      labels,
      isLoading: loadingCount > 0,
      onSearchChange,
      pushPage,
      popPage,
      setPages,
      setValue,
      selectItem,
      registerLabel,
      registerLoading,
    }),
    [
      pages,
      activePage,
      search,
      value,
      labels,
      loadingCount,
      onSearchChange,
      pushPage,
      popPage,
      setPages,
      setValue,
      selectItem,
      registerLabel,
      registerLoading,
    ],
  );

  return (
    <CommandStackContext.Provider value={contextValue}>
      <Command
        data-slot="command-stack"
        className={cn("h-auto p-0", className)}
        value={highlight}
        onValueChange={setHighlight}
        onKeyDown={onKeyDown}
        {...commandProps}
      >
        {children}
        <span aria-live="polite" className="sr-only">
          {pages.length > 1 ? (labels.get(activePage) ?? activePage) : null}
        </span>
      </Command>
    </CommandStackContext.Provider>
  );
}

function CommandStackBreadcrumb({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  const { pages, labels } = useCommandStackContext(BREADCRUMB_NAME);

  return (
    <nav
      aria-label="Breadcrumb"
      data-slot="command-stack-breadcrumb"
      className={cn("px-3 pt-3", className)}
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
              {labels.get(page) ?? page}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CommandStackInput({
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof CommandPrimitive.Input>, "value">) {
  const { search, onSearchChange } = useCommandStackContext(INPUT_NAME);

  return (
    <div
      data-slot="command-stack-input-wrapper"
      className="flex items-center gap-2 border-b px-3"
    >
      <IconPlaceholder
        lucide="SearchIcon"
        tabler="IconSearch"
        hugeicons="Search01Icon"
        phosphor="MagnifyingGlassIcon"
        remixicon="RiSearchLine"
        className="size-4 shrink-0 text-muted-foreground"
      />
      <CommandPrimitive.Input
        data-slot="command-stack-input"
        value={search}
        onValueChange={(nextSearch) => {
          onSearchChange(nextSearch);
          onValueChange?.(nextSearch);
        }}
        className={cn(
          "flex h-11 w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandStackList({
  className,
  ...props
}: React.ComponentProps<typeof CommandList>) {
  return (
    <CommandList
      data-slot="command-stack-list"
      className={cn(
        "p-1 [&_[cmdk-list-sizer]:has(>[cmdk-item])]:p-1",
        className,
      )}
      {...props}
    />
  );
}

function CommandStackEmpty({
  ...props
}: React.ComponentProps<typeof CommandEmpty>) {
  const { isLoading } = useCommandStackContext(EMPTY_NAME);

  if (isLoading) return null;

  return <CommandEmpty data-slot="command-stack-empty" {...props} />;
}

function CommandStackLoading({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Loading>) {
  const { registerLoading } = useCommandStackContext(LOADING_NAME);

  React.useEffect(() => registerLoading(), [registerLoading]);

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
  selectionMode?: CommandStackSelectionMode;
  children?: React.ReactNode;
}

function CommandStackPage({
  value,
  label,
  selectionMode,
  children,
}: CommandStackPageProps) {
  const { activePage, registerLabel } = useCommandStackContext(PAGE_NAME);

  React.useEffect(() => {
    if (label === undefined) return;
    return registerLabel(value, label);
  }, [value, label, registerLabel]);

  const pageContextValue = React.useMemo<CommandStackPageContextValue>(
    () => ({ value, selectionMode }),
    [value, selectionMode],
  );

  if (activePage !== value) return null;

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
  className,
  ...props
}: CommandStackItemProps) {
  const {
    value: selection,
    pushPage,
    selectItem,
  } = useCommandStackContext(ITEM_NAME);
  const pageContext = React.useContext(CommandStackPageContext);
  const selectionMode = page ? undefined : pageContext?.selectionMode;
  const checked =
    selectionMode && pageContext && value !== undefined
      ? (selection[pageContext.value] ?? NO_SELECTION).includes(value)
      : undefined;

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
      onSelect={(itemValue) => {
        onSelect?.(itemValue);
        if (page) {
          pushPage(page);
          return;
        }
        if (selectionMode && pageContext && value !== undefined) {
          selectItem(pageContext.value, value, selectionMode);
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
