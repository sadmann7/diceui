"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "Cropper";
const CONTENT_NAME = "CropperContent";
const IMAGE_NAME = "CropperImage";
const VIDEO_NAME = "CropperVideo";
const AREA_NAME = "CropperArea";

interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface MediaSize {
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

type CropShape = "rect" | "round";
type ObjectFit = "contain" | "cover" | "horizontal-cover" | "vertical-cover";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

const MAX_CACHE_SIZE = 100;
const rotationSizeCache = new Map<string, Size>();
const cropSizeCache = new Map<string, Size>();

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getDistanceBetweenPoints(pointA: Point, pointB: Point): number {
  return Math.sqrt((pointA.y - pointB.y) ** 2 + (pointA.x - pointB.x) ** 2);
}

function getCenter(a: Point, b: Point): Point {
  return {
    x: (b.x + a.x) * 0.5,
    y: (b.y + a.y) * 0.5,
  };
}

function getRotationBetweenPoints(pointA: Point, pointB: Point): number {
  return (Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) * 180) / Math.PI;
}

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number): Size {
  const cacheKey = `${width}-${height}-${rotation}`;

  const cached = rotationSizeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const rotRad = getRadianAngle(rotation);
  const cosRot = Math.cos(rotRad);
  const sinRot = Math.sin(rotRad);

  const result: Size = {
    width: Math.abs(cosRot * width) + Math.abs(sinRot * height),
    height: Math.abs(sinRot * width) + Math.abs(cosRot * height),
  };

  if (rotationSizeCache.size >= MAX_CACHE_SIZE) {
    const firstKey = rotationSizeCache.keys().next().value;
    if (firstKey) {
      rotationSizeCache.delete(firstKey);
    }
  }

  rotationSizeCache.set(cacheKey, result);
  return result;
}

function getCropSize(
  mediaWidth: number,
  mediaHeight: number,
  contentWidth: number,
  contentHeight: number,
  aspect: number,
  rotation = 0,
): Size {
  const cacheKey = `${mediaWidth}-${mediaHeight}-${contentWidth}-${contentHeight}-${aspect}-${rotation}`;

  const cached = cropSizeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const { width, height } = rotateSize(mediaWidth, mediaHeight, rotation);
  const fittingWidth = Math.min(width, contentWidth);
  const fittingHeight = Math.min(height, contentHeight);

  const result: Size =
    fittingWidth > fittingHeight * aspect
      ? {
          width: fittingHeight * aspect,
          height: fittingHeight,
        }
      : {
          width: fittingWidth,
          height: fittingWidth / aspect,
        };

  if (cropSizeCache.size >= MAX_CACHE_SIZE) {
    const firstKey = cropSizeCache.keys().next().value;
    if (firstKey) {
      cropSizeCache.delete(firstKey);
    }
  }

  cropSizeCache.set(cacheKey, result);
  return result;
}

function restrictPosition(
  position: Point,
  mediaSize: Size,
  cropSize: Size,
  zoom: number,
  rotation = 0,
): Point {
  const { width, height } = rotateSize(
    mediaSize.width,
    mediaSize.height,
    rotation,
  );

  const maxPositionX = width * zoom * 0.5 - cropSize.width * 0.5;
  const maxPositionY = height * zoom * 0.5 - cropSize.height * 0.5;

  return {
    x: clamp(position.x, -maxPositionX, maxPositionX),
    y: clamp(position.y, -maxPositionY, maxPositionY),
  };
}

