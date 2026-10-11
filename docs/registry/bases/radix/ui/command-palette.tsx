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

const ROOT_NAME = "CommandPalette";
const PAGE_NAME = "CommandPalettePage";
const ITEM_NAME = "CommandPaletteItem";
const INPUT_NAME = "CommandPaletteInput";
const EMPTY_NAME = "CommandPaletteEmpty";
const LOADING_NAME = "CommandPaletteLoading";
const BREADCRUMB_NAME = "CommandPaletteBreadcrumb";

const DEFAULT_ROOT_PAGE = "root";

interface CommandPaletteContextValue {
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

const CommandPaletteContext =
  React.createContext<CommandPaletteContextValue | null>(null);

function useCommandPaletteContext(consumerName: string) {
  const context = React.useContext(CommandPaletteContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useCommandPalette() {
  const { pages, activePage, search, pushPage, popPage, setPages } =
    useCommandPaletteContext("useCommandPalette");

  return { pages, activePage, search, pushPage, popPage, setPages };
}

interface CommandPaletteProps extends React.ComponentProps<typeof Command> {
  pages?: string[];
  defaultPages?: string[];
  onPagesChange?: (pages: string[]) => void;
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;
}

function CommandPalette(props: CommandPaletteProps) {
  const {
    pages: pagesProp,
    defaultPages,
    onPagesChange,
    search: searchProp,
    defaultSearch = "",
    onSearchChange: onSearchChangeProp,
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

  const contextValue = React.useMemo<CommandPaletteContextValue>(
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
    <CommandPaletteContext.Provider value={contextValue}>
      <Command
        data-slot="command-palette"
        className={cn("h-auto p-0", className)}
        onKeyDown={onKeyDown}
        {...commandProps}
      >
        {children}
        <span aria-live="polite" className="sr-only">
          {pages.length > 1 ? (labels.get(activePage) ?? activePage) : null}
        </span>
      </Command>
    </CommandPaletteContext.Provider>
  );
}

function CommandPaletteBreadcrumb({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  const { pages, labels } = useCommandPaletteContext(BREADCRUMB_NAME);

  return (
    <nav
      aria-label="Breadcrumb"
      data-slot="command-palette-breadcrumb"
      className={cn("px-3 pt-3", className)}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {pages.map((page, index) => {
          const isCurrent = index === pages.length - 1;

          return (
            <li
              key={`${page}-${index}`}
              data-slot="command-palette-breadcrumb-item"
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

function CommandPaletteInput({
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof CommandPrimitive.Input>, "value">) {
  const { search, onSearchChange } = useCommandPaletteContext(INPUT_NAME);

  return (
    <div
      data-slot="command-palette-input-wrapper"
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
        data-slot="command-palette-input"
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

function CommandPaletteList({
  className,
  ...props
}: React.ComponentProps<typeof CommandList>) {
  return (
    <CommandList
      data-slot="command-palette-list"
      className={cn(
        "p-1 [&_[cmdk-list-sizer]:has(>[cmdk-item])]:p-1",
        className,
      )}
      {...props}
    />
  );
}

function CommandPaletteEmpty(props: React.ComponentProps<typeof CommandEmpty>) {
  const { isLoading } = useCommandPaletteContext(EMPTY_NAME);

  if (isLoading) return null;

  return <CommandEmpty data-slot="command-palette-empty" {...props} />;
}

function CommandPaletteLoading({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Loading>) {
  const { registerLoading } = useCommandPaletteContext(LOADING_NAME);

  React.useEffect(() => registerLoading(), [registerLoading]);

  return (
    <CommandPrimitive.Loading
      data-slot="command-palette-loading"
      className={cn(
        "flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

interface CommandPalettePageProps {
  value: string;
  label?: React.ReactNode;
  children?: React.ReactNode;
}

function CommandPalettePage({
  value,
  label,
  children,
}: CommandPalettePageProps) {
  const { activePage, registerLabel } = useCommandPaletteContext(PAGE_NAME);

  React.useEffect(() => {
    if (label === undefined) return;
    return registerLabel(value, label);
  }, [value, label, registerLabel]);

  if (activePage !== value) return null;

  return children;
}

function CommandPaletteGroup(props: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup data-slot="command-palette-group" {...props} />;
}

interface CommandPaletteItemProps extends React.ComponentProps<
  typeof CommandItem
> {
  page?: string;
}

function CommandPaletteItem({
  page,
  onSelect,
  className,
  ...props
}: CommandPaletteItemProps) {
  const { pushPage } = useCommandPaletteContext(ITEM_NAME);

  return (
    <CommandItem
      data-slot="command-palette-item"
      className={cn("scroll-my-1 [&>svg:last-child]:hidden", className)}
      onSelect={(value) => {
        onSelect?.(value);
        if (page) pushPage(page);
      }}
      {...props}
    />
  );
}

function CommandPaletteShortcut(
  props: React.ComponentProps<typeof CommandShortcut>,
) {
  return <CommandShortcut data-slot="command-palette-shortcut" {...props} />;
}

function CommandPaletteSeparator(
  props: React.ComponentProps<typeof CommandSeparator>,
) {
  return <CommandSeparator data-slot="command-palette-separator" {...props} />;
}

export {
  CommandPalette,
  CommandPaletteBreadcrumb,
  CommandPaletteEmpty,
  CommandPaletteGroup,
  CommandPaletteInput,
  CommandPaletteItem,
  CommandPaletteList,
  CommandPaletteLoading,
  CommandPalettePage,
  CommandPaletteSeparator,
  CommandPaletteShortcut,
  useCommandPalette,
};
