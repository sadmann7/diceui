"use client";

import { ReactStore, useStore } from "@base-ui/utils/store";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { useValueAsRef } from "@base-ui/utils/useValueAsRef";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";

const ROOT_NAME = "Cropper";
const ROOT_IMPL_NAME = "CropperImpl";
const IMAGE_NAME = "CropperImage";
const VIDEO_NAME = "CropperVideo";
const AREA_NAME = "CropperArea";

interface Point {
  x: number;
  y: number;
}

interface GestureEvent extends UIEvent {
  rotation: number;
  scale: number;
  clientX: number;
  clientY: number;
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

type Shape = "rectangle" | "circle";
type ObjectFit = "contain" | "cover" | "horizontal-cover" | "vertical-cover";

const MAX_CACHE_SIZE = 200;
const DPR = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

const rotationSizeCache = new Map<string, Size>();
const cropSizeCache = new Map<string, Size>();
const croppedAreaCache = new Map<
  string,
  { croppedAreaPercentages: Area; croppedAreaPixels: Area }
>();
const onPositionClampCache = new Map<string, Point>();

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function quantize(n: number, step = 2 / DPR): number {
  return Math.round(n / step) * step;
}

function quantizePosition(n: number, step = 4 / DPR): number {
  return Math.round(n / step) * step;
}

function quantizeZoom(n: number, step = 0.01): number {
  return Math.round(n / step) * step;
}

function quantizeRotation(n: number, step = 1.0): number {
  return Math.round(n / step) * step;
}

function snapToDevicePixel(n: number): number {
  return Math.round(n * DPR) / DPR;
}

function lruGet<K, V>(map: Map<K, V>, key: K): V | undefined {
  const v = map.get(key);
  if (v !== undefined) {
    map.delete(key);
    map.set(key, v);
  }
  return v;
}

function lruSet<K, V>(
  map: Map<K, V>,
  key: K,
  val: V,
  max = MAX_CACHE_SIZE,
): void {
  if (map.has(key)) {
    map.delete(key);
  }
  map.set(key, val);
  if (map.size > max) {
    const firstKey = map.keys().next().value;
    if (firstKey !== undefined) {
      map.delete(firstKey);
    }
  }
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
  const cacheKey = `${quantize(width)}-${quantize(height)}-${quantizeRotation(rotation)}`;

  const cached = lruGet(rotationSizeCache, cacheKey);
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

  lruSet(rotationSizeCache, cacheKey, result, MAX_CACHE_SIZE);
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
  const cacheKey = `${quantize(mediaWidth, 8)}-${quantize(mediaHeight, 8)}-${quantize(contentWidth, 8)}-${quantize(contentHeight, 8)}-${quantize(aspect, 0.01)}-${quantizeRotation(rotation)}`;

  const cached = lruGet(cropSizeCache, cacheKey);
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

  lruSet(cropSizeCache, cacheKey, result, MAX_CACHE_SIZE);
  return result;
}

function onPositionClamp(
  position: Point,
  mediaSize: Size,
  cropSize: Size,
  zoom: number,
  rotation = 0,
): Point {
  const quantizedX = quantizePosition(position.x);
  const quantizedY = quantizePosition(position.y);

  const cacheKey = `${quantizedX}-${quantizedY}-${quantize(mediaSize.width)}-${quantize(mediaSize.height)}-${quantize(cropSize.width)}-${quantize(cropSize.height)}-${quantizeZoom(zoom)}-${quantizeRotation(rotation)}`;

  const cached = lruGet(onPositionClampCache, cacheKey);
  if (cached) {
    return cached;
  }
  const { width, height } = rotateSize(
    mediaSize.width,
    mediaSize.height,
    rotation,
  );

  const maxPositionX = width * zoom * 0.5 - cropSize.width * 0.5;
  const maxPositionY = height * zoom * 0.5 - cropSize.height * 0.5;

  const result: Point = {
    x: clamp(position.x, -maxPositionX, maxPositionX),
    y: clamp(position.y, -maxPositionY, maxPositionY),
  };

  lruSet(onPositionClampCache, cacheKey, result, MAX_CACHE_SIZE);
  return result;
}

function getCroppedArea(
  crop: Point,
  mediaSize: MediaSize,
  cropSize: Size,
  aspect: number,
  zoom: number,
  rotation = 0,
  allowOverflow = false,
): { croppedAreaPercentages: Area; croppedAreaPixels: Area } {
  const cacheKey = `${quantizePosition(crop.x)}-${quantizePosition(crop.y)}-${quantize(mediaSize.width)}-${quantize(mediaSize.height)}-${quantize(mediaSize.naturalWidth)}-${quantize(mediaSize.naturalHeight)}-${quantize(cropSize.width)}-${quantize(cropSize.height)}-${quantize(aspect, 0.01)}-${quantizeZoom(zoom)}-${quantizeRotation(rotation)}-${allowOverflow}`;

  const cached = lruGet(croppedAreaCache, cacheKey);

  if (cached) return cached;

  const onAreaLimit = !allowOverflow
    ? (max: number, value: number) => Math.min(max, Math.max(0, value))
    : (_max: number, value: number) => value;

  const mediaBBoxSize = rotateSize(mediaSize.width, mediaSize.height, rotation);
  const mediaNaturalBBoxSize = rotateSize(
    mediaSize.naturalWidth,
    mediaSize.naturalHeight,
    rotation,
  );

  const croppedAreaPercentages: Area = {
    x: onAreaLimit(
      100,
      (((mediaBBoxSize.width - cropSize.width / zoom) / 2 - crop.x / zoom) /
        mediaBBoxSize.width) *
        100,
    ),
    y: onAreaLimit(
      100,
      (((mediaBBoxSize.height - cropSize.height / zoom) / 2 - crop.y / zoom) /
        mediaBBoxSize.height) *
        100,
    ),
    width: onAreaLimit(
      100,
      ((cropSize.width / mediaBBoxSize.width) * 100) / zoom,
    ),
    height: onAreaLimit(
      100,
      ((cropSize.height / mediaBBoxSize.height) * 100) / zoom,
    ),
  };

  const widthInPixels = Math.round(
    onAreaLimit(
      mediaNaturalBBoxSize.width,
      (croppedAreaPercentages.width * mediaNaturalBBoxSize.width) / 100,
    ),
  );
  const heightInPixels = Math.round(
    onAreaLimit(
      mediaNaturalBBoxSize.height,
      (croppedAreaPercentages.height * mediaNaturalBBoxSize.height) / 100,
    ),
  );
  const isImageWiderThanHigh =
    mediaNaturalBBoxSize.width >= mediaNaturalBBoxSize.height * aspect;

  const sizePixels: Size = isImageWiderThanHigh
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
      onAreaLimit(
        mediaNaturalBBoxSize.width - sizePixels.width,
        (croppedAreaPercentages.x * mediaNaturalBBoxSize.width) / 100,
      ),
    ),
    y: Math.round(
      onAreaLimit(
        mediaNaturalBBoxSize.height - sizePixels.height,
        (croppedAreaPercentages.y * mediaNaturalBBoxSize.height) / 100,
      ),
    ),
  };

  const result = { croppedAreaPercentages, croppedAreaPixels };

  lruSet(croppedAreaCache, cacheKey, result, MAX_CACHE_SIZE);
  return result;
}