function computeCroppedArea(
  crop: Point,
  mediaSize: MediaSize,
  cropSize: Size,
  aspect: number,
  zoom: number,
  rotation = 0,
  restrictPosition = true,
): { croppedAreaPercentages: Area; croppedAreaPixels: Area } {
  const limitAreaFn = restrictPosition
    ? (max: number, value: number) => Math.min(max, Math.max(0, value))
    : (_max: number, value: number) => value;

  const mediaBBoxSize = rotateSize(mediaSize.width, mediaSize.height, rotation);
  const mediaNaturalBBoxSize = rotateSize(
    mediaSize.naturalWidth,
    mediaSize.naturalHeight,
    rotation,
  );

  const croppedAreaPercentages: Area = {
    x: limitAreaFn(
      100,
      (((mediaBBoxSize.width - cropSize.width / zoom) / 2 - crop.x / zoom) /
        mediaBBoxSize.width) *
        100,
    ),
    y: limitAreaFn(
      100,
      (((mediaBBoxSize.height - cropSize.height / zoom) / 2 - crop.y / zoom) /
        mediaBBoxSize.height) *
        100,
    ),
    width: limitAreaFn(
      100,
      ((cropSize.width / mediaBBoxSize.width) * 100) / zoom,
    ),
    height: limitAreaFn(
      100,
      ((cropSize.height / mediaBBoxSize.height) * 100) / zoom,
    ),
  };

  const widthInPixels = Math.round(
    limitAreaFn(
      mediaNaturalBBoxSize.width,
      (croppedAreaPercentages.width * mediaNaturalBBoxSize.width) / 100,
    ),
  );
  const heightInPixels = Math.round(
    limitAreaFn(
      mediaNaturalBBoxSize.height,
      (croppedAreaPercentages.height * mediaNaturalBBoxSize.height) / 100,
    ),
  );
  const isImgWiderThanHigh =
    mediaNaturalBBoxSize.width >= mediaNaturalBBoxSize.height * aspect;

  const sizePixels = isImgWiderThanHigh
    ? {
        width: Math.round(heightInPixels * aspect),
        height: heightInPixels,
      }
    : {
        width: widthInPixels,
        height: Math.round(widthInPixels / aspect),
      };

  const croppedAreaPixels: Area = {
    ...sizePixels,
    x: Math.round(
      limitAreaFn(
        mediaNaturalBBoxSize.width - sizePixels.width,
        (croppedAreaPercentages.x * mediaNaturalBBoxSize.width) / 100,
      ),
    ),
    y: Math.round(
      limitAreaFn(
        mediaNaturalBBoxSize.height - sizePixels.height,
        (croppedAreaPercentages.y * mediaNaturalBBoxSize.height) / 100,
      ),
    ),
  };

  return { croppedAreaPercentages, croppedAreaPixels };
}

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

