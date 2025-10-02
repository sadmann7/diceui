"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

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

// QR code generation utilities

// Context for sharing QR code data between components
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
  onError?: (error: Error) => void;
  onGenerated?: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  dataUrl: string | null;
  svgString: string | null;
}

const QRCodeContext = React.createContext<QRCodeContextValue | null>(null);

function useQRCodeContext() {
  const context = React.useContext(QRCodeContext);
  if (!context) {
    throw new Error("QR code components must be used within QRCodeRoot");
  }
  return context;
}

// QR code generation hook
function useQRCodeGeneration(
  value: string,
  options: Partial<QRCodeCanvasOptions>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  _svgRef: React.RefObject<SVGSVGElement | null>,
  onError?: (error: Error) => void,
  onGenerated?: () => void,
) {
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [svgString, setSvgString] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function generateQRCode() {
      try {
        // Dynamic import to avoid SSR issues
        const QRCode = (await import("qrcode")).default;

        const canvasOptions: QRCodeCanvasOptions = {
          errorCorrectionLevel: options.errorCorrectionLevel || "M",
          type: "image/png",
          quality: 0.92,
          margin: options.margin || 4,
          color: {
            dark: options.color?.dark || "#000000",
            light: options.color?.light || "#ffffff",
          },
          width: options.width,
        };

        // Generate canvas version
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, value, canvasOptions);
          const canvas = canvasRef.current;
          const url = canvas.toDataURL("image/png");
          if (mounted) {
            setDataUrl(url);
          }
        }

        // Generate SVG version
        const svgOptions: QRCodeStringOptions = {
          errorCorrectionLevel: canvasOptions.errorCorrectionLevel,
          margin: canvasOptions.margin,
          color: canvasOptions.color,
          width: canvasOptions.width,
          type: "svg",
        };
        const svgStr = await QRCode.toString(value, svgOptions);

        if (mounted) {
          setSvgString(svgStr);
          onGenerated?.();
        }
      } catch (error) {
        if (mounted) {
          onError?.(error as Error);
        }
      }
    }

    if (value) {
      generateQRCode();
    }

    return () => {
      mounted = false;
    };
  }, [value, options, canvasRef, onError, onGenerated]);

  return { dataUrl, svgString };
}

interface QRCodeRootProps
  extends Omit<React.ComponentProps<"div">, "children" | "onError"> {
  /**
   * The data to encode in the QR code.
   */
  value: string;

  /**
   * The size of the QR code in pixels.
   * @default 200
   */
  size?: number;

  /**
   * The background color of the QR code.
   * @default "#ffffff"
   */
  bgColor?: string;

  /**
   * The foreground color of the QR code.
   * @default "#000000"
   */
  fgColor?: string;

  /**
   * The error correction level.
   * @default "M"
   */
  level?: QRCodeLevel;

  /**
   * Whether to include a quiet zone (border) around the QR code.
   * @default true
   */
  includeMargin?: boolean;

  /**
   * The width of the quiet zone in modules.
   * @default 4
   */
  marginSize?: number;

  /**
   * Image settings for embedding an image in the QR code.
   */
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate?: boolean;
  };

  /**
   * Callback fired when the QR code fails to generate.
   */
  onError?: (error: Error) => void;

  /**
   * Callback fired when the QR code is successfully generated.
   */
  onGenerated?: () => void;

  /**
   * Whether to render as a child component.
   * @default false
   */
  asChild?: boolean;

  children?: React.ReactNode;
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
    className,
    children,
    ...rootProps
  } = props;

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const qrOptions = React.useMemo(
    () => ({
      errorCorrectionLevel: level,
      margin: includeMargin ? marginSize : 0,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      width: size,
    }),
    [level, includeMargin, marginSize, fgColor, bgColor, size],
  );

  const { dataUrl, svgString } = useQRCodeGeneration(
    value,
    qrOptions,
    canvasRef,
    svgRef,
    onError,
    onGenerated,
  );

  const contextValue = React.useMemo<QRCodeContextValue>(
    () => ({
      value,
      size,
      bgColor,
      fgColor,
      level,
      includeMargin,
      marginSize,
      imageSettings,
      onError,
      onGenerated,
      canvasRef,
      svgRef,
      dataUrl,
      svgString,
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
      onError,
      onGenerated,
      dataUrl,
      svgString,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <QRCodeContext.Provider value={contextValue}>
      <RootPrimitive className={cn("qr-code-root", className)} {...rootProps}>
        {children}
      </RootPrimitive>
    </QRCodeContext.Provider>
  );
}

interface QRCodeImageProps extends React.ComponentProps<"img"> {
  /**
   * Alternative text for the QR code image.
   * @default "QR Code"
   */
  alt?: string;

  /**
   * Whether to render as a child component.
   * @default false
   */
  asChild?: boolean;
}

function QRCodeImage(props: QRCodeImageProps) {
  const { alt = "QR Code", asChild, className, ...imageProps } = props;
  const { dataUrl, size } = useQRCodeContext();

  const ImagePrimitive = asChild ? Slot : "img";

  if (!dataUrl) {
    return null;
  }

  return (
    <ImagePrimitive
      src={dataUrl}
      alt={alt}
      width={size}
      height={size}
      className={cn("qr-code-image", className)}
      {...imageProps}
    />
  );
}

interface QRCodeCanvasProps extends React.ComponentProps<"canvas"> {
  /**
   * Whether to render as a child component.
   * @default false
   */
  asChild?: boolean;
}

function QRCodeCanvas(props: QRCodeCanvasProps) {
  const { asChild, className, ...canvasProps } = props;
  const { canvasRef, size } = useQRCodeContext();

  const CanvasPrimitive = asChild ? Slot : "canvas";

  return (
    <CanvasPrimitive
      ref={canvasRef}
      width={size}
      height={size}
      className={cn("qr-code-canvas", className)}
      {...canvasProps}
    />
  );
}

interface QRCodeSvgProps extends React.ComponentProps<"div"> {
  /**
   * Whether to render as a child component.
   * @default false
   */
  asChild?: boolean;
}

function QRCodeSvg(props: QRCodeSvgProps) {
  const { asChild, className, ...svgProps } = props;
  const { svgString, size } = useQRCodeContext();

  const SvgPrimitive = asChild ? Slot : "div";

  if (!svgString) {
    return null;
  }

  return (
    <SvgPrimitive
      className={cn("qr-code-svg", className)}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgString }}
      {...svgProps}
    />
  );
}

interface QRCodeDownloadProps extends React.ComponentProps<"button"> {
  /**
   * The filename for the downloaded QR code.
   * @default "qrcode"
   */
  filename?: string;

  /**
   * The file format for download.
   * @default "png"
   */
  format?: "png" | "svg";

  /**
   * Whether to render as a child component.
   * @default false
   */
  asChild?: boolean;
}

function QRCodeDownload(props: QRCodeDownloadProps) {
  const {
    filename = "qrcode",
    format = "png",
    asChild,
    className,
    onClick,
    children,
    ...buttonProps
  } = props;
  const { dataUrl, svgString } = useQRCodeContext();

  const handleDownload = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

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
    [dataUrl, svgString, filename, format, onClick],
  );

  const ButtonPrimitive = asChild ? Slot : "button";

  return (
    <ButtonPrimitive
      type="button"
      onClick={handleDownload}
      className={cn("qr-code-download", className)}
      {...buttonProps}
    >
      {children || `Download ${format.toUpperCase()}`}
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
  type QRCodeRootProps as QRCodeProps,
};