interface StoreState {
  crop: Point;
  zoom: number;
  rotation: number;
  mediaSize: MediaSize | null;
  cropSize: Size | null;
  isDragging: boolean;
  isWheelZooming: boolean;
}

interface StoreController {
  isCropControlled: boolean;
  isZoomControlled: boolean;
  isRotationControlled: boolean;
  aspectRatio: number;
  onCropChange?: (crop: Point) => void;
  onCropSizeChange?: (cropSize: Size) => void;
  onCropAreaChange?: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onZoomChange?: (zoom: number) => void;
  onRotationChange?: (rotation: number) => void;
  onMediaLoaded?: (mediaSize: MediaSize) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

const selectors = {
  crop: (state: StoreState) => state.crop,
  zoom: (state: StoreState) => state.zoom,
  rotation: (state: StoreState) => state.rotation,
  mediaSize: (state: StoreState) => state.mediaSize,
  cropSize: (state: StoreState) => state.cropSize,
};

type Store = ReactStore<StoreState, StoreController, typeof selectors>;

type Transform = Pick<StoreState, "crop" | "zoom" | "rotation">;

const TRANSFORM_KEYS = ["crop", "zoom", "rotation"] as const;
const CROP_AREA_KEYS = [
  "crop",
  "zoom",
  "rotation",
  "mediaSize",
  "cropSize",
] as const;

function getStoreCroppedArea(store: Store) {
  const { crop, mediaSize, cropSize, zoom, rotation } = store.state;
  if (!mediaSize || !cropSize) return null;
  return getCroppedArea(
    crop,
    mediaSize,
    cropSize,
    store.context.aspectRatio,
    zoom,
    rotation,
  );
}

function setTransform(store: Store, changes: Partial<Transform>) {
  const { context } = store;
  const next: Partial<Transform> = {};

  if (changes.crop && !Object.is(store.state.crop, changes.crop)) {
    context.onCropChange?.(changes.crop);
    if (!context.isCropControlled) next.crop = changes.crop;
  }
  if (changes.zoom !== undefined && store.state.zoom !== changes.zoom) {
    context.onZoomChange?.(changes.zoom);
    if (!context.isZoomControlled) next.zoom = changes.zoom;
  }
  if (
    changes.rotation !== undefined &&
    store.state.rotation !== changes.rotation
  ) {
    context.onRotationChange?.(changes.rotation);
    if (!context.isRotationControlled) next.rotation = changes.rotation;
  }

  if (Object.keys(next).length > 0) {
    store.setState({ ...store.state, ...next });
  }
}

function clampStoreCrop(store: Store) {
  const { crop, mediaSize, cropSize, zoom, rotation } = store.state;
  if (!cropSize || !mediaSize) return;

  const newPosition = onPositionClamp(
    crop,
    mediaSize,
    cropSize,
    zoom,
    rotation,
  );

  if (
    Math.abs(newPosition.x - crop.x) > 0.001 ||
    Math.abs(newPosition.y - crop.y) > 0.001
  ) {
    setTransform(store, { crop: newPosition });
  }
}

function setIsDragging(store: Store, isDragging: boolean) {
  if (store.state.isDragging === isDragging) return;
  store.set("isDragging", isDragging);

  if (isDragging) {
    store.context.onInteractionStart?.();
    return;
  }

  store.context.onInteractionEnd?.();
  const croppedArea = getStoreCroppedArea(store);
  if (croppedArea) {
    store.context.onCropComplete?.(
      croppedArea.croppedAreaPercentages,
      croppedArea.croppedAreaPixels,
    );
  }
}

function setMediaSize(store: Store, mediaSize: MediaSize) {
  if (Object.is(store.state.mediaSize, mediaSize)) return;
  store.set("mediaSize", mediaSize);
  store.context.onMediaLoaded?.(mediaSize);
}

function setCropSize(store: Store, cropSize: Size) {
  if (Object.is(store.state.cropSize, cropSize)) return;
  store.set("cropSize", cropSize);
  store.context.onCropSizeChange?.(cropSize);
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useCropper<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useCropper");
  return useStore(store, selector);
}

type RootElement = HTMLDivElement;

interface CropperContextValue {
  aspectRatio: number;
  minZoom: number;
  maxZoom: number;
  zoomSpeed: number;
  keyboardStep: number;
  shape: Shape;
  objectFit: ObjectFit;
  rootRef: React.RefObject<RootElement | null>;
  allowOverflow: boolean;
  preventScrollZoom: boolean;
  withGrid: boolean;
}

const CropperContext = React.createContext<CropperContextValue | null>(null);

function useCropperContext(consumerName: string) {
  const context = React.useContext(CropperContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface CropperProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
  crop?: Point;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;
  rotation?: number;
  keyboardStep?: number;
  aspectRatio?: number;
  shape?: Shape;
  objectFit?: ObjectFit;
  allowOverflow?: boolean;
  preventScrollZoom?: boolean;
  withGrid?: boolean;
  onCropChange?: (crop: Point) => void;
  onCropSizeChange?: (cropSize: Size) => void;
  onCropAreaChange?: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onZoomChange?: (zoom: number) => void;
  onRotationChange?: (rotation: number) => void;
  onMediaLoaded?: (mediaSize: MediaSize) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  onWheelZoom?: (event: WheelEvent) => void;
}

function Cropper(props: CropperProps) {
  const {
    crop = { x: 0, y: 0 },
    zoom = 1,
    minZoom = 1,
    maxZoom = 3,
    zoomSpeed = 1,
    rotation = 0,
    keyboardStep = 1,
    aspectRatio = 4 / 3,
    shape = "rectangle",
    objectFit = "contain",
    allowOverflow = false,
    preventScrollZoom = false,
    withGrid = false,
    onCropChange,
    onCropSizeChange,
    onCropAreaChange,
    onCropComplete,
    onZoomChange,
    onRotationChange,
    onMediaLoaded,
    onInteractionStart,
    onInteractionEnd,
    className,
    ...rootProps
  } = props;

  const [store] = React.useState<Store>(
    () =>
      new ReactStore<StoreState, StoreController, typeof selectors>(
        {
          crop,
          zoom,
          rotation,
          mediaSize: null,
          cropSize: null,
          isDragging: false,
          isWheelZooming: false,
        },
        {
          isCropControlled: props.crop !== undefined,
          isZoomControlled: props.zoom !== undefined,
          isRotationControlled: props.rotation !== undefined,
          aspectRatio,
          onCropChange,
          onCropSizeChange,
          onCropAreaChange,
          onCropComplete,
          onZoomChange,
          onRotationChange,
          onMediaLoaded,
          onInteractionStart,
          onInteractionEnd,
        },
        selectors,
      ),
  );

  const rootRef = React.useRef<RootElement | null>(null);

  useIsoLayoutEffect(() => {
    Object.assign(store.context, {
      isCropControlled: props.crop !== undefined,
      isZoomControlled: props.zoom !== undefined,
      isRotationControlled: props.rotation !== undefined,
      aspectRatio,
      onCropChange,
      onCropSizeChange,
      onCropAreaChange,
      onCropComplete,
      onZoomChange,
      onRotationChange,
      onMediaLoaded,
      onInteractionStart,
      onInteractionEnd,
    } satisfies StoreController);
  });

  useIsoLayoutEffect(() => {
    let previousState = store.state;
    let frame: number | null = null;

    const unsubscribe = store.subscribe((state) => {
      const hasChanged = CROP_AREA_KEYS.some(
        (key) => !Object.is(previousState[key], state[key]),
      );
      previousState = state;
      if (!hasChanged || frame !== null || !store.context.onCropAreaChange) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = null;
        const croppedArea = getStoreCroppedArea(store);
        if (croppedArea) {
          store.context.onCropAreaChange?.(
            croppedArea.croppedAreaPercentages,
            croppedArea.croppedAreaPixels,
          );
        }
      });
    });

    return () => {
      unsubscribe();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [store]);

  useIsoLayoutEffect(() => {
    const changes: Partial<Transform> = {};
    if (props.crop !== undefined) changes.crop = props.crop;
    if (props.zoom !== undefined) changes.zoom = props.zoom;
    if (props.rotation !== undefined) changes.rotation = props.rotation;

    const hasChanged = TRANSFORM_KEYS.some(
      (key) => key in changes && !Object.is(store.state[key], changes[key]),
    );
    if (!hasChanged) return;

    const shouldRecompute =
      (changes.zoom !== undefined && changes.zoom !== store.state.zoom) ||
      (changes.rotation !== undefined &&
        changes.rotation !== store.state.rotation);

    store.setState({ ...store.state, ...changes });

    if (shouldRecompute && rootRef.current) {
      requestAnimationFrame(() => {
        if (allowOverflow) return;
        clampStoreCrop(store);
      });
    }
  }, [store, props.crop, props.zoom, props.rotation, allowOverflow]);

  const contextValue = React.useMemo<CropperContextValue>(
    () => ({
      minZoom,
      maxZoom,
      zoomSpeed,
      keyboardStep,
      aspectRatio,
      shape,
      objectFit,
      preventScrollZoom,
      allowOverflow,
      withGrid,
      rootRef,
    }),
    [
      minZoom,
      maxZoom,
      zoomSpeed,
      keyboardStep,
      aspectRatio,
      shape,
      objectFit,
      preventScrollZoom,
      allowOverflow,
      withGrid,
    ],
  );

  return (
    <StoreContext.Provider value={store}>
      <CropperContext.Provider value={contextValue}>
        <div
          data-slot="cropper-wrapper"
          className={cn("cn-cropper", className)}
        >
          <CropperImpl {...rootProps} />
        </div>
      </CropperContext.Provider>
    </StoreContext.Provider>
  );
}

interface CropperImplProps extends CropperProps {
  onWheelZoom?: (event: WheelEvent) => void;
}

function CropperImpl(props: CropperImplProps) {
  const {
    onWheelZoom: onWheelZoomProp,
    onKeyUp: onKeyUpProp,
    onKeyDown: onKeyDownProp,
    onMouseDown: onMouseDownProp,
    onTouchStart: onTouchStartProp,
    asChild,
    className,
    ref,
    ...rootImplProps
  } = props;

  const context = useCropperContext(ROOT_IMPL_NAME);
  const store = useStoreContext(ROOT_IMPL_NAME);
  const crop = useStore(store, selectors.crop);
  const zoom = useStore(store, selectors.zoom);
  const rotation = useStore(store, selectors.rotation);
  const mediaSize = useStore(store, selectors.mediaSize);
  const cropSize = useStore(store, selectors.cropSize);

  const propsRef = useValueAsRef({
    onWheelZoom: onWheelZoomProp,
    onKeyUp: onKeyUpProp,
    onKeyDown: onKeyDownProp,
    onMouseDown: onMouseDownProp,
    onTouchStart: onTouchStartProp,
  });

  const composedRef = useMergedRefs(ref, context.rootRef);
  const dragStartPositionRef = React.useRef<Point>({ x: 0, y: 0 });
  const dragStartCropRef = React.useRef<Point>({ x: 0, y: 0 });
  const contentPositionRef = React.useRef<Point>({ x: 0, y: 0 });
  const lastPinchDistanceRef = React.useRef(0);
  const lastPinchRotationRef = React.useRef(0);
  const rafDragTimeoutRef = React.useRef<number | null>(null);
  const rafPinchTimeoutRef = React.useRef<number | null>(null);
  const wheelTimerRef = React.useRef<number | null>(null);
  const isTouchingRef = React.useRef(false);
  const gestureZoomStartRef = React.useRef(0);
  const gestureRotationStartRef = React.useRef(0);

  const onRefsCleanup = React.useCallback(() => {
    if (rafDragTimeoutRef.current) {
      cancelAnimationFrame(rafDragTimeoutRef.current);
      rafDragTimeoutRef.current = null;
    }
    if (rafPinchTimeoutRef.current) {
      cancelAnimationFrame(rafPinchTimeoutRef.current);
      rafPinchTimeoutRef.current = null;
    }
    if (wheelTimerRef.current) {
      clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = null;
    }
    isTouchingRef.current = false;
  }, []);

  const onCacheCleanup = React.useCallback(() => {
    if (onPositionClampCache.size > MAX_CACHE_SIZE * 1.5) {
      onPositionClampCache.clear();
    }
    if (croppedAreaCache.size > MAX_CACHE_SIZE * 1.5) {
      croppedAreaCache.clear();
    }
  }, []);

  const getMousePoint = React.useCallback(
    (event: MouseEvent | React.MouseEvent) => ({
      x: event.clientX,
      y: event.clientY,
    }),
    [],
  );

  const getTouchPoint = React.useCallback(
    (touch: Touch | React.Touch) => ({
      x: touch.clientX,
      y: touch.clientY,
    }),
    [],
  );

  const onContentPositionChange = React.useCallback(() => {
    if (context.rootRef?.current) {
      const bounds = context.rootRef.current.getBoundingClientRect();
      contentPositionRef.current = { x: bounds.left, y: bounds.top };
    }
  }, [context.rootRef]);

  const getPointOnContent = React.useCallback(
    ({ x, y }: Point, contentTopLeft: Point): Point => {
      if (!context.rootRef?.current) {
        return { x: 0, y: 0 };
      }
      const contentRect = context.rootRef.current.getBoundingClientRect();
      return {
        x: contentRect.width / 2 - (x - contentTopLeft.x),
        y: contentRect.height / 2 - (y - contentTopLeft.y),
      };
    },
    [context.rootRef],
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

  const recomputeCropPosition = React.useCallback(() => {
    if (!cropSize || !mediaSize) return;

    const newPosition = !context.allowOverflow
      ? onPositionClamp(crop, mediaSize, cropSize, zoom, rotation)
      : crop;

    if (
      Math.abs(newPosition.x - crop.x) > 0.001 ||
      Math.abs(newPosition.y - crop.y) > 0.001
    ) {
      setTransform(store, { crop: newPosition });
    }
  }, [cropSize, mediaSize, context.allowOverflow, crop, zoom, rotation, store]);

  const onZoomChange = React.useCallback(
    (newZoom: number, point: Point, shouldUpdatePosition = true) => {
      if (!cropSize || !mediaSize) return;

      const clampedZoom = clamp(newZoom, context.minZoom, context.maxZoom);

      if (shouldUpdatePosition) {
        const zoomPoint = getPointOnContent(point, contentPositionRef.current);
        const zoomTarget = getPointOnMedia(zoomPoint);
        const requestedPosition = {
          x: zoomTarget.x * clampedZoom - zoomPoint.x,
          y: zoomTarget.y * clampedZoom - zoomPoint.y,
        };

        const newPosition = !context.allowOverflow
          ? onPositionClamp(
              requestedPosition,
              mediaSize,
              cropSize,
              clampedZoom,
              rotation,
            )
          : requestedPosition;

        setTransform(store, { crop: newPosition, zoom: clampedZoom });
      } else {
        setTransform(store, { zoom: clampedZoom });
      }

      requestAnimationFrame(() => {
        recomputeCropPosition();
      });
    },
    [
      cropSize,
      mediaSize,
      context.minZoom,
      context.maxZoom,
      context.allowOverflow,
      getPointOnContent,
      getPointOnMedia,
      rotation,
      store,
      recomputeCropPosition,
    ],
  );

  const onDragStart = React.useCallback(
    ({ x, y }: Point) => {
      dragStartPositionRef.current = { x, y };
      dragStartCropRef.current = { ...crop };
      setIsDragging(store, true);
    },
    [crop, store],
  );

  const onDrag = React.useCallback(
    ({ x, y }: Point) => {
      if (rafDragTimeoutRef.current) {
        cancelAnimationFrame(rafDragTimeoutRef.current);
      }

      rafDragTimeoutRef.current = requestAnimationFrame(() => {
        if (!cropSize || !mediaSize) return;
        if (x === undefined || y === undefined) return;

        const offsetX = x - dragStartPositionRef.current.x;
        const offsetY = y - dragStartPositionRef.current.y;

        if (Math.abs(offsetX) < 2 && Math.abs(offsetY) < 2) {
          return;
        }

        const requestedPosition = {
          x: dragStartCropRef.current.x + offsetX,
          y: dragStartCropRef.current.y + offsetY,
        };

        const newPosition = !context.allowOverflow
          ? onPositionClamp(
              requestedPosition,
              mediaSize,
              cropSize,
              zoom,
              rotation,
            )
          : requestedPosition;

        const currentCrop = store.state.crop;
        if (
          Math.abs(newPosition.x - currentCrop.x) > 1 ||
          Math.abs(newPosition.y - currentCrop.y) > 1
        ) {
          setTransform(store, { crop: newPosition });
        }
      });
    },
    [cropSize, mediaSize, context.allowOverflow, zoom, rotation, store],
  );

  const onMouseMove = React.useCallback(
    (event: MouseEvent) => onDrag(getMousePoint(event)),
    [getMousePoint, onDrag],
  );

  const onTouchMove = React.useCallback(
    (event: TouchEvent) => {
      event.preventDefault();
      if (event.touches.length === 2) {
        const [firstTouch, secondTouch] = event.touches ?? [];
        if (firstTouch && secondTouch) {
          const pointA = getTouchPoint(firstTouch);
          const pointB = getTouchPoint(secondTouch);
          const center = getCenter(pointA, pointB);
          onDrag(center);

          if (rafPinchTimeoutRef.current) {
            cancelAnimationFrame(rafPinchTimeoutRef.current);
          }

          rafPinchTimeoutRef.current = requestAnimationFrame(() => {
            const distance = getDistanceBetweenPoints(pointA, pointB);
            const distanceRatio = distance / lastPinchDistanceRef.current;

            if (Math.abs(distanceRatio - 1) > 0.01) {
              const newZoom = zoom * distanceRatio;
              onZoomChange(newZoom, center, false);
              lastPinchDistanceRef.current = distance;
            }

            const rotationAngle = getRotationBetweenPoints(pointA, pointB);
            const rotationDiff = rotationAngle - lastPinchRotationRef.current;

            if (Math.abs(rotationDiff) > 0.5) {
              const newRotation = rotation + rotationDiff;
              setTransform(store, { rotation: newRotation });
              lastPinchRotationRef.current = rotationAngle;
            }
          });
        }
      } else if (event.touches.length === 1) {
        const firstTouch = event.touches[0];
        if (firstTouch) {
          onDrag(getTouchPoint(firstTouch));
        }
      }
    },
    [getTouchPoint, onDrag, zoom, onZoomChange, rotation, store],
  );

  const onGestureChange = React.useCallback(
    (event: GestureEvent) => {
      event.preventDefault();
      if (isTouchingRef.current) {
        return;
      }

      const point = { x: event.clientX, y: event.clientY };
      const newZoom = gestureZoomStartRef.current - 1 + event.scale;
      onZoomChange(newZoom, point, true);

      const newRotation = gestureRotationStartRef.current + event.rotation;
      setTransform(store, { rotation: newRotation });
    },
    [onZoomChange, store],
  );

  const onGestureEnd = React.useCallback(
    function onGestureEndListener() {
      document.removeEventListener(
        "gesturechange",
        onGestureChange as EventListener,
      );
      document.removeEventListener("gestureend", onGestureEndListener);
    },
    [onGestureChange],
  );

  const onGestureStart = React.useCallback(
    (event: GestureEvent) => {
      event.preventDefault();
      document.addEventListener(
        "gesturechange",
        onGestureChange as EventListener,
      );
      document.addEventListener("gestureend", onGestureEnd);
      gestureZoomStartRef.current = zoom;
      gestureRotationStartRef.current = rotation;
    },
    [zoom, rotation, onGestureChange, onGestureEnd],
  );

  const onSafariZoomPrevent = React.useCallback(
    (event: Event) => event.preventDefault(),
    [],
  );

  const onEventsCleanup = React.useCallback(() => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener(
      "gesturechange",
      onGestureChange as EventListener,
    );
    document.removeEventListener("gestureend", onGestureEnd);
  }, [onMouseMove, onTouchMove, onGestureChange, onGestureEnd]);

  const onDragStopped = React.useCallback(
    function onDragStoppedListener() {
      isTouchingRef.current = false;
      setIsDragging(store, false);
      onRefsCleanup();
      document.removeEventListener("mouseup", onDragStoppedListener);
      document.removeEventListener("touchend", onDragStoppedListener);
      onEventsCleanup();
    },
    [store, onEventsCleanup, onRefsCleanup],
  );

  const getWheelDelta = React.useCallback((event: WheelEvent) => {
    let deltaX = event.deltaX;
    let deltaY = event.deltaY;
    let deltaZ = event.deltaZ;

    if (event.deltaMode === 1) {
      deltaX *= 16;
      deltaY *= 16;
      deltaZ *= 16;
    } else if (event.deltaMode === 2) {
      deltaX *= 400;
      deltaY *= 400;
      deltaZ *= 400;
    }

    return { deltaX, deltaY, deltaZ };
  }, []);

  const onWheelZoom = React.useCallback(
    (event: WheelEvent) => {
      propsRef.current.onWheelZoom?.(event);
      if (event.defaultPrevented) return;

      event.preventDefault();
      const point = getMousePoint(event);
      const { deltaY } = getWheelDelta(event);
      const newZoom = zoom - (deltaY * context.zoomSpeed) / 200;
      onZoomChange(newZoom, point, true);

      store.set("isWheelZooming", true);
      setIsDragging(store, true);

      if (wheelTimerRef.current) {
        clearTimeout(wheelTimerRef.current);
      }
      wheelTimerRef.current = window.setTimeout(() => {
        store.set("isWheelZooming", false);
        setIsDragging(store, false);
      }, 250);
    },
    [
      propsRef,
      getMousePoint,
      zoom,
      context.zoomSpeed,
      onZoomChange,
      getWheelDelta,
      store,
    ],
  );

  const onKeyUp = React.useCallback(
    (event: React.KeyboardEvent<RootElement>) => {
      propsRef.current.onKeyUp?.(event);
      if (event.defaultPrevented) return;

      const arrowKeys = new Set([
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ]);

      if (arrowKeys.has(event.key)) {
        event.preventDefault();
        setIsDragging(store, false);
      }
    },
    [propsRef, store],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<RootElement>) => {
      propsRef.current.onKeyDown?.(event);
      if (event.defaultPrevented || !cropSize || !mediaSize) return;

      let step = context.keyboardStep;
      if (event.shiftKey) {
        step *= 0.2;
      }

      const keyCallbacks: Record<string, () => Point> = {
        ArrowUp: () => ({ ...crop, y: crop.y - step }),
        ArrowDown: () => ({ ...crop, y: crop.y + step }),
        ArrowLeft: () => ({ ...crop, x: crop.x - step }),
        ArrowRight: () => ({ ...crop, x: crop.x + step }),
      } as const;

      const callback = keyCallbacks[event.key];
      if (!callback) return;

      event.preventDefault();

      let newCrop = callback();

      if (!context.allowOverflow) {
        newCrop = onPositionClamp(newCrop, mediaSize, cropSize, zoom, rotation);
      }

      if (!event.repeat) {
        setIsDragging(store, true);
      }

      setTransform(store, { crop: newCrop });
    },
    [
      propsRef,
      cropSize,
      mediaSize,
      context.keyboardStep,
      context.allowOverflow,
      crop,
      zoom,
      rotation,
      store,
    ],
  );

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<RootElement>) => {
      propsRef.current.onMouseDown?.(event);
      if (event.defaultPrevented) return;

      event.preventDefault();
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onDragStopped);
      onContentPositionChange();
      onDragStart(getMousePoint(event));
    },
    [
      propsRef,
      getMousePoint,
      onDragStart,
      onDragStopped,
      onMouseMove,
      onContentPositionChange,
    ],
  );

  const onTouchStart = React.useCallback(
    (event: React.TouchEvent<RootElement>) => {
      propsRef.current.onTouchStart?.(event);
      if (event.defaultPrevented) return;

      isTouchingRef.current = true;
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onDragStopped);
      onContentPositionChange();

      if (event.touches.length === 2) {
        const [firstTouch, secondTouch] = event.touches
          ? Array.from(event.touches)
          : [];
        if (firstTouch && secondTouch) {
          const pointA = getTouchPoint(firstTouch);
          const pointB = getTouchPoint(secondTouch);
          lastPinchDistanceRef.current = getDistanceBetweenPoints(
            pointA,
            pointB,
          );
          lastPinchRotationRef.current = getRotationBetweenPoints(
            pointA,
            pointB,
          );
          onDragStart(getCenter(pointA, pointB));
        }
      } else if (event.touches.length === 1) {
        const firstTouch = event.touches[0];
        if (firstTouch) {
          onDragStart(getTouchPoint(firstTouch));
        }
      }
    },
    [
      propsRef,
      onDragStopped,
      onTouchMove,
      onContentPositionChange,
      getTouchPoint,
      onDragStart,
    ],
  );

  React.useEffect(() => {
    const content = context.rootRef?.current;
    if (!content) return;

    if (!context.preventScrollZoom) {
      content.addEventListener("wheel", onWheelZoom, { passive: false });
    }

    content.addEventListener("gesturestart", onSafariZoomPrevent);
    content.addEventListener("gesturestart", onGestureStart as EventListener);

    return () => {
      if (!context.preventScrollZoom) {
        content.removeEventListener("wheel", onWheelZoom);
      }
      content.removeEventListener("gesturestart", onSafariZoomPrevent);
      content.removeEventListener(
        "gesturestart",
        onGestureStart as EventListener,
      );
      onRefsCleanup();
    };
  }, [
    context.rootRef,
    context.preventScrollZoom,
    onWheelZoom,
    onRefsCleanup,
    onSafariZoomPrevent,
    onGestureStart,
  ]);

  React.useEffect(() => {
    return () => {
      onRefsCleanup();
      onCacheCleanup();
    };
  }, [onRefsCleanup, onCacheCleanup]);

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <RootPrimitive
      data-slot="cropper"
      tabIndex={0}
      {...rootImplProps}
      ref={composedRef}
      className={cn("cn-cropper-impl", className)}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    />
  );
}

