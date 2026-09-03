"use client";

import { Presentation as PresentationPrimitive } from "@diceui/pptx";
import { PanelLeftIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/registry/bases/radix/hooks/use-mobile";
import { Button } from "@/registry/bases/radix/ui/button";

function PresentationProvider({
  ...props
}: PresentationPrimitive.Provider.Props) {
  return (
    <PresentationPrimitive.Provider
      data-slot="presentation-provider"
      {...props}
    />
  );
}

function Presentation({
  className,
  ...props
}: PresentationPrimitive.Root.Props) {
  return (
    <PresentationPrimitive.Root
      data-slot="presentation"
      className={cn("relative flex overflow-hidden", className)}
      {...props}
    />
  );
}

function PresentationContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="presentation-content"
      className={cn(
        "relative isolate flex flex-1 flex-col overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function PresentationViewport({
  className,
  autoFit = true,
  autoFitPadding = 10,
  ...props
}: PresentationPrimitive.Viewport.Props) {
  return (
    <PresentationPrimitive.Viewport
      autoFit={autoFit}
      autoFitPadding={autoFitPadding}
      data-slot="presentation-viewport"
      className={cn(
        "flex flex-1 items-center justify-center overflow-hidden bg-background",
        className,
      )}
      {...props}
    />
  );
}

function PresentationSlide({
  className,
  ...props
}: PresentationPrimitive.Slide.Props) {
  return (
    <PresentationPrimitive.Slide
      data-slot="presentation-slide"
      className={cn("border", className)}
      {...props}
    />
  );
}

function PresentationSelection({
  className,
  ...props
}: PresentationPrimitive.Selection.Props) {
  return (
    <PresentationPrimitive.Selection
      data-slot="presentation-selection"
      className={cn("[--presentation-selection:var(--ring)]", className)}
      {...props}
    />
  );
}

function PresentationLoading({
  className,
  children,
  ...props
}: PresentationPrimitive.Loading.Props) {
  return (
    <PresentationPrimitive.Loading
      data-slot="presentation-loading"
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children ?? ((progress) => <span>Loading… {progress}%</span>)}
    </PresentationPrimitive.Loading>
  );
}

function PresentationError({
  className,
  children,
  ...props
}: PresentationPrimitive.Error.Props) {
  return (
    <PresentationPrimitive.Error
      data-slot="presentation-error"
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center text-sm text-destructive",
        className,
      )}
      {...props}
    >
      {children ?? ((error: Error) => <span>{error.message}</span>)}
    </PresentationPrimitive.Error>
  );
}

function PresentationThumbnailItemPreview({
  className,
  ...props
}: PresentationPrimitive.ThumbnailItemPreview.Props) {
  return (
    <PresentationPrimitive.ThumbnailItemPreview
      data-slot="presentation-thumbnail-item-preview"
      className={cn(
        "w-full overflow-hidden rounded-sm data-pending:animate-pulse data-pending:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function PresentationThumbnailItemNumber({
  className,
  ...props
}: PresentationPrimitive.ThumbnailItemNumber.Props) {
  return (
    <PresentationPrimitive.ThumbnailItemNumber
      data-slot="presentation-thumbnail-item-number"
      className={cn(
        "block text-center font-mono text-xs leading-none text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

function PresentationThumbnailItem({
  className,
  children,
  ...props
}: PresentationPrimitive.ThumbnailItem.Props) {
  return (
    <PresentationPrimitive.ThumbnailItem
      data-slot="presentation-thumbnail-item"
      className={cn(
        "relative flex w-full cursor-pointer gap-1.5 rounded-md border p-1.5 outline-none hover:bg-accent",
        "ring-2 ring-transparent transition-[color,ring] duration-100 focus:ring-ring data-active:bg-accent",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <PresentationThumbnailItemNumber />
          <PresentationThumbnailItemPreview />
        </>
      )}
    </PresentationPrimitive.ThumbnailItem>
  );
}

function PresentationThumbnailList({
  className,
  children,
  ...props
}: PresentationPrimitive.ThumbnailList.Props) {
  const isMobile = useIsMobile();
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const [wasMobile, setWasMobile] = React.useState(isMobile);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const isHidden = isMobile && !open;

  if (wasMobile !== isMobile) {
    setWasMobile(isMobile);
    setOpen(false);
  }

  React.useEffect(() => {
    if (!isMobile || !open) return;

    let pendingPointerId: number | null = null;

    function isInside(target: Node) {
      return (
        !!listRef.current?.contains(target) ||
        !!triggerRef.current?.contains(target)
      );
    }

    function onPointerDown(event: PointerEvent) {
      pendingPointerId = isInside(event.target as Node)
        ? null
        : event.pointerId;
    }

    function onPointerUp(event: PointerEvent) {
      const isPendingPointer = pendingPointerId === event.pointerId;
      pendingPointerId = null;
      if (isPendingPointer && !isInside(event.target as Node)) setOpen(false);
    }

    function onPointerCancel() {
      pendingPointerId = null;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerCancel);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobile, open]);

  return (
    <>
      {isMobile && (
        <Button
          type="button"
          aria-controls={id}
          aria-expanded={open}
          aria-label="Toggle thumbnails"
          variant="outline"
          size="icon-sm"
          ref={triggerRef}
          className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen((value) => !value)}
        >
          <PanelLeftIcon />
        </Button>
      )}
      <PresentationPrimitive.ThumbnailList
        id={id}
        aria-hidden={isHidden || undefined}
        data-slot="presentation-thumbnail-list"
        data-mobile={isMobile || undefined}
        inert={isHidden}
        ref={listRef}
        render={<aside />}
        className={cn(
          "flex w-40 shrink-0 flex-col gap-2 overflow-y-auto border-r bg-background p-1.5",
          isMobile && "absolute inset-y-0 left-0 z-20 transition-transform",
          isHidden && "-translate-x-full",
          className,
        )}
        {...props}
      >
        {children ??
          (({ slides }) =>
            slides.map((slide) => (
              <PresentationThumbnailItem key={slide.id} slideId={slide.id} />
            )))}
      </PresentationPrimitive.ThumbnailList>
    </>
  );
}

export {
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
};