interface StoreState {
  crop: Point;
  zoom: number;
  rotation: number;
  mediaSize: MediaSize | null;
  cropSize: Size | null;
  isDragging: boolean;
  hasWheelJustStarted: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

function createStore(
  listenersRef: React.RefObject<Set<() => void>>,
  stateRef: React.RefObject<StoreState>,
  aspectRatio: number,
  onCropChange?: (crop: Point) => void,
  onZoomChange?: (zoom: number) => void,
  onRotationChange?: (rotation: number) => void,
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void,
  onCropAreaChange?: (croppedArea: Area, croppedAreaPixels: Area) => void,
  onCropSizeChange?: (cropSize: Size) => void,
  onMediaLoaded?: (mediaSize: MediaSize) => void,
  onInteractionStart?: () => void,
  onInteractionEnd?: () => void,
): Store {
  const store: Store = {
    subscribe: (cb) => {
      if (listenersRef.current) {
        listenersRef.current.add(cb);
        return () => listenersRef.current?.delete(cb);
      }
      return () => {};
    },
    getState: () =>
      stateRef.current ?? {
        crop: { x: 0, y: 0 },
        zoom: 1,
        rotation: 0,
        mediaSize: null,
        cropSize: null,
        isDragging: false,
        hasWheelJustStarted: false,
      },
    setState: (key, value) => {
      const state = stateRef.current;
      if (!state || Object.is(state[key], value)) return;

      state[key] = value;

      if (
        key === "crop" &&
        typeof value === "object" &&
        value &&
        "x" in value
      ) {
        onCropChange?.(value);
      } else if (key === "zoom" && typeof value === "number") {
        onZoomChange?.(value);
      } else if (key === "rotation" && typeof value === "number") {
        onRotationChange?.(value);
      } else if (
        key === "cropSize" &&
        typeof value === "object" &&
        value &&
        "width" in value
      ) {
        onCropSizeChange?.(value);
      } else if (
        key === "mediaSize" &&
        typeof value === "object" &&
        value &&
        "naturalWidth" in value
      ) {
        onMediaLoaded?.(value);
      } else if (key === "isDragging") {
        if (value) {
          onInteractionStart?.();
        } else {
          onInteractionEnd?.();
          const currentState = stateRef.current;
          if (
            currentState?.mediaSize &&
            currentState.cropSize &&
            onCropComplete
          ) {
            const { croppedAreaPercentages, croppedAreaPixels } =
              computeCroppedArea(
                currentState.crop,
                currentState.mediaSize,
                currentState.cropSize,
                aspectRatio,
                currentState.zoom,
                currentState.rotation,
              );
            onCropComplete(croppedAreaPercentages, croppedAreaPixels);
          }
        }
      }

      if (
        (key === "crop" || key === "zoom" || key === "rotation") &&
        onCropAreaChange
      ) {
        const currentState = stateRef.current;
        if (currentState?.mediaSize && currentState.cropSize) {
          const { croppedAreaPercentages, croppedAreaPixels } =
            computeCroppedArea(
              currentState.crop,
              currentState.mediaSize,
              currentState.cropSize,
              aspectRatio,
              currentState.zoom,
              currentState.rotation,
            );
          onCropAreaChange(croppedAreaPercentages, croppedAreaPixels);
        }
      }

      store.notify();
    },
    notify: () => {
      if (listenersRef.current) {
        for (const cb of listenersRef.current) {
          cb();
        }
      }
    },
  };

  return store;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useStore");

  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface CropperContextValue {
  id: string;
  aspectRatio: number;
  minZoom: number;
  maxZoom: number;
  cropShape: CropShape;
  objectFit: ObjectFit;
  showGrid: boolean;
  zoomSpeed: number;
  zoomWithScroll: boolean;
  restrictPosition: boolean;
  keyboardStep: number;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const CropperContext = React.createContext<CropperContextValue | null>(null);

function useCropperContext(consumerName: string) {
  const context = React.useContext(CropperContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface CropperRootProps extends DivProps {
  crop?: Point;
  zoom?: number;
  rotation?: number;
  aspectRatio?: number;
  minZoom?: number;
  maxZoom?: number;
  cropShape?: CropShape;
  objectFit?: ObjectFit;
  showGrid?: boolean;
  zoomSpeed?: number;
  zoomWithScroll?: boolean;
  restrictPosition?: boolean;
  keyboardStep?: number;
  onCropChange?: (crop: Point) => void;
  onZoomChange?: (zoom: number) => void;
  onRotationChange?: (rotation: number) => void;
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onCropAreaChange?: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onCropSizeChange?: (cropSize: Size) => void;
  onMediaLoaded?: (mediaSize: MediaSize) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

const CropperRoot = React.memo(function CropperRoot(props: CropperRootProps) {
  const {
    crop = { x: 0, y: 0 },
    zoom = 1,
    rotation = 0,
    aspectRatio = 4 / 3,
    minZoom = 1,
    maxZoom = 3,
    cropShape = "rect",
    objectFit = "contain",
    showGrid = false,
    zoomSpeed = 1,
    zoomWithScroll = true,
    restrictPosition = true,
    keyboardStep = 1,
    onCropChange,
    onZoomChange,
    onRotationChange,
    onCropComplete,
    onCropAreaChange,
    onCropSizeChange,
    onMediaLoaded,
    onInteractionStart,
    onInteractionEnd,
    id: idProp,
    asChild,
    className,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    crop,
    zoom,
    rotation,
    mediaSize: null,
    cropSize: null,
    isDragging: false,
    hasWheelJustStarted: false,
  }));

  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const store = React.useMemo(
    () =>
      createStore(
        listenersRef,
        stateRef,
        aspectRatio,
        onCropChange,
        onZoomChange,
        onRotationChange,
        onCropComplete,
        onCropAreaChange,
        onCropSizeChange,
        onMediaLoaded,
        onInteractionStart,
        onInteractionEnd,
      ),
    [
      listenersRef,
      stateRef,
      aspectRatio,
      onCropChange,
      onZoomChange,
      onRotationChange,
      onCropComplete,
      onCropAreaChange,
      onCropSizeChange,
      onMediaLoaded,
      onInteractionStart,
      onInteractionEnd,
    ],
  );

  React.useEffect(() => {
    const updates: Partial<StoreState> = {};
    let hasUpdates = false;

    if (crop !== undefined) {
      const currentState = store.getState();
      if (!Object.is(currentState.crop, crop)) {
        updates.crop = crop;
        hasUpdates = true;
      }
    }

    if (zoom !== undefined) {
      const currentState = store.getState();
      if (currentState.zoom !== zoom) {
        updates.zoom = zoom;
        hasUpdates = true;
      }
    }

    if (rotation !== undefined) {
      const currentState = store.getState();
      if (currentState.rotation !== rotation) {
        updates.rotation = rotation;
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      Object.entries(updates).forEach(([key, value]) => {
        store.setState(key as keyof StoreState, value);
      });
    }
  }, [crop, zoom, rotation, store]);

  const id = React.useId();
  const rootId = idProp ?? id;

  const contextValue = React.useMemo<CropperContextValue>(
    () => ({
      id: rootId,
      aspectRatio,
      minZoom,
      maxZoom,
      cropShape,
      objectFit,
      showGrid,
      zoomSpeed,
      zoomWithScroll,
      restrictPosition,
      keyboardStep,
      contentRef,
    }),
    [
      rootId,
      aspectRatio,
      minZoom,
      maxZoom,
      cropShape,
      objectFit,
      showGrid,
      zoomSpeed,
      zoomWithScroll,
      restrictPosition,
      keyboardStep,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <CropperContext.Provider value={contextValue}>
        <RootPrimitive
          id={rootId}
          data-slot="cropper"
          {...rootProps}
          className={cn("relative h-full overflow-hidden", className)}
        />
      </CropperContext.Provider>
    </StoreContext.Provider>
  );
});

interface CropperContentProps extends DivProps {
  onTouchInteractionFilter?: (
    event: React.TouchEvent<HTMLDivElement>,
  ) => boolean;
  onWheelInteractionFilter?: (event: WheelEvent) => boolean;
}

const CropperContent = React.memo(function CropperContent(
  props: CropperContentProps,
) {
  const {
    className,
    asChild,
    ref,
    onTouchInteractionFilter,
    onWheelInteractionFilter,
    ...contentProps
  } = props;

  const context = useCropperContext(CONTENT_NAME);
  const store = useStoreContext(CONTENT_NAME);
  const crop = useStore((state) => state.crop);
  const zoom = useStore((state) => state.zoom);
  const rotation = useStore((state) => state.rotation);
  const mediaSize = useStore((state) => state.mediaSize);
  const cropSize = useStore((state) => state.cropSize);

  const composedRef = useComposedRefs(ref, context.contentRef);

  const dragStartPosition = React.useRef<Point>({ x: 0, y: 0 });
  const dragStartCrop = React.useRef<Point>({ x: 0, y: 0 });
  const contentPosition = React.useRef<Point>({ x: 0, y: 0 });
  const lastPinchDistance = React.useRef(0);
  const lastPinchRotation = React.useRef(0);
  const rafDragTimeout = React.useRef<number | null>(null);
  const rafPinchTimeout = React.useRef<number | null>(null);
  const wheelTimer = React.useRef<number | null>(null);

  const cleanupRefs = React.useCallback(() => {
    if (rafDragTimeout.current) {
      cancelAnimationFrame(rafDragTimeout.current);
      rafDragTimeout.current = null;
    }
    if (rafPinchTimeout.current) {
      cancelAnimationFrame(rafPinchTimeout.current);
      rafPinchTimeout.current = null;
    }
    if (wheelTimer.current) {
      clearTimeout(wheelTimer.current);
      wheelTimer.current = null;
    }
  }, []);

  const getMousePoint = React.useCallback(
    (event: MouseEvent | React.MouseEvent) => ({
      x: Number(event.clientX),
      y: Number(event.clientY),
    }),
    [],
  );

  const getTouchPoint = React.useCallback(
    (touch: Touch | React.Touch) => ({
      x: Number(touch.clientX),
      y: Number(touch.clientY),
    }),
    [],
  );

  const saveContentPosition = React.useCallback(() => {
    if (context.contentRef?.current) {
      const bounds = context.contentRef.current.getBoundingClientRect();
      contentPosition.current = { x: bounds.left, y: bounds.top };
    }
  }, [context.contentRef]);

  const getPointOnContent = React.useCallback(
    ({ x, y }: Point, contentTopLeft: Point): Point => {
      if (!context.contentRef?.current) {
        throw new Error("The Cropper is not mounted");
      }
      const contentRect = context.contentRef.current.getBoundingClientRect();
      return {
        x: contentRect.width / 2 - (x - contentTopLeft.x),
        y: contentRect.height / 2 - (y - contentTopLeft.y),
      };
    },
    [context.contentRef],
  );

  const getPointOnMedia = React.useCallback(
    ({ x, y }: Point) => {
      return {
        x: (x + crop.x) / zoom,
        y: (y + crop.y) / zoom,
      };
    },
    [crop, zoom],
  );

  const setNewZoom = React.useCallback(
    (newZoom: number, point: Point, shouldUpdatePosition = true) => {
      if (!cropSize || !mediaSize) return;

      const clampedZoom = clamp(newZoom, context.minZoom, context.maxZoom);

      if (shouldUpdatePosition) {
        const zoomPoint = getPointOnContent(point, contentPosition.current);
        const zoomTarget = getPointOnMedia(zoomPoint);
        const requestedPosition = {
          x: zoomTarget.x * clampedZoom - zoomPoint.x,
          y: zoomTarget.y * clampedZoom - zoomPoint.y,
        };

        const newPosition = context.restrictPosition
          ? restrictPosition(
              requestedPosition,
              mediaSize,
              cropSize,
              clampedZoom,
              rotation,
            )
          : requestedPosition;

        store.setState("crop", newPosition);
      }
      store.setState("zoom", clampedZoom);
    },
    [
      cropSize,
      mediaSize,
      context.minZoom,
      context.maxZoom,
      context.restrictPosition,
      getPointOnContent,
      getPointOnMedia,
      rotation,
      store,
    ],
  );

  const onDragStart = React.useCallback(
    ({ x, y }: Point) => {
      dragStartPosition.current = { x, y };
      dragStartCrop.current = { ...crop };
      store.setState("isDragging", true);
    },
    [crop, store],
  );

  const onDrag = React.useCallback(
    ({ x, y }: Point) => {
      if (rafDragTimeout.current) {
        cancelAnimationFrame(rafDragTimeout.current);
      }

      rafDragTimeout.current = requestAnimationFrame(() => {
        if (!cropSize || !mediaSize) return;
        if (x === undefined || y === undefined) return;

        const offsetX = x - dragStartPosition.current.x;
        const offsetY = y - dragStartPosition.current.y;
        const requestedPosition = {
          x: dragStartCrop.current.x + offsetX,
          y: dragStartCrop.current.y + offsetY,
        };

        const newPosition = context.restrictPosition
          ? restrictPosition(
              requestedPosition,
              mediaSize,
              cropSize,
              zoom,
              rotation,
            )
          : requestedPosition;

        store.setState("crop", newPosition);
      });
    },
    [cropSize, mediaSize, context.restrictPosition, zoom, rotation, store],
  );

  const onMouseMove = React.useCallback(
    (event: MouseEvent) => onDrag(getMousePoint(event)),
    [getMousePoint, onDrag],
  );

  const onTouchMove = React.useCallback(
    (event: TouchEvent) => {
      event.preventDefault();
      if (event.touches.length === 2) {
        const touch0 = event.touches[0];
        const touch1 = event.touches[1];
        if (touch0 && touch1) {
          const pointA = getTouchPoint(touch0);
          const pointB = getTouchPoint(touch1);
          const center = getCenter(pointA, pointB);
          onDrag(center);

          if (rafPinchTimeout.current) {
            cancelAnimationFrame(rafPinchTimeout.current);
          }

          rafPinchTimeout.current = requestAnimationFrame(() => {
            const distance = getDistanceBetweenPoints(pointA, pointB);
            const newZoom = zoom * (distance / lastPinchDistance.current);
            setNewZoom(newZoom, center, false);
            lastPinchDistance.current = distance;

            const rotationAngle = getRotationBetweenPoints(pointA, pointB);
            const newRotation =
              rotation + (rotationAngle - lastPinchRotation.current);
            store.setState("rotation", newRotation);
            lastPinchRotation.current = rotationAngle;
          });
        }
      } else if (event.touches.length === 1) {
        const touch0 = event.touches[0];
        if (touch0) {
          onDrag(getTouchPoint(touch0));
        }
      }
    },
    [getTouchPoint, onDrag, zoom, setNewZoom, rotation, store],
  );

  const cleanEvents = React.useCallback(() => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("touchmove", onTouchMove);
  }, [onMouseMove, onTouchMove]);

  const onDragStopped = React.useCallback(() => {
    store.setState("isDragging", false);
    cleanupRefs();
    document.removeEventListener("mouseup", onDragStopped);
    document.removeEventListener("touchend", onDragStopped);
    cleanEvents();
  }, [store, cleanEvents, cleanupRefs]);

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onDragStopped);
      saveContentPosition();
      onDragStart(getMousePoint(event));
    },
    [
      getMousePoint,
      onDragStart,
      onDragStopped,
      onMouseMove,
      saveContentPosition,
    ],
  );

  const onTouchStart = React.useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (onTouchInteractionFilter && !onTouchInteractionFilter(event)) {
        return;
      }

      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onDragStopped);
      saveContentPosition();

      if (event.touches.length === 2) {
        const touch0 = event.touches[0];
        const touch1 = event.touches[1];
        if (touch0 && touch1) {
          const pointA = getTouchPoint(touch0);
          const pointB = getTouchPoint(touch1);
          lastPinchDistance.current = getDistanceBetweenPoints(pointA, pointB);
          lastPinchRotation.current = getRotationBetweenPoints(pointA, pointB);
          onDragStart(getCenter(pointA, pointB));
        }
      } else if (event.touches.length === 1) {
        const touch0 = event.touches[0];
        if (touch0) {
          onDragStart(getTouchPoint(touch0));
        }
      }
    },
    [
      onTouchInteractionFilter,
      onDragStopped,
      onTouchMove,
      saveContentPosition,
      getTouchPoint,
      onDragStart,
    ],
  );