const cropperMediaVariants = cva("cn-cropper-media", {
  variants: {
    objectFit: {
      contain: "cn-cropper-media-object-fit-contain",
      cover: "cn-cropper-media-object-fit-cover",
      "horizontal-cover": "cn-cropper-media-object-fit-horizontal-cover",
      "vertical-cover": "cn-cropper-media-object-fit-vertical-cover",
    },
  },
  defaultVariants: {
    objectFit: "contain",
  },
});

interface UseMediaComputationProps<
  T extends HTMLImageElement | HTMLVideoElement,
> {
  mediaRef: React.RefObject<T | null>;
  context: CropperContextValue;
  store: Store;
  rotation: number;
  getNaturalDimensions: (media: T) => Size;
}

function useMediaComputation<T extends HTMLImageElement | HTMLVideoElement>({
  mediaRef,
  context,
  store,
  rotation,
  getNaturalDimensions,
}: UseMediaComputationProps<T>) {
  const computeSizes = React.useCallback(() => {
    const media = mediaRef.current;
    const content = context.rootRef.current;
    if (!media || !content) return;

    const contentRect = content.getBoundingClientRect();
    const containerAspect = contentRect.width / contentRect.height;
    const { width: naturalWidth, height: naturalHeight } =
      getNaturalDimensions(media);
    const isScaledDown =
      media.offsetWidth < naturalWidth || media.offsetHeight < naturalHeight;
    const mediaAspect = naturalWidth / naturalHeight;

    let renderedMediaSize: Size;

    if (isScaledDown) {
      const objectFitCallbacks = {
        contain: () =>
          containerAspect > mediaAspect
            ? {
                width: contentRect.height * mediaAspect,
                height: contentRect.height,
              }
            : {
                width: contentRect.width,
                height: contentRect.width / mediaAspect,
              },
        "horizontal-cover": () => ({
          width: contentRect.width,
          height: contentRect.width / mediaAspect,
        }),
        "vertical-cover": () => ({
          width: contentRect.height * mediaAspect,
          height: contentRect.height,
        }),
        cover: () =>
          containerAspect < mediaAspect
            ? {
                width: contentRect.width,
                height: contentRect.width / mediaAspect,
              }
            : {
                width: contentRect.height * mediaAspect,
                height: contentRect.height,
              },
      } as const;

      const callback = objectFitCallbacks[context.objectFit];
      renderedMediaSize = callback
        ? callback()
        : containerAspect > mediaAspect
          ? {
              width: contentRect.height * mediaAspect,
              height: contentRect.height,
            }
          : {
              width: contentRect.width,
              height: contentRect.width / mediaAspect,
            };
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

    setMediaSize(store, mediaSize);

    const cropSize = getCropSize(
      mediaSize.width,
      mediaSize.height,
      contentRect.width,
      contentRect.height,
      context.aspectRatio,
      rotation,
    );

    setCropSize(store, cropSize);

    requestAnimationFrame(() => {
      const currentState = store.state;
      if (currentState.cropSize && currentState.mediaSize) {
        const newPosition = onPositionClamp(
          currentState.crop,
          currentState.mediaSize,
          currentState.cropSize,
          currentState.zoom,
          currentState.rotation,
        );

        if (
          Math.abs(newPosition.x - currentState.crop.x) > 0.001 ||
          Math.abs(newPosition.y - currentState.crop.y) > 0.001
        ) {
          setTransform(store, { crop: newPosition });
        }
      }
    });

    return { mediaSize, cropSize };
  }, [
    mediaRef,
    context.aspectRatio,
    context.rootRef,
    context.objectFit,
    store,
    rotation,
    getNaturalDimensions,
  ]);

  return { computeSizes };
}

interface CropperImageProps
  extends
    React.ComponentProps<"img">,
    VariantProps<typeof cropperMediaVariants> {
  asChild?: boolean;
  snapPixels?: boolean;
}

function CropperImage(props: CropperImageProps) {
  const {
    className,
    style,
    asChild,
    ref,
    onLoad,
    objectFit,
    snapPixels = false,
    ...imageProps
  } = props;

  const context = useCropperContext(IMAGE_NAME);
  const store = useStoreContext(IMAGE_NAME);
  const crop = useStore(store, selectors.crop);
  const zoom = useStore(store, selectors.zoom);
  const rotation = useStore(store, selectors.rotation);

  const imageRef = React.useRef<HTMLImageElement>(null);
  const composedRef = useMergedRefs(ref, imageRef);

  const getNaturalDimensions = React.useCallback(
    (image: HTMLImageElement) => ({
      width: image.naturalWidth,
      height: image.naturalHeight,
    }),
    [],
  );

  const { computeSizes } = useMediaComputation({
    mediaRef: imageRef,
    context,
    store,
    rotation,
    getNaturalDimensions,
  });

  const onMediaLoad = React.useCallback(() => {
    const image = imageRef.current;
    if (!image) return;

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
    const content = context.rootRef?.current;
    if (!content) return;

    function onResize() {
      const image = imageRef.current;
      if (image?.complete && image.naturalWidth > 0) {
        computeSizes();
      }
    }

    if (typeof ResizeObserver !== "undefined") {
      let isFirstResize = true;
      const resizeObserver = new ResizeObserver(() => {
        if (isFirstResize) {
          isFirstResize = false;
          return;
        }

        if ("requestIdleCallback" in window) {
          requestIdleCallback(onResize);
        } else {
          setTimeout(onResize, 16);
        }
      });

      resizeObserver.observe(content);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }
  }, [context.rootRef, computeSizes]);

  const ImagePrimitive = asChild ? SlotPrimitive.Slot : "img";

  return (
    <ImagePrimitive
      data-slot="cropper-image"
      {...imageProps}
      ref={composedRef}
      className={cn(
        cropperMediaVariants({
          objectFit: objectFit ?? context.objectFit,
          className,
        }),
      )}
      style={{
        transform: snapPixels
          ? `translate(${snapToDevicePixel(crop.x)}px, ${snapToDevicePixel(crop.y)}px) rotate(${rotation}deg) scale(${zoom})`
          : `translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom})`,
        ...style,
      }}
      onLoad={onMediaLoad}
    />
  );
}

interface CropperVideoProps
  extends
    React.ComponentProps<"video">,
    VariantProps<typeof cropperMediaVariants> {
  asChild?: boolean;
  snapPixels?: boolean;
}

function CropperVideo(props: CropperVideoProps) {
  const {
    className,
    style,
    asChild,
    ref,
    onLoadedMetadata,
    objectFit,
    snapPixels = false,
    ...videoProps
  } = props;

  const context = useCropperContext(VIDEO_NAME);
  const store = useStoreContext(VIDEO_NAME);
  const crop = useStore(store, selectors.crop);
  const zoom = useStore(store, selectors.zoom);
  const rotation = useStore(store, selectors.rotation);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const composedRef = useMergedRefs(ref, videoRef);

  const getNaturalDimensions = React.useCallback(
    (video: HTMLVideoElement) => ({
      width: video.videoWidth,
      height: video.videoHeight,
    }),
    [],
  );

  const { computeSizes } = useMediaComputation({
    mediaRef: videoRef,
    context,
    store,
    rotation,
    getNaturalDimensions,
  });

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
    const content = context.rootRef?.current;
    if (!content) return;

    function onResize() {
      const video = videoRef.current;
      if (video && video.videoWidth > 0 && video.videoHeight > 0) {
        computeSizes();
      }
    }

    if (typeof ResizeObserver !== "undefined") {
      let isFirstResize = true;
      const resizeObserver = new ResizeObserver(() => {
        if (isFirstResize) {
          isFirstResize = false;
          return;
        }

        if ("requestIdleCallback" in window) {
          requestIdleCallback(onResize);
        } else {
          setTimeout(onResize, 16);
        }
      });

      resizeObserver.observe(content);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }
  }, [context.rootRef, computeSizes]);

  const VideoPrimitive = asChild ? SlotPrimitive.Slot : "video";

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
          className,
        }),
      )}
      style={{
        transform: snapPixels
          ? `translate(${snapToDevicePixel(crop.x)}px, ${snapToDevicePixel(crop.y)}px) rotate(${rotation}deg) scale(${zoom})`
          : `translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom})`,
        ...style,
      }}
      onLoadedMetadata={onMediaLoad}
    />
  );
}

