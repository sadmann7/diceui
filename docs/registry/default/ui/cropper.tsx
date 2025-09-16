"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "Cropper";
const CONTAINER_NAME = "CropperContainer";
const IMAGE_NAME = "CropperImage";
const VIDEO_NAME = "CropperVideo";
const AREA_NAME = "CropperArea";

// Types
type Point = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type MediaSize = {
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
};

type CropShape = "rect" | "round";
type ObjectFit = "contain" | "cover" | "horizontal-cover" | "vertical-cover";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

// Helper functions
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDistanceBetweenPoints(pointA: Point, pointB: Point) {
  return Math.sqrt((pointA.y - pointB.y) ** 2 + (pointA.x - pointB.x) ** 2);
}

function getCenter(a: Point, b: Point): Point {
  return {
    x: (b.x + a.x) / 2,
    y: (b.y + a.y) / 2,
  };
}

function getRotationBetweenPoints(pointA: Point, pointB: Point) {
  return (Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) * 180) / Math.PI;
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number): Size {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

function getCropSize(
  mediaWidth: number,
  mediaHeight: number,
  containerWidth: number,
  containerHeight: number,
  aspect: number,
  rotation = 0,
): Size {
  const { width, height } = rotateSize(mediaWidth, mediaHeight, rotation);
  const fittingWidth = Math.min(width, containerWidth);
  const fittingHeight = Math.min(height, containerHeight);

  if (fittingWidth > fittingHeight * aspect) {
    return {
      width: fittingHeight * aspect,
      height: fittingHeight,
    };
  }

  return {
    width: fittingWidth,
    height: fittingWidth / aspect,
  };
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

  const restrictPositionCoord = (
    pos: number,
    mediaS: number,
    cropS: number,
    z: number,
  ): number => {
    const maxPosition = (mediaS * z) / 2 - cropS / 2;
    return clamp(pos, -maxPosition, maxPosition);
  };

  return {
    x: restrictPositionCoord(position.x, width, cropSize.width, zoom),
    y: restrictPositionCoord(position.y, height, cropSize.height, zoom),
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

  const croppedAreaPercentages = {
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

  const croppedAreaPixels = {
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

// Store types and implementation
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
  onCropChange?: (crop: Point) => void,
  onZoomChange?: (zoom: number) => void,
  onRotationChange?: (rotation: number) => void,
  _onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void,
  _onCropAreaChange?: (croppedArea: Area, croppedAreaPixels: Area) => void,
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

      // Call appropriate callbacks
      if (
        key === "crop" &&
        typeof value === "object" &&
        value &&
        "x" in value
      ) {
        onCropChange?.(value as Point);
      } else if (key === "zoom" && typeof value === "number") {
        onZoomChange?.(value);
      } else if (key === "rotation" && typeof value === "number") {
        onRotationChange?.(value);
      } else if (key === "isDragging") {
        if (value) {
          onInteractionStart?.();
        } else {
          onInteractionEnd?.();
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

// Context types
interface CropperContextValue {
  id: string;
  aspect: number;
  minZoom: number;
  maxZoom: number;
  cropShape: CropShape;
  objectFit: ObjectFit;
  showGrid: boolean;
  zoomSpeed: number;
  zoomWithScroll: boolean;
  restrictPosition: boolean;
  keyboardStep: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const CropperContext = React.createContext<CropperContextValue | null>(null);

function useCropperContext(consumerName: string) {
  const context = React.useContext(CropperContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

// Root component
interface CropperRootProps extends DivProps {
  crop?: Point;
  zoom?: number;
  rotation?: number;
  aspect?: number;
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
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

function CropperRoot(props: CropperRootProps) {
  const {
    crop = { x: 0, y: 0 },
    zoom = 1,
    rotation = 0,
    aspect = 4 / 3,
    minZoom = 1,
    maxZoom = 3,
    cropShape = "rect",
    objectFit = "contain",
    showGrid = true,
    zoomSpeed = 1,
    zoomWithScroll = true,
    restrictPosition = true,
    keyboardStep = 1,
    onCropChange,
    onZoomChange,
    onRotationChange,
    onCropComplete,
    onCropAreaChange,
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

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const store = React.useMemo(
    () =>
      createStore(
        listenersRef,
        stateRef,
        onCropChange,
        onZoomChange,
        onRotationChange,
        onCropComplete,
        onCropAreaChange,
        onInteractionStart,
        onInteractionEnd,
      ),
    [
      listenersRef,
      stateRef,
      onCropChange,
      onZoomChange,
      onRotationChange,
      onCropComplete,
      onCropAreaChange,
      onInteractionStart,
      onInteractionEnd,
    ],
  );

  React.useEffect(() => {
    store.setState("crop", crop);
  }, [crop, store]);

  React.useEffect(() => {
    store.setState("zoom", zoom);
  }, [zoom, store]);

  React.useEffect(() => {
    store.setState("rotation", rotation);
  }, [rotation, store]);

  const id = React.useId();
  const rootId = idProp ?? id;

  const contextValue = React.useMemo<CropperContextValue>(
    () => ({
      id: rootId,
      aspect,
      minZoom,
      maxZoom,
      cropShape,
      objectFit,
      showGrid,
      zoomSpeed,
      zoomWithScroll,
      restrictPosition,
      keyboardStep,
      containerRef,
    }),
    [
      rootId,
      aspect,
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
}

// Container component
interface CropperContainerProps extends DivProps {
  onTouchRequest?: (e: React.TouchEvent<HTMLDivElement>) => boolean;
  onWheelRequest?: (e: WheelEvent) => boolean;
}

function CropperContainer(props: CropperContainerProps) {
  const {
    className,
    children,
    asChild,
    ref,
    onTouchRequest,
    onWheelRequest,
    ...containerProps
  } = props;

  const context = useCropperContext(CONTAINER_NAME);
  const store = useStoreContext(CONTAINER_NAME);
  const crop = useStore((state) => state.crop);
  const zoom = useStore((state) => state.zoom);
  const rotation = useStore((state) => state.rotation);
  const mediaSize = useStore((state) => state.mediaSize);
  const cropSize = useStore((state) => state.cropSize);

  const composedRef = useComposedRefs(ref, context.containerRef);

  const dragStartPosition = React.useRef<Point>({ x: 0, y: 0 });
  const dragStartCrop = React.useRef<Point>({ x: 0, y: 0 });
  const containerPosition = React.useRef<Point>({ x: 0, y: 0 });
  const lastPinchDistance = React.useRef(0);
  const lastPinchRotation = React.useRef(0);
  const rafDragTimeout = React.useRef<number | null>(null);
  const rafPinchTimeout = React.useRef<number | null>(null);
  const wheelTimer = React.useRef<number | null>(null);

  const getMousePoint = React.useCallback(
    (e: MouseEvent | React.MouseEvent) => ({
      x: Number(e.clientX),
      y: Number(e.clientY),
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

  const saveContainerPosition = React.useCallback(() => {
    if (context.containerRef?.current) {
      const bounds = context.containerRef.current.getBoundingClientRect();
      containerPosition.current = { x: bounds.left, y: bounds.top };
    }
  }, [context.containerRef]);

  const getPointOnContainer = React.useCallback(
    ({ x, y }: Point, containerTopLeft: Point): Point => {
      if (!context.containerRef?.current) {
        throw new Error("The Cropper is not mounted");
      }
      const containerRect =
        context.containerRef.current.getBoundingClientRect();
      return {
        x: containerRect.width / 2 - (x - containerTopLeft.x),
        y: containerRect.height / 2 - (y - containerTopLeft.y),
      };
    },
    [context.containerRef],
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
        const zoomPoint = getPointOnContainer(point, containerPosition.current);
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
      getPointOnContainer,
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
        window.cancelAnimationFrame(rafDragTimeout.current);
      }

      rafDragTimeout.current = window.requestAnimationFrame(() => {
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

  const onDragStopped = React.useCallback(() => {
    store.setState("isDragging", false);
    if (rafDragTimeout.current) {
      window.cancelAnimationFrame(rafDragTimeout.current);
    }
  }, [store]);

  const onMouseMove = React.useCallback(
    (e: MouseEvent) => onDrag(getMousePoint(e)),
    [getMousePoint, onDrag],
  );

  const onMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onDragStopped);
      saveContainerPosition();
      onDragStart(getMousePoint(e));
    },
    [
      getMousePoint,
      onDragStart,
      onDragStopped,
      onMouseMove,
      saveContainerPosition,
    ],
  );

  const onTouchMove = React.useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        // Pinch move
        const touch0 = e.touches[0];
        const touch1 = e.touches[1];
        if (touch0 && touch1) {
          const pointA = getTouchPoint(touch0);
          const pointB = getTouchPoint(touch1);
          const center = getCenter(pointA, pointB);
          onDrag(center);

          if (rafPinchTimeout.current) {
            window.cancelAnimationFrame(rafPinchTimeout.current);
          }

          rafPinchTimeout.current = window.requestAnimationFrame(() => {
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
      } else if (e.touches.length === 1) {
        const touch0 = e.touches[0];
        if (touch0) {
          onDrag(getTouchPoint(touch0));
        }
      }
    },
    [getTouchPoint, onDrag, zoom, setNewZoom, rotation, store],
  );

  const onTouchStart = React.useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (onTouchRequest && !onTouchRequest(e)) {
        return;
      }

      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onDragStopped);
      saveContainerPosition();

      if (e.touches.length === 2) {
        // Pinch start
        const touch0 = e.touches[0];
        const touch1 = e.touches[1];
        if (touch0 && touch1) {
          const pointA = getTouchPoint(touch0);
          const pointB = getTouchPoint(touch1);
          lastPinchDistance.current = getDistanceBetweenPoints(pointA, pointB);
          lastPinchRotation.current = getRotationBetweenPoints(pointA, pointB);
          onDragStart(getCenter(pointA, pointB));
        }
      } else if (e.touches.length === 1) {
        const touch0 = e.touches[0];
        if (touch0) {
          onDragStart(getTouchPoint(touch0));
        }
      }
    },
    [
      onTouchRequest,
      onDragStopped,
      onTouchMove,
      saveContainerPosition,
      getTouchPoint,
      onDragStart,
    ],
  );

  const onWheel = React.useCallback(
    (e: WheelEvent) => {
      if (onWheelRequest && !onWheelRequest(e)) {
        return;
      }

      e.preventDefault();
      const point = getMousePoint(e);
      const newZoom = zoom - (e.deltaY * context.zoomSpeed) / 200;
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
    [onWheelRequest, getMousePoint, zoom, context.zoomSpeed, setNewZoom, store],
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

  // Event cleanup
  React.useEffect(() => {
    const cleanEvents = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onDragStopped);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onDragStopped);
    };

    return cleanEvents;
  }, [onMouseMove, onDragStopped, onTouchMove]);

  // Wheel event setup
  React.useEffect(() => {
    const container = context.containerRef?.current;
    if (!container || !context.zoomWithScroll) return;

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
      if (wheelTimer.current) {
        clearTimeout(wheelTimer.current);
      }
    };
  }, [context.containerRef, context.zoomWithScroll, onWheel]);

  const ContainerPrimitive = asChild ? Slot : "div";

  return (
    <ContainerPrimitive
      data-slot="cropper-container"
      tabIndex={0}
      {...containerProps}
      ref={composedRef}
      className={cn(
        "absolute inset-0 flex cursor-move touch-none select-none items-center justify-center overflow-hidden outline-none",
        className,
      )}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      {children}
    </ContainerPrimitive>
  );
}

// Image component
interface CropperImageProps extends React.ComponentProps<"img"> {
  asChild?: boolean;
}

function CropperImage(props: CropperImageProps) {
  const { className, asChild, ref, onLoad, ...imageProps } = props;

  const context = useCropperContext(IMAGE_NAME);
  const store = useStoreContext(IMAGE_NAME);
  const crop = useStore((state) => state.crop);
  const zoom = useStore((state) => state.zoom);
  const rotation = useStore((state) => state.rotation);

  const imageRef = React.useRef<HTMLImageElement>(null);
  const composedRef = useComposedRefs(ref, imageRef);

  const onMediaLoad = React.useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    const mediaSize: MediaSize = {
      width: img.offsetWidth,
      height: img.offsetHeight,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    };

    store.setState("mediaSize", mediaSize);

    // Calculate crop size based on container
    const container = context.containerRef?.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();

      // Only calculate crop size if container has dimensions
      if (containerRect.width > 0 && containerRect.height > 0) {
        const cropSize = getCropSize(
          mediaSize.width,
          mediaSize.height,
          containerRect.width,
          containerRect.height,
          context.aspect,
          rotation,
        );
        store.setState("cropSize", cropSize);
      } else {
        // Retry after a short delay to allow layout to complete
        setTimeout(() => {
          const retryRect = container.getBoundingClientRect();
          if (retryRect.width > 0 && retryRect.height > 0) {
            const cropSize = getCropSize(
              mediaSize.width,
              mediaSize.height,
              retryRect.width,
              retryRect.height,
              context.aspect,
              rotation,
            );
            store.setState("cropSize", cropSize);
          }
        }, 100);
      }
    }

    onLoad?.(
      new Event("load") as unknown as React.SyntheticEvent<HTMLImageElement>,
    );
  }, [store, context.aspect, context.containerRef, rotation, onLoad]);

  // Handle images that are already loaded
  React.useEffect(() => {
    const img = imageRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      onMediaLoad();
    }
  }, [onMediaLoad]);

  const objectFitClass = React.useMemo(() => {
    switch (context.objectFit) {
      case "contain":
        return "max-w-full max-h-full absolute inset-0 m-auto";
      case "horizontal-cover":
        return "w-full h-auto";
      case "vertical-cover":
        return "w-auto h-full";
      case "cover":
      default:
        return "w-full h-auto";
    }
  }, [context.objectFit]);

  const ImagePrimitive = asChild ? Slot : "img";

  return (
    <ImagePrimitive
      data-slot="cropper-image"
      {...imageProps}
      ref={composedRef}
      className={cn("will-change-transform", objectFitClass, className)}
      style={{
        transform: `translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom})`,
        ...imageProps.style,
      }}
      onLoad={onMediaLoad}
    />
  );
}

// Video component
interface CropperVideoProps extends React.ComponentProps<"video"> {
  asChild?: boolean;
}

function CropperVideo(props: CropperVideoProps) {
  const { className, asChild, ref, onLoadedMetadata, ...videoProps } = props;

  const context = useCropperContext(VIDEO_NAME);
  const store = useStoreContext(VIDEO_NAME);
  const crop = useStore((state) => state.crop);
  const zoom = useStore((state) => state.zoom);
  const rotation = useStore((state) => state.rotation);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const composedRef = useComposedRefs(ref, videoRef);

  const onMediaLoad = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const mediaSize: MediaSize = {
      width: video.offsetWidth,
      height: video.offsetHeight,
      naturalWidth: video.videoWidth,
      naturalHeight: video.videoHeight,
    };

    store.setState("mediaSize", mediaSize);

    // Calculate crop size based on container
    const container = context.containerRef?.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();

      // Only calculate crop size if container has dimensions
      if (containerRect.width > 0 && containerRect.height > 0) {
        const cropSize = getCropSize(
          mediaSize.width,
          mediaSize.height,
          containerRect.width,
          containerRect.height,
          context.aspect,
          rotation,
        );
        store.setState("cropSize", cropSize);
      } else {
        // Retry after a short delay to allow layout to complete
        setTimeout(() => {
          const retryRect = container.getBoundingClientRect();
          if (retryRect.width > 0 && retryRect.height > 0) {
            const cropSize = getCropSize(
              mediaSize.width,
              mediaSize.height,
              retryRect.width,
              retryRect.height,
              context.aspect,
              rotation,
            );
            store.setState("cropSize", cropSize);
          }
        }, 100);
      }
    }

    onLoadedMetadata?.(
      new Event(
        "loadedmetadata",
      ) as unknown as React.SyntheticEvent<HTMLVideoElement>,
    );
  }, [store, context.aspect, context.containerRef, rotation, onLoadedMetadata]);

  const objectFitClass = React.useMemo(() => {
    switch (context.objectFit) {
      case "contain":
        return "max-w-full max-h-full absolute inset-0 m-auto";
      case "horizontal-cover":
        return "w-full h-auto";
      case "vertical-cover":
        return "w-auto h-full";
      case "cover":
      default:
        return "w-full h-auto";
    }
  }, [context.objectFit]);

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
      className={cn("will-change-transform", objectFitClass, className)}
      style={{
        transform: `translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom})`,
        ...videoProps.style,
      }}
      onLoadedMetadata={onMediaLoad}
    />
  );
}

// Crop area component
interface CropperAreaProps extends DivProps {
  roundCropAreaPixels?: boolean;
}

function CropperArea(props: CropperAreaProps) {
  const {
    className,
    asChild,
    ref,
    roundCropAreaPixels = false,
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
        "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 box-border overflow-hidden border border-white/50",
        "shadow-[0_0_0_9999em_rgba(0,0,0,0.5)]",
        {
          "rounded-full": context.cropShape === "round",
          "before:absolute before:top-0 before:right-1/3 before:bottom-0 before:left-1/3 before:box-border before:border before:border-white/50 before:border-t-0 before:border-b-0 before:content-['']":
            context.showGrid,
          "after:absolute after:top-1/3 after:right-0 after:bottom-1/3 after:left-0 after:box-border after:border after:border-white/50 after:border-r-0 after:border-l-0 after:content-['']":
            context.showGrid,
        },
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
}

export {
  CropperRoot as Root,
  CropperContainer as Container,
  CropperImage as Image,
  CropperVideo as Video,
  CropperArea as Area,
  //
  CropperRoot as Cropper,
  CropperContainer,
  CropperImage,
  CropperVideo,
  CropperArea,
  //
  useStore as useCropper,
  computeCroppedArea,
  type Point,
  type Size,
  type Area as CropArea,
  type MediaSize,
  type CropShape,
  type ObjectFit,
};
