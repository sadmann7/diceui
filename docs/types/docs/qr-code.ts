import type { CompositionProps, EmptyProps } from "@/types";

export interface QRCodeProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The data to encode in the QR code.
   * @example "https://example.com"
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
  backgroundColor?: string;

  /**
   * The foreground color of the QR code.
   * @default "#000000"
   */
  foregroundColor?: string;

  /**
   * The error correction level.
   *
   * - `L`: Low (~7% correction)
   * - `M`: Medium (~15% correction)
   * - `Q`: Quartile (~25% correction)
   * - `H`: High (~30% correction)
   *
   * @default "M"
   */
  level?: "L" | "M" | "Q" | "H";

  /**
   * The width of the quiet zone in modules.
   *
   * When set to `0`, the quiet zone will be removed.
   *
   * @default 1
   */
  margin?: number;

  /**
   * The quality of the generated image (0-1).
   *
   * Only applies to formats that support quality settings like JPEG and WebP.
   *
   * @default 0.92
   */
  quality?: number;

  /**
   * Callback fired when the QR code fails to generate.
   */
  onError?: (error: Error) => void;

  /**
   * Callback fired when the QR code is successfully generated.
   */
  onGenerated?: () => void;
}

export interface QRCodeImageProps extends EmptyProps<"img">, CompositionProps {
  /**
   * Alternative text for the QR code image.
   *
   * ```ts
   * alt="New QR Code"
   * ```
   *
   * @default "QR Code"
   */
  alt?: string;
}

export interface QRCodeCanvasProps
  extends EmptyProps<"canvas">,
    CompositionProps {}

export interface QRCodeSvgProps extends EmptyProps<"div">, CompositionProps {}

export interface QRCodeOverlayProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface QRCodeSkeletonProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface QRCodeDownloadProps
  extends EmptyProps<"button">,
    CompositionProps {
  /**
   * The filename for the downloaded QR code.
   *
   * @default "qrcode"
   */
  filename?: string;

  /**
   * The file format for download.
   * @default "png"
   */
  format?: "png" | "svg";
}
