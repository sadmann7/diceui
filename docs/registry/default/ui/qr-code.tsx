"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";

const ROOT_NAME = "QRCode";
const IMAGE_NAME = "QRCodeImage";
const CANVAS_NAME = "QRCodeCanvas";
const SVG_NAME = "QRCodeSvg";

type QRCodeLevel = "L" | "M" | "Q" | "H";

interface QRCodeCanvasOptions {
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

interface QRCodeStringOptions {
  errorCorrectionLevel?: QRCodeLevel;
  type?: "svg" | "terminal" | "utf8";
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
  width?: number;
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
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  batchUpdate: (updates: Partial<StoreState>) => void;
  notify: () => void;
}

interface QRCodeContextValue {
  value: string;
  size: number;
  bgColor: string;
  fgColor: string;
  level: QRCodeLevel;
  includeMargin: boolean;
  marginSize: number;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate?: boolean;
  };
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  generateQRCode: () => Promise<void>;
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
    batchUpdate: (updates) => {
      let hasChanges = false;

      if (
        updates.dataUrl !== undefined &&
        !Object.is(stateRef.current.dataUrl, updates.dataUrl)
      ) {
        stateRef.current.dataUrl = updates.dataUrl;
        hasChanges = true;
      }
      if (
        updates.svgString !== undefined &&
        !Object.is(stateRef.current.svgString, updates.svgString)
      ) {
        stateRef.current.svgString = updates.svgString;
        hasChanges = true;
      }
      if (
        updates.isGenerating !== undefined &&
        !Object.is(stateRef.current.isGenerating, updates.isGenerating)
      ) {
        stateRef.current.isGenerating = updates.isGenerating;
        hasChanges = true;
      }
      if (
        updates.error !== undefined &&
        !Object.is(stateRef.current.error, updates.error)
      ) {
        stateRef.current.error = updates.error;
        hasChanges = true;
      }

      if (hasChanges) {
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
  bgColor?: string;
  fgColor?: string;
  level?: QRCodeLevel;
  includeMargin?: boolean;
  marginSize?: number;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate?: boolean;
  };
  onError?: (error: Error) => void;
  onGenerated?: () => void;
  asChild?: boolean;
}

function QRCodeRoot(props: QRCodeRootProps) {
  const {
    value,
    size = 200,
    bgColor = "#ffffff",
    fgColor = "#000000",
    level = "M",
    includeMargin = true,
    marginSize = 4,
    imageSettings,
    onError,
    onGenerated,
    asChild,
    children,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const stateRef = useLazyRef<StoreState>(() => ({
    dataUrl: null,
    svgString: null,
    isGenerating: false,
    error: null,
  }));

  const store = React.useMemo(
    () => createStore(listenersRef, stateRef),
    [listenersRef, stateRef],
  );

  const generateQRCode = React.useCallback(async () => {
    const state = stateRef.current;
    if (state.isGenerating || !value) return;

    store.batchUpdate({
      isGenerating: true,
      error: null,
    });

    try {
      const QRCode = (await import("qrcode")).default;

      const canvasOptions: QRCodeCanvasOptions = {
        errorCorrectionLevel: level,
        type: "image/png",
        quality: 0.92,
        margin: includeMargin ? marginSize : 0,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        width: size,
      };

      let dataUrl: string | null = null;
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, value, canvasOptions);
        const canvas = canvasRef.current;
        dataUrl = canvas.toDataURL("image/png");
      }

      const svgOptions: QRCodeStringOptions = {
        errorCorrectionLevel: canvasOptions.errorCorrectionLevel,
        margin: canvasOptions.margin,
        color: canvasOptions.color,
        width: canvasOptions.width,
        type: "svg",
      };
      const svgString = await QRCode.toString(value, svgOptions);

      store.batchUpdate({
        dataUrl,
        svgString,
        isGenerating: false,
      });

      onGenerated?.();
    } catch (error) {
      const err = error as Error;
      store.batchUpdate({
        error: err,
        isGenerating: false,
      });
      onError?.(err);
    }
  }, [
    value,
    size,
    bgColor,
    fgColor,
    level,
    includeMargin,
    marginSize,
    onError,
    onGenerated,
    store,
    stateRef.current,
  ]);

  const qrCodeContextValue = React.useMemo<QRCodeContextValue>(
    () => ({
      value,
      size,
      bgColor,
      fgColor,
      level,
      includeMargin,
      marginSize,
      imageSettings,
      canvasRef,
      generateQRCode,
    }),
    [
      value,
      size,
      bgColor,
      fgColor,
      level,
      includeMargin,
      marginSize,
      imageSettings,
      generateQRCode,
    ],
  );

  React.useEffect(() => {
    if (value) {
      generateQRCode();
    }
  }, [value, generateQRCode]);

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <QRCodeContext.Provider value={qrCodeContextValue}>
        <RootPrimitive data-slot="qr-code" {...rootProps}>
          {children}
        </RootPrimitive>
      </QRCodeContext.Provider>
    </StoreContext.Provider>
  );
}

interface QRCodeImageProps extends React.ComponentProps<"img"> {
  alt?: string;
  asChild?: boolean;
}

function QRCodeImage(props: QRCodeImageProps) {
  const { alt = "QR Code", asChild, ref, ...imageProps } = props;

  const context = useQRCodeContext(IMAGE_NAME);
  const dataUrl = useStore((state) => state.dataUrl);

  if (!dataUrl) return null;

  const ImagePrimitive = asChild ? Slot : "img";

  return (
    <ImagePrimitive
      src={dataUrl}
      alt={alt}
      width={context.size}
      height={context.size}
      data-slot="qr-code-image"
      ref={ref}
      {...imageProps}
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
      ref={composedRef}
      width={context.size}
      height={context.size}
      data-slot="qr-code-canvas"
      {...canvasProps}
    />
  );
}

interface QRCodeSvgProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function QRCodeSvg(props: QRCodeSvgProps) {
  const { asChild, ref, ...svgProps } = props;

  const context = useQRCodeContext(SVG_NAME);
  const svgString = useStore((state) => state.svgString);

  if (!svgString) return null;

  const SvgPrimitive = asChild ? Slot : "div";

  return (
    <SvgPrimitive
      data-slot="qr-code-svg"
      style={{ width: context.size, height: context.size }}
      dangerouslySetInnerHTML={{ __html: svgString }}
      ref={ref}
      {...svgProps}
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
    ref,
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
      ref={ref}
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
