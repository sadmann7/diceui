"use client";

import { NOOP } from "@base-ui/utils/empty";
import { ownerDocument } from "@base-ui/utils/owner";
import { ReactStore, useStore } from "@base-ui/utils/store";
import { useAnimationFrame } from "@base-ui/utils/useAnimationFrame";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { cn } from "cn";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";

const ROOT_NAME = "QRCode";
const CANVAS_NAME = "QRCodeCanvas";
const SVG_NAME = "QRCodeSvg";
const IMAGE_NAME = "QRCodeImage";
const DOWNLOAD_NAME = "QRCodeDownload";
const SKELETON_NAME = "QRCodeSkeleton";

type QRCodeLevel = "L" | "M" | "Q" | "H";

interface QRCodeCanvasOpts {
  errorCorrectionLevel: QRCodeLevel;
  type?: "image/png" | "image/jpeg" | "image/webp";
  quality?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
  width?: number;
  rendererOpts?: {
    quality?: number;
  };
}

interface StoreState {
  dataUrl: string | null;
  svgString: string | null;
  isGenerating: boolean;
  error: Error | null;
  generationKey: string;
}

const selectors = {
  dataUrl: (state: StoreState) => state.dataUrl,
  svgString: (state: StoreState) => state.svgString,
  generationKey: (state: StoreState) => state.generationKey,
};

interface StoreController {
  onError: (error: Error) => void;
  onGenerated: () => void;
}

type Store = ReactStore<StoreState, StoreController, typeof selectors>;

interface QRCodeContextValue {
  value: string;
  size: number;
  margin: number;
  level: QRCodeLevel;
  backgroundColor: string;
  foregroundColor: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const store = React.useContext(StoreContext);
  if (!store) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return store;
}

function useQRCode<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useQRCode");
  return useStore(store, selector);
}

const QRCodeContext = React.createContext<QRCodeContextValue | null>(null);

function useQRCodeContext(consumerName: string) {
  const context = React.useContext(QRCodeContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface QRCodeProps extends Omit<React.ComponentProps<"div">, "onError"> {
  value: string;
  size?: number;
  level?: QRCodeLevel;
  margin?: number;
  quality?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  onError?: (error: Error) => void;
  onGenerated?: () => void;
  asChild?: boolean;
}

function QRCode(props: QRCodeProps) {
  const {
    value,
    size = 200,
    level = "M",
    margin = 1,
    quality = 0.92,
    backgroundColor = "#ffffff",
    foregroundColor = "#000000",
    onError,
    onGenerated,
    className,
    style,
    asChild,
    ...rootProps
  } = props;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [store] = React.useState<Store>(
    () =>
      new ReactStore<StoreState, StoreController, typeof selectors>(
        {
          dataUrl: null,
          svgString: null,
          isGenerating: false,
          error: null,
          generationKey: "",
        },
        { onError: NOOP, onGenerated: NOOP },
        selectors,
      ),
  );

  store.useContextCallback("onError", onError);
  store.useContextCallback("onGenerated", onGenerated);

  const generateFrame = useAnimationFrame();

  const canvasOpts = React.useMemo<QRCodeCanvasOpts>(
    () => ({
      errorCorrectionLevel: level,
      type: "image/png",
      quality,
      margin,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
      width: size,
    }),
    [level, margin, foregroundColor, backgroundColor, size, quality],
  );

  const generationKey = React.useMemo(() => {
    if (!value) return "";

    return JSON.stringify({
      value,
      size,
      level,
      margin,
      quality,
      foregroundColor,
      backgroundColor,
    });
  }, [value, level, margin, foregroundColor, backgroundColor, size, quality]);

  const onQRCodeGenerate = React.useCallback(
    async (targetGenerationKey: string) => {
      if (!value || !targetGenerationKey) return;

      const currentState = store.state;
      if (
        currentState.isGenerating ||
        currentState.generationKey === targetGenerationKey
      )
        return;

      store.update({
        isGenerating: true,
        error: null,
      });

      try {
        const QRCode = (await import("qrcode")).default;

        let dataUrl: string | null = null;

        try {
          dataUrl = await QRCode.toDataURL(value, canvasOpts);
        } catch {
          dataUrl = null;
        }

        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, value, canvasOpts);
        }

        const svgString = await QRCode.toString(value, {
          errorCorrectionLevel: canvasOpts.errorCorrectionLevel,
          margin: canvasOpts.margin,
          color: canvasOpts.color,
          width: canvasOpts.width,
          type: "svg",
        });

        store.update({
          dataUrl,
          svgString,
          isGenerating: false,
          generationKey: targetGenerationKey,
        });

        store.context.onGenerated();
      } catch (error) {
        const parsedError =
          error instanceof Error
            ? error
            : new Error("Failed to generate QR code");
        store.update({
          error: parsedError,
          isGenerating: false,
        });
        store.context.onError(parsedError);
      }
    },
    [value, canvasOpts, store],
  );

  const contextValue = React.useMemo<QRCodeContextValue>(
    () => ({
      value,
      size,
      level,
      margin,
      backgroundColor,
      foregroundColor,
      canvasRef,
    }),
    [value, size, backgroundColor, foregroundColor, level, margin],
  );

  useIsoLayoutEffect(() => {
    if (!generationKey) return;

    generateFrame.request(() => {
      void onQRCodeGenerate(generationKey);
    });

    return generateFrame.cancel;
  }, [generationKey, generateFrame, onQRCodeGenerate]);

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <QRCodeContext.Provider value={contextValue}>
        <RootPrimitive
          data-slot="qr-code"
          {...rootProps}
          className={cn("cn-qr-code", className)}
          style={
            {
              "--qr-code-size": `${size}px`,
              ...style,
            } as React.CSSProperties
          }
        />
      </QRCodeContext.Provider>
    </StoreContext.Provider>
  );
}

