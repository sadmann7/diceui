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
  useSelection,
} from "@diceui/pptx";
import {
  closestCenter,
  defaultDropAnimation,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  PointerSensor,
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
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BaselineIcon,
  BoldIcon,
  BringToFrontIcon,
  ItalicIcon,
  Redo2Icon,
  SendToBackIcon,
  SquareIcon,
  TableIcon,
  Trash2Icon,
  TypeIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PresentationZoomSelect } from "@/registry/bases/radix/components/presentation-zoom-select";
import { Button } from "@/registry/bases/radix/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/bases/radix/ui/dropdown-menu";
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
import { Separator } from "@/registry/bases/radix/ui/separator";
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

const TEXT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Green", value: "#16a34a" },
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#9333ea" },
];

const TEXT_TOGGLES = [
  { key: "bold", label: "Bold", icon: BoldIcon },
  { key: "italic", label: "Italic", icon: ItalicIcon },
  { key: "underline", label: "Underline", icon: UnderlineIcon },
] as const;

const ALIGNMENTS = [
  { align: "left", label: "Align left", icon: AlignLeftIcon },
  { align: "center", label: "Align center", icon: AlignCenterIcon },
  { align: "right", label: "Align right", icon: AlignRightIcon },
] as const;

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
    <div
      data-pptx-keep-selection=""
      className="flex items-center gap-1 border-b p-1.5"
    >
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
      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
        <ToolbarButton
          label="Undo"
          disabled={!canUndo}
          onClick={() => run(undo)}
        >
          <Undo2Icon />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!canRedo}
          onClick={() => run(redo)}
        >
          <Redo2Icon />
        </ToolbarButton>
        <FormattingToolbar disabled={status !== "ready"} />
      </div>
      <PresentationZoomSelect className="shrink-0" />
    </div>
  );
}

function run(action: () => Promise<unknown>) {
  action().catch((error: unknown) =>
    toast.error(error instanceof Error ? error.message : "Edit failed"),
  );
}

interface FormattingToolbarProps {
  disabled: boolean;
}

function FormattingToolbar({ disabled }: FormattingToolbarProps) {
  const {
    mode,
    nodes,
    textStyle,
    drawTool,
    startDrawing,
    insertTable,
    setTextStyle,
    setParagraphStyle,
    reorder,
    remove,
    clear,
  } = useSelection();

  const hasShapes = nodes.length > 0 && mode !== "text";

  return (
    <>
      <Separator
        orientation="vertical"
        className="mx-1 data-vertical:h-4 data-vertical:self-center"
      />
      <ToolbarButton
        label="Text box"
        pressed={drawTool?.type === "textBox"}
        disabled={disabled}
        onClick={() =>
          startDrawing(
            drawTool?.type === "textBox" ? null : { type: "textBox" },
          )
        }
      >
        <TypeIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Rectangle"
        pressed={drawTool?.type === "shape"}
        disabled={disabled}
        onClick={() =>
          startDrawing(
            drawTool?.type === "shape"
              ? null
              : { type: "shape", geometry: "rect" },
          )
        }
      >
        <SquareIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Table"
        disabled={disabled}
        onClick={() => run(() => insertTable(2, 2))}
      >
        <TableIcon />
      </ToolbarButton>
      <Separator
        orientation="vertical"
        className="mx-1 data-vertical:h-4 data-vertical:self-center"
      />
      {TEXT_TOGGLES.map(({ key, label, icon: Icon }) => (
        <ToolbarButton
          key={key}
          label={label}
          pressed={textStyle?.[key] ?? false}
          disabled={!textStyle}
          onClick={() => run(() => setTextStyle({ [key]: !textStyle?.[key] }))}
        >
          <Icon />
        </ToolbarButton>
      ))}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Text color"
            variant="ghost"
            size="icon-sm"
            className="relative"
            disabled={!textStyle}
          >
            <BaselineIcon />
            <span
              aria-hidden="true"
              className="absolute inset-x-1.5 bottom-1 h-0.5 rounded-full"
              style={{ backgroundColor: textStyle?.color ?? "transparent" }}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          data-pptx-keep-selection=""
          aria-label="Text color"
          className="grid w-auto grid-cols-3 gap-1 p-1"
        >
          {TEXT_COLORS.map((color) => (
            <DropdownMenuItem
              key={color.value}
              aria-label={color.name}
              className="size-6 rounded-full border p-0"
              style={{ backgroundColor: color.value }}
              onSelect={() => run(() => setTextStyle({ color: color.value }))}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {ALIGNMENTS.map(({ align, label, icon: Icon }) => (
        <ToolbarButton
          key={align}
          label={label}
          pressed={textStyle?.align === align}
          disabled={!textStyle}
          onClick={() => run(() => setParagraphStyle({ align }))}
        >
          <Icon />
        </ToolbarButton>
      ))}
      <Separator
        orientation="vertical"
        className="mx-1 data-vertical:h-4 data-vertical:self-center"
      />
      <ToolbarButton
        label="Bring forward"
        disabled={!hasShapes}
        onClick={() => run(() => reorder("forward"))}
      >
        <BringToFrontIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Send backward"
        disabled={!hasShapes}
        onClick={() => run(() => reorder("backward"))}
      >
        <SendToBackIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Delete"
        disabled={!hasShapes}
        onClick={() =>
          run(async () => {
            await remove();
            clear();
          })
        }
      >
        <Trash2Icon />
      </ToolbarButton>
    </>
  );
}

interface ToolbarButtonProps {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block w-fit">
          <Button
            aria-label={label}
            aria-pressed={pressed}
            variant={pressed ? "secondary" : "ghost"}
            size="icon-sm"
            disabled={disabled}
            onClick={onClick}
          >
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
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
