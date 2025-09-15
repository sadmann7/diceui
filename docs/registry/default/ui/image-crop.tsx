"use client";

import { Slot } from "@radix-ui/react-slot";
import { Crop, RefreshCw, RotateCcw, RotateCw } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type {
  Area,
  ControlsProps,
  CropAreaProps,
  CropButtonProps,
  CropValue,
  ImageProps,
  Point,
  ResetButtonProps,
  RootProps,
  RotateButtonProps,
  ZoomSliderProps,
} from "@/types/docs/image-crop";

interface ImageCropContextValue {
  src?: string;
  alt?: string;
  aspect: number;
  value?: CropValue;
  onValueChange?: (value: CropValue) => void;
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  rotation: number;
  onRotationChange?: (rotation: number) => void;
  disabled: boolean;
  readOnly: boolean;
  cropShape: "rect" | "round";
  showGrid: boolean;
  quality: number;
  outputFormat: "image/jpeg" | "image/png" | "image/webp";
  minZoom: number;
  maxZoom: number;
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onMediaLoaded?: (mediaSize: { width: number; height: number }) => void;
  mediaSize: { width: number; height: number } | null;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const ImageCropContext = React.createContext<ImageCropContextValue | null>(
  null,
);

function useImageCrop() {
  const context = React.useContext(ImageCropContext);
  if (!context) {
    throw new Error("useImageCrop must be used within ImageCrop.Root");
  }
  return context;
}

function Root(props: RootProps) {
  const {
    src,
    alt = "Crop image",
    aspect = 1,
    value,
    defaultValue,
    onValueChange,
    zoom,
    defaultZoom = 1,
    onZoomChange,
    rotation,
    defaultRotation = 0,
    onRotationChange,
    disabled = false,
    readOnly = false,
    cropShape = "rect",
    showGrid = true,
    quality = 0.92,
    outputFormat = "image/jpeg",
    minZoom = 1,
    maxZoom = 3,
    onCropComplete,
    onMediaLoaded,
    asChild,
    className,
    children,
    ...rootProps
  } = props;
  const [internalValue, setInternalValue] = React.useState<CropValue>(
    defaultValue || { x: 0, y: 0, width: 100, height: 100 },
  );
  const [internalZoom, setInternalZoom] = React.useState(defaultZoom);
  const [internalRotation, setInternalRotation] =
    React.useState(defaultRotation);
  const [mediaSize, setMediaSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const cropValue = value !== undefined ? value : internalValue;
  const zoomValue = zoom !== undefined ? zoom : internalZoom;
  const rotationValue = rotation !== undefined ? rotation : internalRotation;

  const handleValueChange = React.useCallback(
    (newValue: CropValue) => {
      if (readOnly) return;

      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [onValueChange, readOnly, value],
  );

  const handleZoomChange = React.useCallback(
    (newZoom: number) => {
      if (disabled || readOnly) return;

      if (zoom === undefined) {
        setInternalZoom(newZoom);
      }
      onZoomChange?.(newZoom);
    },
    [disabled, onZoomChange, readOnly, zoom],
  );

  const handleRotationChange = React.useCallback(
    (newRotation: number) => {
      if (disabled || readOnly) return;

      if (rotation === undefined) {
        setInternalRotation(newRotation);
      }
      onRotationChange?.(newRotation);
    },
    [disabled, onRotationChange, readOnly, rotation],
  );

  const handleMediaLoaded = React.useCallback(
    (size: { width: number; height: number }) => {
      setMediaSize(size);
      onMediaLoaded?.(size);
    },
    [onMediaLoaded],
  );

  const contextValue: ImageCropContextValue = {
    src,
    alt,
    aspect,
    value: cropValue,
    onValueChange: handleValueChange,
    zoom: zoomValue,
    onZoomChange: handleZoomChange,
    rotation: rotationValue,
    onRotationChange: handleRotationChange,
    disabled,
    readOnly,
    cropShape,
    showGrid,
    quality,
    outputFormat,
    minZoom,
    maxZoom,
    onCropComplete,
    onMediaLoaded: handleMediaLoaded,
    mediaSize,
    isDragging,
    setIsDragging,
  };

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <ImageCropContext.Provider value={contextValue}>
      <RootPrimitive
        className={cn(
          "relative flex flex-col gap-4 rounded-lg border bg-background p-4",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        {...rootProps}
      >
        {children}
      </RootPrimitive>
    </ImageCropContext.Provider>
  );
}

function CropArea(props: CropAreaProps) {
  const { className, children, asChild, ...cropAreaProps } = props;
  const {
    src,
    alt,
    value,
    onValueChange,
    zoom,
    rotation,
    disabled,
    readOnly,
    cropShape,
    showGrid,
    onCropComplete,
    onMediaLoaded,
    mediaSize,
    isDragging,
    setIsDragging,
  } = useImageCrop();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [dragStart, setDragStart] = React.useState<Point | null>(null);
  const [initialCrop, setInitialCrop] = React.useState<CropValue | null>(null);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || readOnly || !value) return;

      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialCrop(value);
    },
    [disabled, readOnly, value, setIsDragging],
  );

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragStart || !initialCrop || !containerRef.current)
        return;

