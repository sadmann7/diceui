"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { SearchState } from "@/types/data-grid";

interface DataGridSearchProps extends SearchState {}

export const DataGridSearch = React.memo(DataGridSearchImpl, (prev, next) => {
  if (prev.searchOpen !== next.searchOpen) return false;

  if (!next.searchOpen) return true;

  if (
    prev.searchQuery !== next.searchQuery ||
    prev.matchIndex !== next.matchIndex
  ) {
    return false;
  }

  if (prev.searchMatches.length !== next.searchMatches.length) return false;

  for (let i = 0; i < prev.searchMatches.length; i++) {
    const prevMatch = prev.searchMatches[i];
    const nextMatch = next.searchMatches[i];

    if (!prevMatch || !nextMatch) return false;

    if (
      prevMatch.rowIndex !== nextMatch.rowIndex ||
      prevMatch.columnId !== nextMatch.columnId
    ) {
      return false;
    }
  }

  return true;
});

function DataGridSearchImpl({
  searchMatches,
  matchIndex,
  searchOpen,
  onSearchOpenChange,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onNavigateToNextMatch,
  onNavigateToPrevMatch,
}: DataGridSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [searchOpen]);

  React.useEffect(() => {
    if (!searchOpen) return;

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onSearchOpenChange(false);
      }
    }

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [searchOpen, onSearchOpenChange]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      event.stopPropagation();

      if (event.key === "Enter") {
        event.preventDefault();
        if (event.shiftKey) {
          onNavigateToPrevMatch();
        } else {
          onNavigateToNextMatch();
        }
      }
    },
    [onNavigateToNextMatch, onNavigateToPrevMatch],
  );

  const debouncedSearch = useDebouncedCallback((query: string) => {
    onSearch(query);
  }, 150);

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      onSearchQueryChange(value);
      debouncedSearch(value);
    },
    [onSearchQueryChange, debouncedSearch],
  );

  const onTriggerPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      // prevent implicit pointer capture
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }

      // Only prevent default if we're not clicking on the input
      // This allows text selection in the input while still preventing focus stealing elsewhere
      if (
        event.button === 0 &&
        event.ctrlKey === false &&
        event.pointerType === "mouse" &&
        !(event.target instanceof HTMLInputElement)
      ) {
        event.preventDefault();
      }
    },
    [],
  );

  const onPrevMatchPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) =>
      onTriggerPointerDown(event),
    [onTriggerPointerDown],
  );

  const onNextMatchPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) =>
      onTriggerPointerDown(event),
    [onTriggerPointerDown],
  );

  const onClose = React.useCallback(() => {
    onSearchOpenChange(false);
  }, [onSearchOpenChange]);

  if (!searchOpen) return null;

  return (
    <div
      role="search"
      data-slot="grid-search"
      className="fade-in-0 slide-in-from-top-2 absolute top-4 right-4 z-50 flex animate-in flex-col gap-2 rounded-lg border bg-background p-2 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <Input
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Find in table..."
          className="h-8 w-64"
          ref={inputRef}
          value={searchQuery}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        <div className="flex items-center gap-1">
          <Button
            aria-label="Previous match"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onNavigateToPrevMatch}
            onPointerDown={onPrevMatchPointerDown}
            disabled={searchMatches.length === 0}
          >
            <ChevronUp />
          </Button>
          <Button
            aria-label="Next match"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onNavigateToNextMatch}
            onPointerDown={onNextMatchPointerDown}
            disabled={searchMatches.length === 0}
          >
            <ChevronDown />
          </Button>
          <Button
            aria-label="Close search"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-1 whitespace-nowrap text-muted-foreground text-xs">
        {searchMatches.length > 0 ? (
          <span>
            {matchIndex + 1} of {searchMatches.length}
          </span>
        ) : searchQuery ? (
          <span>No results</span>
        ) : (
          <span>Type to search</span>
        )}
      </div>
    </div>
  );
}