  const onWheel = React.useCallback(
    (event: WheelEvent) => {
      if (onWheelInteractionFilter && !onWheelInteractionFilter(event)) {
        return;
      }

      event.preventDefault();
      const point = getMousePoint(event);
      const newZoom = zoom - (event.deltaY * context.zoomSpeed) / 200;
      setNewZoom(newZoom, point, true);

      store.setState("hasWheelJustStarted", true);
      store.setState("isDragging", true);

      if (wheelTimer.current) {
        clearTimeout(wheelTimer.current);
      }
      wheelTimer.current = window.setTimeout(() => {
        store.setState("hasWheelJustStarted", false);
        store.setState("isDragging", false);
      }, 250);
    },
    [
      onWheelInteractionFilter,
      getMousePoint,
      zoom,
      context.zoomSpeed,
      setNewZoom,
      store,
    ],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!cropSize || !mediaSize) return;

      let step = context.keyboardStep;
      if (event.shiftKey) {
        step *= 0.2;
      }

      let newCrop = { ...crop };

      switch (event.key) {
        case "ArrowUp":
          newCrop.y -= step;
          event.preventDefault();
          break;
        case "ArrowDown":
          newCrop.y += step;
          event.preventDefault();
          break;
        case "ArrowLeft":
          newCrop.x -= step;
          event.preventDefault();
          break;
        case "ArrowRight":
          newCrop.x += step;
          event.preventDefault();
          break;
        default:
          return;
      }

