"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ReactStore, useStore } from "@base-ui/utils/store";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { cn } from "cn";
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

type Store = ReactStore<StoreState, Record<string, never>, typeof selectors>;

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

interface QRCodeProps extends Omit<useRender.ComponentProps<"div">, "onError"> {
  value: string;
  size?: number;
  level?: QRCodeLevel;
  margin?: number;
  quality?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  onError?: (error: Error) => void;
  onGenerated?: () => void;
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
    render,
    ...rootProps
  } = props;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [store] = React.useState<Store>(
    () =>
      new ReactStore<StoreState, Record<string, never>, typeof selectors>(
        {
          dataUrl: null,
          svgString: null,
          isGenerating: false,
          error: null,
          generationKey: "",
        },
        {},
        selectors,
      ),
  );

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

        onGenerated?.();
      } catch (error) {
        const parsedError =
          error instanceof Error
            ? error
            : new Error("Failed to generate QR code");
        store.update({
          error: parsedError,
          isGenerating: false,
        });
        onError?.(parsedError);
      }
    },
    [value, canvasOpts, store, onError, onGenerated],
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
    if (generationKey) {
      const rafId = requestAnimationFrame(() => {
        void onQRCodeGenerate(generationKey);
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [generationKey, onQRCodeGenerate]);

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("cn-qr-code", className),
        style: {
          "--qr-code-size": `${size}px`,
          ...style,
        } as React.CSSProperties,
      },
      rootProps,
    ),
    render,
    state: { slot: "qr-code" },
  });

  return (
    <StoreContext.Provider value={store}>
      <QRCodeContext.Provider value={contextValue}>
        {element}
      </QRCodeContext.Provider>
    </StoreContext.Provider>
  );
}

interface QRCodeCanvasProps
  extends React.ComponentProps<"canvas">, useRender.ComponentProps<"canvas"> {}

function QRCodeCanvas(props: QRCodeCanvasProps) {
  const { render, className, ref, ...canvasProps } = props;
  const context = useQRCodeContext(CANVAS_NAME);
  const store = useStoreContext(CANVAS_NAME);
  const generationKey = useStore(store, selectors.generationKey);

  const composedRef = useMergedRefs(ref, context.canvasRef);

  return useRender({
    defaultTagName: "canvas",
    props: mergeProps<"canvas">(
      {
        ref: composedRef,
        width: context.size,
        height: context.size,
        className: cn(
          "cn-qr-code-canvas",
          !generationKey && "invisible",
          className,
        ),
      },
      canvasProps,
    ),
    render,
    state: { slot: "qr-code-canvas" },
  });
}

interface QRCodeSvgProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {}

function QRCodeSvg(props: QRCodeSvgProps) {
  const { render, className, style, ...svgProps } = props;
  const context = useQRCodeContext(SVG_NAME);
  const store = useStoreContext(SVG_NAME);
  const svgString = useStore(store, selectors.svgString);

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("cn-qr-code-svg", className),
        style: { width: context.size, height: context.size, ...style },
        dangerouslySetInnerHTML: svgString ? { __html: svgString } : undefined,
      },
      svgProps,
    ),
    render,
    state: { slot: "qr-code-svg" },
  });

  if (!svgString) return null;

  return element;
}

interface QRCodeImageProps
  extends React.ComponentProps<"img">, useRender.ComponentProps<"img"> {}

function QRCodeImage(props: QRCodeImageProps) {
  const { alt = "QR Code", render, className, ...imageProps } = props;
  const context = useQRCodeContext(IMAGE_NAME);
  const store = useStoreContext(IMAGE_NAME);
  const dataUrl = useStore(store, selectors.dataUrl);

  const element = useRender({
    defaultTagName: "img",
    props: mergeProps<"img">(
      {
        src: dataUrl ?? undefined,
        alt,
        width: context.size,
        height: context.size,
        className: cn("cn-qr-code-image", className),
      },
      imageProps,
    ),
    render,
    state: { slot: "qr-code-image" },
  });

  if (!dataUrl) return null;

  return element;
}

interface QRCodeDownloadProps
  extends React.ComponentProps<"button">, useRender.ComponentProps<"button"> {
  filename?: string;
  format?: "png" | "svg";
}

function QRCodeDownload(props: QRCodeDownloadProps) {
  const {
    filename = "qrcode",
    format = "png",
    render,
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

      const link = document.createElement("a");

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

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (format === "svg" && svgString) {
        URL.revokeObjectURL(link.href);
      }
    },
    [dataUrl, svgString, filename, format, onClickProp],
  );

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: "button",
        className: cn("cn-qr-code-download", className),
        onClick,
        children: children ?? `Download ${format.toUpperCase()}`,
      },
      buttonProps,
    ),
    render,
    state: { slot: "qr-code-download" },
  });
}

interface QRCodeOverlayProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {}

function QRCodeOverlay(props: QRCodeOverlayProps) {
  const { render, className, ...overlayProps } = props;
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("cn-qr-code-overlay", className),
      },
      overlayProps,
    ),
    render,
    state: { slot: "qr-code-overlay" },
  });
}

interface QRCodeSkeletonProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {}

function QRCodeSkeleton(props: QRCodeSkeletonProps) {
  const { render, className, style, ...skeletonProps } = props;
  const context = useQRCodeContext(SKELETON_NAME);
  const store = useStoreContext(SKELETON_NAME);
  const dataUrl = useStore(store, selectors.dataUrl);
  const svgString = useStore(store, selectors.svgString);
  const generationKey = useStore(store, selectors.generationKey);

  const isLoaded = dataUrl || svgString || generationKey;

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("cn-qr-code-skeleton", className),
        style: {
          width: context.size,
          height: context.size,
          ...style,
        },
      },
      skeletonProps,
    ),
    render,
    state: { slot: "qr-code-skeleton" },
  });

  if (isLoaded) return null;

  return element;
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
