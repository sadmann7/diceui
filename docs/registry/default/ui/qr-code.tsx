"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";

const ROOT_NAME = "QRCode";
const IMAGE_NAME = "QRCodeImage";
const CANVAS_NAME = "QRCodeCanvas";
const SVG_NAME = "QRCodeSvg";

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

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

interface StoreState {
  dataUrl: string | null;
  svgString: string | null;
  isGenerating: boolean;
  error: Error | null;
  generationKey: string;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  setStates: (updates: Partial<StoreState>) => void;
  notify: () => void;
}

interface QRCodeContextValue {
  value: string;
  size: number;
  margin: number;
  level: QRCodeLevel;
  backgroundColor: string;
  foregroundColor: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

function createStore(
  listenersRef: React.RefObject<Set<() => void>>,
  stateRef: React.RefObject<StoreState>,
): Store {
  const store: Store = {
    subscribe: (cb) => {
      listenersRef.current.add(cb);
      return () => listenersRef.current.delete(cb);
    },
    getState: () => stateRef.current,
    setState: (key, value) => {
      if (Object.is(stateRef.current[key], value)) return;
      stateRef.current[key] = value;
      store.notify();
    },
    setStates: (updates) => {
      let hasChanged = false;

      for (const key of Object.keys(updates) as Array<keyof StoreState>) {
        const value = updates[key];
        if (value !== undefined && !Object.is(stateRef.current[key], value)) {
          Object.assign(stateRef.current, { [key]: value });
          hasChanged = true;
        }
      }

      if (hasChanged) {
        store.notify();
      }
    },
    notify: () => {
      for (const cb of listenersRef.current) {
        cb();
      }
    },
  };

  return store;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const store = React.useContext(StoreContext);
  if (!store) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return store;
}

const QRCodeContext = React.createContext<QRCodeContextValue | null>(null);

function useQRCodeContext(consumerName: string) {
  const context = React.useContext(QRCodeContext);
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

interface QRCodeRootProps extends Omit<React.ComponentProps<"div">, "onError"> {
  value: string;
  size?: number;
  margin?: number;
  level?: QRCodeLevel;
  quality?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  onError?: (error: Error) => void;
  onGenerated?: () => void;
  asChild?: boolean;
}

function QRCodeRoot(props: QRCodeRootProps) {
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
    asChild,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const stateRef = useLazyRef<StoreState>(() => ({
    dataUrl: null,
    svgString: null,
    isGenerating: false,
    error: null,
    generationKey: "",
  }));

  const store = React.useMemo(
    () => createStore(listenersRef, stateRef),
    [listenersRef, stateRef],
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
      level,
      margin,
      foregroundColor,
      backgroundColor,
      size,
      quality,
    });
  }, [value, level, margin, foregroundColor, backgroundColor, size, quality]);

  const onQRCodeGenerate = React.useCallback(
    async (targetGenerationKey: string) => {
      if (!value || !targetGenerationKey) return;

      const currentState = store.getState();
      if (
        currentState.isGenerating ||
        currentState.generationKey === targetGenerationKey
      )
        return;

      store.setStates({
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

        store.setStates({
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
        store.setStates({
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

  React.useLayoutEffect(() => {
    if (generationKey) {
      // Small delay to ensure canvas is mounted
      const timeoutId = setTimeout(() => {
        onQRCodeGenerate(generationKey);
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [generationKey, onQRCodeGenerate]);

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <QRCodeContext.Provider value={contextValue}>
        <RootPrimitive data-slot="qr-code" {...rootProps} />
      </QRCodeContext.Provider>
    </StoreContext.Provider>
  );
}

interface QRCodeImageProps extends React.ComponentProps<"img"> {
  asChild?: boolean;
}

function QRCodeImage(props: QRCodeImageProps) {
  const { alt = "QR Code", asChild, ...imageProps } = props;

  const context = useQRCodeContext(IMAGE_NAME);
  const dataUrl = useStore((state) => state.dataUrl);

  if (!dataUrl) return null;

  const ImagePrimitive = asChild ? Slot : "img";

  return (
    <ImagePrimitive
      data-slot="qr-code-image"
      {...imageProps}
      src={dataUrl}
      alt={alt}
      width={context.size}
      height={context.size}
    />
  );
}

interface QRCodeCanvasProps extends React.ComponentProps<"canvas"> {
  asChild?: boolean;
}

function QRCodeCanvas(props: QRCodeCanvasProps) {
  const { asChild, ref, ...canvasProps } = props;

  const context = useQRCodeContext(CANVAS_NAME);

  const composedRef = useComposedRefs(ref, context.canvasRef);

  const CanvasPrimitive = asChild ? Slot : "canvas";

  return (
    <CanvasPrimitive
      data-slot="qr-code-canvas"
      {...canvasProps}
      ref={composedRef}
      width={context.size}
      height={context.size}
    />
  );
}

interface QRCodeSvgProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function QRCodeSvg(props: QRCodeSvgProps) {
  const { asChild, ...svgProps } = props;

  const context = useQRCodeContext(SVG_NAME);
  const svgString = useStore((state) => state.svgString);

  if (!svgString) return null;

  const SvgPrimitive = asChild ? Slot : "div";

  return (
    <SvgPrimitive
      data-slot="qr-code-svg"
      {...svgProps}
      style={{ width: context.size, height: context.size }}
      dangerouslySetInnerHTML={{ __html: svgString }}
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
    children,
    ...buttonProps
  } = props;

  const dataUrl = useStore((state) => state.dataUrl);
  const svgString = useStore((state) => state.svgString);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      buttonProps.onClick?.(event);
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
    [dataUrl, svgString, filename, format, buttonProps.onClick],
  );

  const ButtonPrimitive = asChild ? Slot : "button";

  return (
    <ButtonPrimitive
      type="button"
      data-slot="qr-code-download"
      {...buttonProps}
      onClick={onClick}
    >
      {children ?? `Download ${format.toUpperCase()}`}
    </ButtonPrimitive>
  );
}

export {
  QRCodeRoot as Root,
  QRCodeImage as Image,
  QRCodeCanvas as Canvas,
  QRCodeSvg as Svg,
  QRCodeDownload as Download,
  //
  QRCodeRoot as QRCode,
  QRCodeImage,
  QRCodeCanvas,
  QRCodeSvg,
  QRCodeDownload,
  //
  useStore as useQRCode,
  //
  type QRCodeRootProps as QRCodeProps,
};
