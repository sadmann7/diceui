import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
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
  bgColor?: string;

  /**
   * The foreground color of the QR code.
   * @default "#000000"
   */
  fgColor?: string;

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
   * Whether to include a quiet zone (border) around the QR code.
   * @default true
   */
  includeMargin?: boolean;

  /**
   * The width of the quiet zone in modules.
   * Only applies when includeMargin is true.
   * @default 4
   */
  marginSize?: number;

  /**
   * The image format to render.
   * @default "image/png"
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
}

export interface ImageProps extends EmptyProps<"img">, CompositionProps {
  /**
   * Alternative text for the QR code image.
   */
  alt?: string;
}

export interface CanvasProps extends EmptyProps<"canvas">, CompositionProps {}

export interface SvgProps extends EmptyProps<"svg">, CompositionProps {}

export interface DownloadProps extends EmptyProps<"button">, CompositionProps {
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
}
