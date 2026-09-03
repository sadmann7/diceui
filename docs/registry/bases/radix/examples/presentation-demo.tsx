"use client";

import { useCreatePresentationStore } from "@diceui/pptx";
import * as React from "react";

import { Input } from "@/registry/bases/radix/ui/input";
import { Label } from "@/registry/bases/radix/ui/label";
import {
  Presentation,
  PresentationContent,
  PresentationError,
  PresentationLoading,
  PresentationProvider,
  PresentationSelection,
  PresentationSlide,
  PresentationThumbnailList,
  PresentationViewport,
} from "@/registry/bases/radix/ui/presentation";

const DEMO_DECK_PATH = "/assets/demo.pptx";

export default function PresentationDemo() {
  const id = React.useId();
  const store = useCreatePresentationStore();

  React.useEffect(() => {
    fetch(DEMO_DECK_PATH)
      .then((res) => {
        // fetch resolves on 404, so an unchecked body would reach the parser as
        // an error page rather than a deck.
        if (!res.ok) throw new Error(`${DEMO_DECK_PATH}: ${res.status}.`);
        return res.arrayBuffer();
      })
      .then((buffer) => store.load(buffer))
      .catch(() => {
        // Fail silently to avoid blocking the main thread.
      });
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- store is a stable ref, intentionally omitted from deps
  }, []);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await store.load(file, { readOnly: false });
    } catch {
      // Fail silently because `load()` already wrote the failure to `store.error`.
    }
  }

  return (
    <div className="flex size-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Label
          htmlFor={`${id}-file`}
          className="shrink-0 text-sm text-muted-foreground"
        >
          Open .pptx
        </Label>
        <Input
          id={`${id}-file`}
          type="file"
          accept=".pptx"
          className="h-8 max-w-xs cursor-pointer text-xs"
          onChange={onFileChange}
        />
      </div>
      <PresentationProvider store={store}>
        <Presentation className="min-h-0 flex-1">
          <PresentationThumbnailList />
          <PresentationContent>
            <PresentationLoading />
            <PresentationError />
            <PresentationViewport>
              <PresentationSlide>
                <PresentationSelection undoRedoShortcuts />
              </PresentationSlide>
            </PresentationViewport>
          </PresentationContent>
        </Presentation>
      </PresentationProvider>
    </div>
  );
}