interface QRCodeCanvasProps extends React.ComponentProps<"canvas"> {
  asChild?: boolean;
}

function QRCodeCanvas(props: QRCodeCanvasProps) {
  const { asChild, className, ref, ...canvasProps } = props;

  const context = useQRCodeContext(CANVAS_NAME);
  const store = useStoreContext(CANVAS_NAME);
  const generationKey = useStore(store, selectors.generationKey);

  const composedRef = useMergedRefs(ref, context.canvasRef);

  const CanvasPrimitive = asChild ? SlotPrimitive.Slot : "canvas";

  return (
    <CanvasPrimitive
      data-slot="qr-code-canvas"
      {...canvasProps}
      ref={composedRef}
      width={context.size}
      height={context.size}
      className={cn(
        "cn-qr-code-canvas",
        !generationKey && "invisible",
        className,
      )}
    />
  );
}

interface QRCodeSvgProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function QRCodeSvg(props: QRCodeSvgProps) {
  const { asChild, className, style, ...svgProps } = props;

  const context = useQRCodeContext(SVG_NAME);
  const store = useStoreContext(SVG_NAME);
  const svgString = useStore(store, selectors.svgString);

  if (!svgString) return null;

  const SvgPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <SvgPrimitive
      data-slot="qr-code-svg"
      {...svgProps}
      className={cn("cn-qr-code-svg", className)}
      style={{ width: context.size, height: context.size, ...style }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}

interface QRCodeImageProps extends React.ComponentProps<"img"> {
  asChild?: boolean;
}

function QRCodeImage(props: QRCodeImageProps) {
  const { alt = "QR Code", asChild, className, ...imageProps } = props;

  const context = useQRCodeContext(IMAGE_NAME);
  const store = useStoreContext(IMAGE_NAME);
  const dataUrl = useStore(store, selectors.dataUrl);

  if (!dataUrl) return null;

  const ImagePrimitive = asChild ? SlotPrimitive.Slot : "img";

  return (
    <ImagePrimitive
      data-slot="qr-code-image"
      {...imageProps}
      src={dataUrl}
      alt={alt}
      width={context.size}
      height={context.size}
      className={cn("cn-qr-code-image", className)}
    />
  );
}

interface QRCodeDownloadProps extends React.ComponentProps<"button"> {
  filename?: string;
  format?: "png" | "svg";
  asChild?: boolean;
}

function QRCodeDownload(props: QRCodeDownloadProps) {
  const {
    filename = "qrcode",
    format = "png",
    asChild,
    className,
    onClick: onClickProp,
    children,
    ...buttonProps
  } = props;

  const store = useStoreContext(DOWNLOAD_NAME);
  const dataUrl = useStore(store, selectors.dataUrl);
  const svgString = useStore(store, selectors.svgString);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      const ownerDoc = ownerDocument(event.currentTarget);
      const link = ownerDoc.createElement("a");

      if (format === "png" && dataUrl) {
        link.href = dataUrl;
        link.download = `${filename}.png`;
      } else if (format === "svg" && svgString) {
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.svg`;
      } else {
        return;
      }

      ownerDoc.body.appendChild(link);
      link.click();
      ownerDoc.body.removeChild(link);

      if (format === "svg" && svgString) {
        URL.revokeObjectURL(link.href);
      }
    },
    [dataUrl, svgString, filename, format, onClickProp],
  );

  const ButtonPrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <ButtonPrimitive
      type="button"
      data-slot="qr-code-download"
      {...buttonProps}
      className={cn("cn-qr-code-download", className)}
      onClick={onClick}
    >
      {children ?? `Download ${format.toUpperCase()}`}
    </ButtonPrimitive>
  );
}

interface QRCodeOverlayProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function QRCodeOverlay(props: QRCodeOverlayProps) {
  const { asChild, className, ...overlayProps } = props;

  const OverlayPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <OverlayPrimitive
      data-slot="qr-code-overlay"
      {...overlayProps}
      className={cn("cn-qr-code-overlay", className)}
    />
  );
}

interface QRCodeSkeletonProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function QRCodeSkeleton(props: QRCodeSkeletonProps) {
  const { asChild, className, style, ...skeletonProps } = props;

  const context = useQRCodeContext(SKELETON_NAME);
  const store = useStoreContext(SKELETON_NAME);
  const dataUrl = useStore(store, selectors.dataUrl);
  const svgString = useStore(store, selectors.svgString);
  const generationKey = useStore(store, selectors.generationKey);

  const isLoaded = dataUrl || svgString || generationKey;

  if (isLoaded) return null;

  const SkeletonPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <SkeletonPrimitive
      data-slot="qr-code-skeleton"
      {...skeletonProps}
      className={cn("cn-qr-code-skeleton", className)}
      style={{
        width: context.size,
        height: context.size,
        ...style,
      }}
    />
  );
}

export {
  QRCode,
  QRCodeCanvas,
  QRCodeDownload,
  QRCodeImage,
  QRCodeOverlay,
  type QRCodeProps,
  QRCodeSkeleton,
  QRCodeSvg,
  useQRCode,
};