      if (context.restrictPosition) {
        newCrop = restrictPosition(
          newCrop,
          mediaSize,
          cropSize,
          zoom,
          rotation,
        );
      }

      if (!event.repeat) {
        store.setState("isDragging", true);
      }

      store.setState("crop", newCrop);
    },
    [
      cropSize,
      mediaSize,
      context.keyboardStep,
      context.restrictPosition,
      crop,
      zoom,
      rotation,
      store,
    ],
  );

  const onKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
          event.preventDefault();
          store.setState("isDragging", false);
          break;
        default:
          return;
      }
    },
    [store],
  );

  React.useEffect(() => {
    const content = context.contentRef?.current;
    if (!content || !context.zoomWithScroll) return;

    content.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      content.removeEventListener("wheel", onWheel);
      cleanupRefs();
    };
  }, [context.contentRef, context.zoomWithScroll, onWheel, cleanupRefs]);

  React.useEffect(() => {
    return cleanupRefs;
  }, [cleanupRefs]);

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <ContentPrimitive
      data-slot="cropper-content"
      tabIndex={0}
      {...contentProps}
      ref={composedRef}
      className={cn(
        "absolute inset-0 flex cursor-move touch-none select-none items-center justify-center overflow-hidden outline-none",
        className,
      )}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    />
  );
});

