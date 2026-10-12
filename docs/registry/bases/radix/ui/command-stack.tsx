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

interface CommandStackContextValue {
  pages: string[];
  activePage: string;
  search: string;
  labels: Map<string, React.ReactNode>;
  isLoading: boolean;
  onSearchChange: (search: string) => void;
  pushPage: (page: string) => void;
  popPage: () => void;
  setPages: (pages: string[]) => void;
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

function useCommandStack() {
  const { pages, activePage, search, pushPage, popPage, setPages } =
    useCommandStackContext("useCommandStack");

  return { pages, activePage, search, pushPage, popPage, setPages };
}

interface CommandStackProps extends React.ComponentProps<typeof Command> {
  pages?: string[];
  defaultPages?: string[];
  onPagesChange?: (pages: string[]) => void;
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;
}

function CommandStack(props: CommandStackProps) {
  const {
    pages: pagesProp,
    defaultPages,
    onPagesChange,
    search: searchProp,
    defaultSearch = "",
    onSearchChange: onSearchChangeProp,
    value: valueProp,
    defaultValue = "",
    onValueChange: onValueChangeProp,
    onKeyDown: onKeyDownProp,
    className,
    children,
    ...commandProps
  } = props;

  const [pagesState, setPagesState] = React.useState<string[]>(
    () => defaultPages ?? [DEFAULT_ROOT_PAGE],
  );
  const pages = pagesProp ?? pagesState;
  const activePage = pages[pages.length - 1] ?? DEFAULT_ROOT_PAGE;

  const [searchState, setSearchState] = React.useState(defaultSearch);
  const [valueState, setValueState] = React.useState(defaultValue);
  const value = valueProp ?? valueState;

  const onValueChange = React.useCallback(
    (nextValue: string) => {
      if (valueProp === undefined) setValueState(nextValue);
      onValueChangeProp?.(nextValue);
    },
    [valueProp, onValueChangeProp],
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
      onValueChange("");
    },
    [pagesProp, onPagesChange, onSearchChange, onValueChange],
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
      labels,
      isLoading: loadingCount > 0,
      onSearchChange,
      pushPage,
      popPage,
      setPages,
      registerLabel,
      registerLoading,
    }),
    [
      pages,
      activePage,
      search,
      labels,
      loadingCount,
      onSearchChange,
      pushPage,
      popPage,
      setPages,
      registerLabel,
      registerLoading,
    ],
  );

  return (
    <CommandStackContext.Provider value={contextValue}>
      <Command
        data-slot="command-stack"
        className={cn("h-auto p-0", className)}
        value={value}
        onValueChange={onValueChange}
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

function CommandStackEmpty(props: React.ComponentProps<typeof CommandEmpty>) {
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
  children?: React.ReactNode;
}

function CommandStackPage({ value, label, children }: CommandStackPageProps) {
  const { activePage, registerLabel } = useCommandStackContext(PAGE_NAME);

  React.useEffect(() => {
    if (label === undefined) return;
    return registerLabel(value, label);
  }, [value, label, registerLabel]);

  if (activePage !== value) return null;

  return children;
}

function CommandStackGroup(props: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup data-slot="command-stack-group" {...props} />;
}

interface CommandStackItemProps extends React.ComponentProps<
  typeof CommandItem
> {
  page?: string;
}

function CommandStackItem({
  page,
  onSelect,
  className,
  ...props
}: CommandStackItemProps) {
  const { pushPage } = useCommandStackContext(ITEM_NAME);

  return (
    <CommandItem
      data-slot="command-stack-item"
      className={cn("scroll-my-1 [&>svg:last-child]:hidden", className)}
      onSelect={(value) => {
        onSelect?.(value);
        if (page) pushPage(page);
      }}
      {...props}
    />
  );
}

function CommandStackShortcut(
  props: React.ComponentProps<typeof CommandShortcut>,
) {
  return <CommandShortcut data-slot="command-stack-shortcut" {...props} />;
}

function CommandStackSeparator(
  props: React.ComponentProps<typeof CommandSeparator>,
) {
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
};