      const container = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.x) / container.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / container.height) * 100;

      const newValue: CropValue = {
        ...initialCrop,
        x: Math.max(
          0,
          Math.min(100 - initialCrop.width, initialCrop.x + deltaX),
        ),
        y: Math.max(
          0,
          Math.min(100 - initialCrop.height, initialCrop.y + deltaY),
        ),
      };

      onValueChange?.(newValue);
    },
    [isDragging, dragStart, initialCrop, onValueChange],
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setInitialCrop(null);

    if (value && mediaSize && onCropComplete) {
      const croppedArea: Area = {
        x: value.x,
        y: value.y,
        width: value.width,
        height: value.height,
      };

      const croppedAreaPixels: Area = {
        x: (value.x / 100) * mediaSize.width,
        y: (value.y / 100) * mediaSize.height,
        width: (value.width / 100) * mediaSize.width,
        height: (value.height / 100) * mediaSize.height,
      };

      onCropComplete(croppedArea, croppedAreaPixels);
    }
  }, [value, mediaSize, onCropComplete, setIsDragging]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleImageLoad = React.useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.target as HTMLImageElement;
      onMediaLoaded?.({ width: img.naturalWidth, height: img.naturalHeight });
    },
    [onMediaLoaded],
  );

  if (!src) {
    const EmptyPrimitive = asChild ? Slot : "div";
    return (
      <EmptyPrimitive
        className={cn(
          "relative flex aspect-square w-full max-w-md items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/50 text-muted-foreground",
          className,
        )}
        {...cropAreaProps}
      >
        <div className="text-center">
          <Crop className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm">No image selected</p>
        </div>
      </EmptyPrimitive>
    );
  }

  const CropAreaPrimitive = asChild ? Slot : "div";

  return (
    <CropAreaPrimitive
      ref={containerRef}
      className={cn(
        "relative aspect-square w-full max-w-md overflow-hidden rounded-lg bg-black",
        className,
      )}
      {...cropAreaProps}
    >
      {/** biome-ignore lint/performance/noImgElement: dynamic image URLs from crop area don't work well with Next.js Image optimization */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={cn(
          "absolute inset-0 h-full w-full object-contain transition-transform duration-200",
          isDragging && "cursor-grabbing",
        )}
        style={{
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
        }}
        onLoad={handleImageLoad}
        draggable={false}
      />

      {value && (
        <button
          type="button"
          className={cn(
            "absolute cursor-grab border-2 border-white shadow-lg",
            isDragging && "cursor-grabbing",
            cropShape === "round" && "rounded-full",
          )}
          style={{
            left: `${value.x}%`,
            top: `${value.y}%`,
            width: `${value.width}%`,
            height: `${value.height}%`,
          }}
          onMouseDown={handleMouseDown}
          aria-label="Drag to move crop area"
        >
          {showGrid && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/30" />
              ))}
            </div>
          )}

          {/* Resize handles */}
          <button
            type="button"
            className="-top-1 -left-1 absolute h-3 w-3 cursor-nw-resize border border-gray-300 bg-white"
            aria-label="Resize crop area"
          />
          <button
            type="button"
            className="-top-1 -right-1 absolute h-3 w-3 cursor-ne-resize border border-gray-300 bg-white"
            aria-label="Resize crop area"
          />
          <button
            type="button"
            className="-bottom-1 -left-1 absolute h-3 w-3 cursor-sw-resize border border-gray-300 bg-white"
            aria-label="Resize crop area"
          />
          <button
            type="button"
            className="-bottom-1 -right-1 absolute h-3 w-3 cursor-se-resize border border-gray-300 bg-white"
            aria-label="Resize crop area"
          />
        </button>
      )}

      {/* Overlay to darken non-crop areas */}
      {value && (
        <>
          {/* Top overlay */}
          <div
            className="absolute top-0 right-0 left-0 bg-black/50"
            style={{ height: `${value.y}%` }}
          />
          {/* Bottom overlay */}
          <div
            className="absolute right-0 bottom-0 left-0 bg-black/50"
            style={{ height: `${100 - value.y - value.height}%` }}
          />
          {/* Left overlay */}
          <div
            className="absolute left-0 bg-black/50"
            style={{
              top: `${value.y}%`,
              height: `${value.height}%`,
              width: `${value.x}%`,
            }}
          />
          {/* Right overlay */}
          <div
            className="absolute right-0 bg-black/50"
            style={{
              top: `${value.y}%`,
              height: `${value.height}%`,
              width: `${100 - value.x - value.width}%`,
            }}
          />
        </>
      )}

      {children}
    </CropAreaPrimitive>
  );
}