const cropperMediaVariants = cva("will-change-transform", {
  variants: {
    objectFit: {
      contain: "absolute inset-0 m-auto max-h-full max-w-full",
      cover: "h-auto w-full",
      "horizontal-cover": "h-auto w-full",
      "vertical-cover": "h-full w-auto",
    },
  },
  defaultVariants: {
    objectFit: "contain",
  },
});

function useMediaComputation<T extends HTMLImageElement | HTMLVideoElement>(
  mediaRef: React.RefObject<T | null>,
  context: CropperContextValue,
  store: Store,
  rotation: number,
  getNaturalDimensions: (media: T) => { width: number; height: number },
) {
  const computeSizes = React.useCallback(() => {
    const media = mediaRef.current;
    const content = context.contentRef?.current;
    if (!media || !content) return;

    const contentRect = content.getBoundingClientRect();
    const containerAspect = contentRect.width / contentRect.height;
    const { width: naturalWidth, height: naturalHeight } =
      getNaturalDimensions(media);
    const isMediaScaledDown =
      media.offsetWidth < naturalWidth || media.offsetHeight < naturalHeight;
    const mediaAspect = naturalWidth / naturalHeight;

    let renderedMediaSize: Size;

    if (isMediaScaledDown) {
      const objectFit = context.objectFit;
      switch (objectFit) {
        case "contain":
          renderedMediaSize =
            containerAspect > mediaAspect
              ? {
                  width: contentRect.height * mediaAspect,
                  height: contentRect.height,
                }
              : {
                  width: contentRect.width,
                  height: contentRect.width / mediaAspect,
                };
          break;
        case "horizontal-cover":
          renderedMediaSize = {
            width: contentRect.width,
            height: contentRect.width / mediaAspect,
          };
          break;
        case "vertical-cover":
          renderedMediaSize = {
            width: contentRect.height * mediaAspect,
            height: contentRect.height,
          };
          break;
        case "cover":
          renderedMediaSize =
            containerAspect < mediaAspect
              ? {
                  width: contentRect.width,
                  height: contentRect.width / mediaAspect,
                }
              : {
                  width: contentRect.height * mediaAspect,
                  height: contentRect.height,
                };
          break;
        default:
          renderedMediaSize =
            containerAspect > mediaAspect
              ? {
                  width: contentRect.height * mediaAspect,
                  height: contentRect.height,
                }
              : {
                  width: contentRect.width,
                  height: contentRect.width / mediaAspect,
                };
          break;
      }
    } else {
      renderedMediaSize = {
        width: media.offsetWidth,
        height: media.offsetHeight,
      };
    }

    const mediaSize: MediaSize = {
      ...renderedMediaSize,
      naturalWidth,
      naturalHeight,
    };

    store.setState("mediaSize", mediaSize);

    const cropSize = getCropSize(
      mediaSize.width,
      mediaSize.height,
      contentRect.width,
      contentRect.height,
      context.aspectRatio,
      rotation,
    );

    store.setState("cropSize", cropSize);

    return { mediaSize, cropSize };
  }, [
    mediaRef,
    context.aspectRatio,
    context.contentRef,
    context.objectFit,
    store,
    rotation,
    getNaturalDimensions,
  ]);

  return { computeSizes };
}

