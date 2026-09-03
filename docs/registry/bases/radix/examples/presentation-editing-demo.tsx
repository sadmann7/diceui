"use client";

import type { PresentationStore } from "@diceui/pptx";
import type {
  DragEndEvent,
  DragStartEvent,
  DropAnimation,
} from "@dnd-kit/core";

import {
  useCreatePresentationStore,
  useHistory,
  usePresentation,
} from "@diceui/pptx";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  defaultDropAnimation,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Redo2Icon, Undo2Icon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PresentationZoomSelect } from "@/registry/bases/radix/components/presentation-zoom-select";
import { Button } from "@/registry/bases/radix/ui/button";
import { Input } from "@/registry/bases/radix/ui/input";
import {
  Presentation,
  PresentationContent,
  PresentationError,
  PresentationLoading,
  PresentationProvider,
  PresentationSelection,
  PresentationSlide,
  PresentationThumbnailItem,
  PresentationThumbnailItemNumber,
  PresentationThumbnailItemPreview,
  PresentationThumbnailList,
  PresentationViewport,
} from "@/registry/bases/radix/ui/presentation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/bases/radix/ui/tooltip";

const DEMO_DECK_PATH = "/assets/demo.pptx";

/**
 * Keeps the source item visible during the drop animation.
 *
 * The default side effect sets its opacity to `0`, delaying the thumbnail
 * item's focus ring from reappearing until roughly 250 ms after pointer release.
 */
const DROP_ANIMATION: DropAnimation = {
  ...defaultDropAnimation,
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: {} } }),
};

export default function PresentationEditingDemo() {
  const store = useCreatePresentationStore();

  React.useEffect(() => {
    fetch(DEMO_DECK_PATH)
      .then((res) => {
        // fetch resolves on 404, so an unchecked body would reach the parser as
        // an error page rather than a deck.
        if (!res.ok) throw new Error(`${DEMO_DECK_PATH}: ${res.status}.`);
        return res.arrayBuffer();
      })
      // Editing and reordering both need the source package retained.
      .then((buffer) => store.load(buffer, { readOnly: false }))
      .catch(() => {
        // Fail silently to avoid blocking the main thread.
      });
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- store is a stable ref, intentionally omitted from deps
  }, []);

  return (
    <div className="flex size-full flex-col overflow-hidden">
      <PresentationProvider store={store}>
        <PresentationToolbar store={store} />
        <Presentation className="min-h-0 flex-1">
          <SortableThumbnailList store={store} />
          <PresentationContent>
            <PresentationLoading />
            <PresentationError />
            <PresentationViewport autoFit autoFitPadding={10}>
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

function PresentationToolbar({ store }: { store: PresentationStore }) {
  const id = React.useId();
  const { status } = usePresentation();
  const { canUndo, canRedo, undo, redo } = useHistory();

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
    <div className="flex items-center gap-2 border-b p-1.5">
      <label htmlFor={`${id}-file`} className="sr-only">
        Open .pptx
      </label>
      <Input
        id={`${id}-file`}
        type="file"
        accept=".pptx"
        className="h-8 max-w-56 py-px text-xs"
        onChange={onFileChange}
      />
      <span className="min-w-0 truncate text-sm text-muted-foreground">
        {status === "ready"
          ? "Drag a shape to move it, or drag a thumbnail to reorder the deck"
          : "Loading sample deck…"}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-auto inline-block w-fit">
            <Button
              aria-label="Undo"
              variant="ghost"
              size="icon-sm"
              disabled={!canUndo}
              onClick={() => undo()}
            >
              <Undo2Icon />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Undo</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block w-fit">
            <Button
              aria-label="Redo"
              variant="ghost"
              size="icon-sm"
              disabled={!canRedo}
              onClick={() =>
                void redo().catch(() => toast.error("Redo failed"))
              }
            >
              <Redo2Icon />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Redo</TooltipContent>
      </Tooltip>
      <PresentationZoomSelect />
    </div>
  );
}

function SortableThumbnailList({ store }: { store: PresentationStore }) {
  const { presentation } = usePresentation();
  const slideIds = presentation?.slides.map((slide) => slide.id) ?? [];

  /**
   * Order to paint while a drop is being committed. `store.edit()` is async, so
   * without this the strip would snap back to the old order for a frame between
   * the pointer release and the edit landing.
   */
  const [pendingIds, setPendingIds] = React.useState<string[] | null>(null);
  const orderedIds = pendingIds ?? slideIds;

  /** Slide under the pointer, mirrored into the drag overlay. */
  const [draggedId, setDraggedId] = React.useState<string | null>(null);

  // Pointer only: the list owns ArrowUp/ArrowDown for roving focus, so a
  // keyboard drag sensor bound to the same keys would fight it.
  const sensors = useSensors(
    // A small threshold keeps a plain click selecting the slide instead of
    // starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggedId(null);
    if (!over || active.id === over.id) return;

    const slideId = String(active.id);
    const toIndex = orderedIds.indexOf(String(over.id));
    if (toIndex === -1) return;

    const fromIndex = orderedIds.indexOf(slideId);
    if (fromIndex === -1) return;

    const next = [...orderedIds];
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, slideId);
    setPendingIds(next);

    try {
      await store.edit({ type: "moveSlide", slideId, toIndex });
    } finally {
      // The store is the source of truth again once the edit settles.
      setPendingIds(null);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      // A transformed child still counts toward its scroll container's overflow,
      // so an unclamped drag past the last thumbnail grows scrollHeight, which
      // lets auto-scroll run, which grows the transform again: the strip scrolls
      // forever. Clamping the drag to the scroll port breaks that loop.
      modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
      onDragStart={({ active }: DragStartEvent) =>
        setDraggedId(String(active.id))
      }
      onDragCancel={() => setDraggedId(null)}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={orderedIds}
        strategy={verticalListSortingStrategy}
      >
        <PresentationThumbnailList>
          {() => (
            <>
              {orderedIds.map((slideId) => (
                <SortableItem key={slideId} slideId={slideId} />
              ))}
              {/*
               * Inside the list so the floating copy can read the list context
               * it needs to paint a real miniature. It is fixed-positioned, so
               * the strip's overflow does not clip it.
               */}
              <DragOverlay dropAnimation={DROP_ANIMATION}>
                {draggedId ? (
                  <PresentationThumbnailItem
                    decorative
                    slideId={draggedId}
                    className="h-full cursor-grabbing bg-background shadow-lg"
                  >
                    <PresentationThumbnailItemNumber />
                    <PresentationThumbnailItemPreview />
                  </PresentationThumbnailItem>
                ) : null}
              </DragOverlay>
            </>
          )}
        </PresentationThumbnailList>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({ slideId }: { slideId: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: slideId,
  });

  // dnd-kit sets role="button" and tabIndex={0}; both would override what the
  // list needs, replacing the `option` role and putting every thumbnail in the
  // tab order instead of the one roving tab stop.
  const { role: _role, tabIndex: _tabIndex, ...dragAttributes } = attributes;

  return (
    <PresentationThumbnailItem
      slideId={slideId}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      // The overlay carries the thumbnail during the drag, so what stays in the
      // list is just the slot it will land in.
      className={isDragging ? "opacity-30" : undefined}
      onSelect={(event) => {
        // Pressing a thumbnail focuses it, and focus navigates. Suppress that
        // while dragging so the deck does not jump mid-gesture.
        if (isDragging) event.preventDefault();
      }}
      {...dragAttributes}
      {...listeners}
    >
      <PresentationThumbnailItemNumber />
      <PresentationThumbnailItemPreview />
    </PresentationThumbnailItem>
  );
}