function Image(props: ImageProps) {
  const { className, asChild, ...imageProps } = props;
  const { src, alt, zoom, rotation } = useImageCrop();

  if (!src) return null;

  const ImagePrimitive = asChild ? Slot : "img";

  return (
    <ImagePrimitive
      src={src}
      alt={alt}
      className={cn(
        "absolute inset-0 h-full w-full object-contain transition-transform duration-200",
        className,
      )}
      style={{
        transform: `scale(${zoom}) rotate(${rotation}deg)`,
      }}
      draggable={false}
      {...imageProps}
    />
  );
}

function Controls(props: ControlsProps) {
  const { className, children, asChild, ...controlsProps } = props;

  const ControlsPrimitive = asChild ? Slot : "div";

  return (
    <ControlsPrimitive
      className={cn("flex items-center gap-2", className)}
      {...controlsProps}
    >
      {children}
    </ControlsPrimitive>
  );
}

function ZoomSlider(props: ZoomSliderProps) {
  const { min, max, step = 0.1, className, asChild, ...sliderProps } = props;
  const { zoom, onZoomChange, minZoom, maxZoom, disabled, readOnly } =
    useImageCrop();

  const handleValueChange = React.useCallback(
    (value: number[]) => {
      onZoomChange?.(value[0] ?? minZoom);
    },
    [onZoomChange, minZoom],
  );

  const SliderPrimitive = asChild ? Slot : "div";

  return (
    <SliderPrimitive
      className={cn("flex flex-1 items-center gap-2", className)}
      {...sliderProps}
    >
      <span className="text-muted-foreground text-sm">1x</span>
      <Slider
        value={[zoom]}
        onValueChange={handleValueChange}
        min={min ?? minZoom}
        max={max ?? maxZoom}
        step={step}
        disabled={disabled || readOnly}
        className="flex-1"
      />
      <span className="text-muted-foreground text-sm">{maxZoom}x</span>
    </SliderPrimitive>
  );
}

function RotateButton(props: RotateButtonProps) {
  const {
    direction = "left",
    variant = "outline",
    size = "sm",
    className,
    onClick,
    asChild,
    ...buttonProps
  } = props;
  const { rotation, onRotationChange, disabled, readOnly } = useImageCrop();

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      const newRotation = direction === "left" ? rotation - 90 : rotation + 90;
      onRotationChange?.(newRotation);
    },
    [direction, rotation, onRotationChange, onClick],
  );

  const Icon = direction === "left" ? RotateCcw : RotateCw;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || readOnly}
      className={className}
      asChild={asChild}
      {...buttonProps}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function ResetButton(props: ResetButtonProps) {
  const {
    variant = "outline",
    size = "sm",
    className,
    onClick,
    asChild,
    ...buttonProps
  } = props;
  const { onZoomChange, onRotationChange, onValueChange, disabled, readOnly } =
    useImageCrop();

  const handleReset = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      onZoomChange?.(1);
      onRotationChange?.(0);
      onValueChange?.({ x: 0, y: 0, width: 100, height: 100 });
    },
    [onZoomChange, onRotationChange, onValueChange, onClick],
  );

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleReset}
      disabled={disabled || readOnly}
      className={className}
      asChild={asChild}
      {...buttonProps}
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
}

function CropButton(props: CropButtonProps) {
  const {
    variant = "default",
    size = "sm",
    className,
    children,
    onClick,
    asChild,
    ...buttonProps
  } = props;
  const { src, value, zoom, rotation, quality, outputFormat, mediaSize } =
    useImageCrop();

  const handleCrop = React.useCallback(async () => {
    if (!src || !value || !mediaSize) return;

    // Create a canvas to perform the crop
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create an image element
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    return new Promise<void>((resolve) => {
      img.onload = () => {
        // Calculate the actual crop dimensions
        const cropX = (value.x / 100) * img.naturalWidth;
        const cropY = (value.y / 100) * img.naturalHeight;
        const cropWidth = (value.width / 100) * img.naturalWidth;
        const cropHeight = (value.height / 100) * img.naturalHeight;

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Apply transformations
        ctx.save();
        ctx.translate(cropWidth / 2, cropHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        ctx.translate(-cropWidth / 2, -cropHeight / 2);

        // Draw the cropped image
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight,
        );

        ctx.restore();

        // Convert to blob and trigger download or callback
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "cropped-image." + outputFormat.split("/")[1];
              a.click();
              URL.revokeObjectURL(url);
            }
            resolve();
          },
          outputFormat,
          quality,
        );
      };

      img.src = src;
    });
  }, [src, value, zoom, rotation, quality, outputFormat, mediaSize]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      handleCrop();
    },
    [onClick, handleCrop],
  );

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={!src || !value}
      className={className}
      asChild={asChild}
      {...buttonProps}
    >
      {children || (
        <>
          <Crop className="mr-2 h-4 w-4" />
          Crop Image
        </>
      )}
    </Button>
  );
}

export {
  Root,
  CropArea,
  Image,
  Controls,
  ZoomSlider,
  RotateButton,
  ResetButton,
  CropButton,
};