interface CropperImageProps
  extends React.ComponentProps<"img">,
    VariantProps<typeof cropperMediaVariants> {
  asChild?: boolean;
}

const CropperImage = React.memo(function CropperImage(
  props: CropperImageProps,
) {
  const { className, asChild, ref, onLoad, objectFit, ...imageProps } = props;

  const context = useCropperContext(IMAGE_NAME);
  const store = useStoreContext(IMAGE_NAME);
  const crop = useStore((state) => state.crop);
  const zoom = useStore((state) => state.zoom);
  const rotation = useStore((state) => state.rotation);

  const imageRef = React.useRef<HTMLImageElement>(null);
  const composedRef = useComposedRefs(ref, imageRef);

  const getNaturalDimensions = React.useCallback(
    (img: HTMLImageElement) => ({
      width: img.naturalWidth,
      height: img.naturalHeight,
    }),
    [],
  );

  const { computeSizes } = useMediaComputation(
    imageRef,
    context,
    store,
    rotation,
    getNaturalDimensions,
  );

  const onMediaLoad = React.useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    computeSizes();

    onLoad?.(
      new Event("load") as unknown as React.SyntheticEvent<HTMLImageElement>,
    );
  }, [computeSizes, onLoad]);

  React.useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      onMediaLoad();
    }
  }, [onMediaLoad]);

  React.useEffect(() => {
    const content = context.contentRef?.current;
    if (!content) {
      return;
    }

    if (typeof ResizeObserver !== "undefined") {
      let isFirstResize = true;
      const resizeObserver = new ResizeObserver(() => {
        if (isFirstResize) {
          isFirstResize = false;
          return;
        }

        const image = imageRef.current;
        if (image?.complete && image.naturalWidth > 0) {
          computeSizes();
        }
      });

      resizeObserver.observe(content);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      const onWindowResize = () => {
        const image = imageRef.current;
        if (image?.complete && image.naturalWidth > 0) {
          computeSizes();
        }
      };

      window.addEventListener("resize", onWindowResize);
      return () => {
        window.removeEventListener("resize", onWindowResize);
      };
    }
  }, [context.contentRef, computeSizes]);

  const ImagePrimitive = asChild ? Slot : "img";

  return (
    <ImagePrimitive
      data-slot="cropper-image"
      {...imageProps}
      ref={composedRef}
      className={cn(
        cropperMediaVariants({
          objectFit: objectFit ?? context.objectFit,
        }),
        className,
      )}
      style={{
        transform: `translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom})`,
        ...imageProps.style,
      }}
      onLoad={onMediaLoad}
    />
  );
});

interface CropperVideoProps
  extends React.ComponentProps<"video">,
    VariantProps<typeof cropperMediaVariants> {
  asChild?: boolean;
}

