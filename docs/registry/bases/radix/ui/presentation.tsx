"use client";

import { Presentation as PresentationPrimitive } from "@diceui/pptx";
import { cn } from "cn";
import * as React from "react";

import { useIsMobile } from "@/registry/bases/radix/hooks/use-mobile";
import { Button } from "@/registry/bases/radix/ui/button";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

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
      className={cn("cn-presentation", className)}
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
      className={cn("cn-presentation-content", className)}
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
      className={cn("cn-presentation-viewport", className)}
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
      className={cn("cn-presentation-slide", className)}
      {...props}
    />
  );
}

function PresentationSelection({
  className,
  children,
  ...props
}: PresentationPrimitive.Selection.Props) {
  return (
    <PresentationPrimitive.Selection
      data-slot="presentation-selection"
      className={cn("cn-presentation-selection", className)}
      {...props}
    >
      {children ?? (
        <>
          <PresentationSelectionBox>
            <PresentationResizeHandle />
            <PresentationRotateHandle />
          </PresentationSelectionBox>
          <PresentationSnapGuide />
          <PresentationMarquee />
        </>
      )}
    </PresentationPrimitive.Selection>
  );
}

function PresentationSelectionBox({
  className,
  ...props
}: PresentationPrimitive.SelectionBox.Props) {
  return (
    <PresentationPrimitive.SelectionBox
      data-slot="presentation-selection-box"
      className={withClassName(cn("cn-presentation-selection-box"), className)}
      {...props}
    />
  );
}

function PresentationResizeHandle({
  className,
  ...props
}: PresentationPrimitive.ResizeHandle.Props) {
  return (
    <PresentationPrimitive.ResizeHandle
      data-slot="presentation-resize-handle"
      className={withClassName(cn("cn-presentation-resize-handle"), className)}
      {...props}
    />
  );
}

function PresentationRotateHandle({
  className,
  ...props
}: PresentationPrimitive.RotateHandle.Props) {
  return (
    <PresentationPrimitive.RotateHandle
      data-slot="presentation-rotate-handle"
      className={withClassName(cn("cn-presentation-rotate-handle"), className)}
      {...props}
    />
  );
}

function PresentationSnapGuide({
  className,
  ...props
}: PresentationPrimitive.SnapGuide.Props) {
  return (
    <PresentationPrimitive.SnapGuide
      data-slot="presentation-snap-guide"
      className={withClassName(cn("cn-presentation-snap-guide"), className)}
      {...props}
    />
  );
}

function PresentationMarquee({
  className,
  ...props
}: PresentationPrimitive.Marquee.Props) {
  return (
    <PresentationPrimitive.Marquee
      data-slot="presentation-marquee"
      className={withClassName(cn("cn-presentation-marquee"), className)}
      {...props}
    />
  );
}

function PresentationControls(props: PresentationPrimitive.Controls.Props) {
  return (
    <PresentationPrimitive.Controls
      data-slot="presentation-controls"
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
      className={cn("cn-presentation-loading", className)}
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
      className={cn("cn-presentation-error", className)}
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
      className={cn("cn-presentation-thumbnail-item-preview", className)}
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
      className={cn("cn-presentation-thumbnail-item-number", className)}
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
      className={cn("cn-presentation-thumbnail-item", className)}
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

    const pendingPointerIds = new Set<number>();

    function isInside(target: Node) {
      return (
        !!listRef.current?.contains(target) ||
        !!triggerRef.current?.contains(target)
      );
    }

    function onPointerDown(event: PointerEvent) {
      if (!isInside(event.target as Node))
        pendingPointerIds.add(event.pointerId);
    }

    function onPointerUp(event: PointerEvent) {
      if (
        pendingPointerIds.delete(event.pointerId) &&
        !isInside(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function onPointerCancel(event: PointerEvent) {
      pendingPointerIds.delete(event.pointerId);
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
          className="cn-presentation-thumbnail-list"
          onClick={() => setOpen((value) => !value)}
        >
          <IconPlaceholder
            lucide="PanelLeftIcon"
            tabler="IconLayoutSidebar"
            hugeicons="SidebarLeftIcon"
            phosphor="SidebarIcon"
            remixicon="RiSideBarLine"
          />
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
          "cn-presentation-thumbnail-list-2",
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

function withClassName<State>(
  base: string,
  className: string | ((state: State) => string | undefined) | undefined,
) {
  return (state: State) =>
    cn(base, typeof className === "function" ? className(state) : className);
}

export {
  Presentation,
  PresentationContent,
  PresentationControls,
  PresentationError,
  PresentationLoading,
  PresentationMarquee,
  PresentationProvider,
  PresentationResizeHandle,
  PresentationRotateHandle,
  PresentationSelection,
  PresentationSelectionBox,
  PresentationSlide,
  PresentationSnapGuide,
  PresentationThumbnailItem,
  PresentationThumbnailItemNumber,
  PresentationThumbnailItemPreview,
  PresentationThumbnailList,
  PresentationViewport,
};