const cropperAreaVariants = cva("cn-cropper-area", {
  variants: {
    shape: {
      rectangle: "",
      circle: "cn-cropper-area-shape-circle",
    },
    withGrid: {
      true: "cn-cropper-area-with-grid-true",
      false: "",
    },
  },
  defaultVariants: {
    shape: "rectangle",
    withGrid: false,
  },
});

interface CropperAreaProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof cropperAreaVariants> {
  asChild?: boolean;
  snapPixels?: boolean;
}

function CropperArea(props: CropperAreaProps) {
  const {
    className,
    style,
    asChild,
    ref,
    snapPixels = false,
    shape,
    withGrid,
    ...areaProps
  } = props;

  const context = useCropperContext(AREA_NAME);
  const store = useStoreContext(AREA_NAME);
  const cropSize = useStore(store, selectors.cropSize);

  if (!cropSize) return null;

  const AreaPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <AreaPrimitive
      data-slot="cropper-area"
      {...areaProps}
      ref={ref}
      className={cn(
        cropperAreaVariants({
          shape: shape ?? context.shape,
          withGrid: withGrid ?? context.withGrid,
          className,
        }),
      )}
      style={{
        width: snapPixels ? Math.round(cropSize.width) : cropSize.width,
        height: snapPixels ? Math.round(cropSize.height) : cropSize.height,
        ...style,
      }}
    />
  );
}

export {
  type Area as CropperAreaData,
  Cropper,
  CropperArea,
  CropperImage,
  type CropperProps,
  CropperVideo,
  type ObjectFit as CropperObjectFit,
  type Point as CropperPoint,
  type Shape as CropperShape,
  type Size as CropperSize,
  useCropper,
};