const CropperVideo = React.memo(function CropperVideo(
  props: CropperVideoProps,
) {
  const {
    className,
    asChild,
    ref,
    onLoadedMetadata,
    objectFit,
    ...videoProps
  } = props;

  const context = useCropperContext(VIDEO_NAME);
  const store = useStoreContext(VIDEO_NAME);
  const crop = useStore((state) => state.crop);
  const zoom = useStore((state) => state.zoom);
  const rotation = useStore((state) => state.rotation);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const composedRef = useComposedRefs(ref, videoRef);

  const getNaturalDimensions = React.useCallback(
    (video: HTMLVideoElement) => ({
      width: video.videoWidth,
      height: video.videoHeight,
    }),
    [],
  );

  const { computeSizes } = useMediaComputation(
    videoRef,
    context,
    store,
    rotation,
    getNaturalDimensions,
  );

  const onMediaLoad = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    computeSizes();

    onLoadedMetadata?.(
      new Event(
        "loadedmetadata",
      ) as unknown as React.SyntheticEvent<HTMLVideoElement>,
    );
  }, [computeSizes, onLoadedMetadata]);

  React.useEffect(() => {
    const content = context.contentRef?.current;
    if (!content) {
      return;
    }

    if (typeof ResizeObserver !== "undefined") {
      let isFirstResize = true;
      const resizeObserver = new ResizeObserver(() => {
        if (isFirstResize) {
          isFirstResize = false;
          return;
        }

        const video = videoRef.current;
        if (video && video.videoWidth > 0 && video.videoHeight > 0) {
          computeSizes();
        }
      });

      resizeObserver.observe(content);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      const onWindowResize = () => {
        const video = videoRef.current;
        if (video && video.videoWidth > 0 && video.videoHeight > 0) {
          computeSizes();
        }
      };

      window.addEventListener("resize", onWindowResize);
      return () => {
        window.removeEventListener("resize", onWindowResize);
      };
    }
  }, [context.contentRef, computeSizes]);

  const VideoPrimitive = asChild ? Slot : "video";

  return (
    <VideoPrimitive
      data-slot="cropper-video"
      autoPlay
      playsInline
      loop
      muted
      controls={false}
      {...videoProps}
      ref={composedRef}
      className={cn(
        cropperMediaVariants({
          objectFit: objectFit ?? context.objectFit,
        }),
        className,
      )}
      style={{
        transform: `translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom})`,
        ...videoProps.style,
      }}
      onLoadedMetadata={onMediaLoad}
    />
  );
});

const cropperAreaVariants = cva(
  "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 box-border overflow-hidden border border-white/50 shadow-[0_0_0_9999em_rgba(0,0,0,0.5)]",
  {
    variants: {
      shape: {
        rect: "",
        round: "rounded-full",
      },
      showGrid: {
        true: "before:absolute before:top-0 before:right-1/3 before:bottom-0 before:left-1/3 before:box-border before:border before:border-white/50 before:border-t-0 before:border-b-0 before:content-[''] after:absolute after:top-1/3 after:right-0 after:bottom-1/3 after:left-0 after:box-border after:border after:border-white/50 after:border-r-0 after:border-l-0 after:content-['']",
        false: "",
      },
    },
    defaultVariants: {
      shape: "rect",
      showGrid: false,
    },
  },
);

interface CropperAreaProps
  extends DivProps,
    VariantProps<typeof cropperAreaVariants> {
  roundCropAreaPixels?: boolean;
}

const CropperArea = React.memo(function CropperArea(props: CropperAreaProps) {
  const {
    className,
    asChild,
    ref,
    roundCropAreaPixels = false,
    shape,
    showGrid,
    ...areaProps
  } = props;

  const context = useCropperContext(AREA_NAME);
  const cropSize = useStore((state) => state.cropSize);

  if (!cropSize) return null;

  const AreaPrimitive = asChild ? Slot : "div";

  return (
    <AreaPrimitive
      data-slot="cropper-area"
      {...areaProps}
      ref={ref}
      className={cn(
        cropperAreaVariants({
          shape: shape ?? context.cropShape,
          showGrid: showGrid ?? context.showGrid,
        }),
        className,
      )}
      style={{
        width: roundCropAreaPixels
          ? Math.round(cropSize.width)
          : cropSize.width,
        height: roundCropAreaPixels
          ? Math.round(cropSize.height)
          : cropSize.height,
        ...areaProps.style,
      }}
    />
  );
});

export {
  CropperRoot as Root,
  CropperContent as Content,
  CropperImage as Image,
  CropperVideo as Video,
  CropperArea as Area,
  //
  CropperRoot as Cropper,
  CropperContent,
  CropperImage,
  CropperVideo,
  CropperArea,
  //
  useStore as useCropper,
  //
  computeCroppedArea,
  //
  type CropperRootProps as CropperProps,
  type Point,
  type Size,
  type Area as CropArea,
  type MediaSize,
  type CropShape,
  type ObjectFit,
};
