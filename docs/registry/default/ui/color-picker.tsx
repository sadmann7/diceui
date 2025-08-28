"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/default/components/visually-hidden-input";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Slot } from "@radix-ui/react-slot";
import { PipetteIcon } from "lucide-react";
import * as React from "react";

/**
 * @see https://gist.github.com/bkrmendy/f4582173f50fab209ddfef1377ab31e3
 */
interface EyeDropper {
  open: (options?: {
    signal?: AbortSignal;
  }) => Promise<{ sRGBHex: string }>;
}

declare global {
  interface Window {
    EyeDropper?: {
      new (): EyeDropper;
    };
  }
}

const colorFormats = ["hex", "rgb", "hsl", "hsb"] as const;
type ColorFormat = (typeof colorFormats)[number];

interface ColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface HSVColorValue {
  h: number;
  s: number;
  v: number;
  a: number;
}

function hexToRgb(hex: string, alpha?: number): ColorValue {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1] ?? "0", 16),
        g: Number.parseInt(result[2] ?? "0", 16),
        b: Number.parseInt(result[3] ?? "0", 16),
        a: alpha ?? 1,
      }
    : { r: 0, g: 0, b: 0, a: alpha ?? 1 };
}

function rgbToHex(color: ColorValue): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

function rgbToHsv(color: ColorValue): HSVColorValue {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff) % 6;
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  return {
    h,
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a: color.a,
  };
}

function hsvToRgb(hsv: HSVColorValue): ColorValue {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r: number;
  let g: number;
  let b: number;

  switch (i % 6) {
    case 0: {
      r = v;
      g = t;
      b = p;
      break;
    }
    case 1: {
      r = q;
      g = v;
      b = p;
      break;
    }
    case 2: {
      r = p;
      g = v;
      b = t;
      break;
    }
    case 3: {
      r = p;
      g = q;
      b = v;
      break;
    }
    case 4: {
      r = t;
      g = p;
      b = v;
      break;
    }
    case 5: {
      r = v;
      g = p;
      b = q;
      break;
    }
    default: {
      r = 0;
      g = 0;
      b = 0;
    }
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsv.a,
  };
}

function colorToString(color: ColorValue, format: ColorFormat = "hex"): string {
  switch (format) {
    case "hex":
      return rgbToHex(color);
    case "rgb":
      return color.a < 1
        ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
        : `rgb(${color.r}, ${color.g}, ${color.b})`;
    case "hsl": {
      const hsl = rgbToHsl(color);
      return color.a < 1
        ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${color.a})`
        : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    case "hsb": {
      const hsv = rgbToHsv(color);
      return color.a < 1
        ? `hsba(${hsv.h}, ${hsv.s}%, ${hsv.v}%, ${color.a})`
        : `hsb(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
    }
    default:
      return rgbToHex(color);
  }
}

function rgbToHsl(color: ColorValue) {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;

  const l = sum / 2;

  let h = 0;
  let s = 0;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum;

    if (max === r) {
      h = (g - b) / diff + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else if (max === b) {
      h = (r - g) / diff + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(
  hsl: { h: number; s: number; l: number },
  alpha = 1,
): ColorValue {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 1 / 6 && h < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 2 / 6 && h < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 3 / 6 && h < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 4 / 6 && h < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 5 / 6 && h < 1) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: alpha,
  };
}

function parseColorString(value: string): ColorValue | null {
  const trimmed = value.trim();

  // Parse hex colors
  if (trimmed.startsWith("#")) {
    const hexMatch = trimmed.match(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/);
    if (hexMatch) {
      return hexToRgb(trimmed);
    }
  }

  // Parse rgb/rgba colors
  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/,
  );
  if (rgbMatch) {
    return {
      r: Number.parseInt(rgbMatch[1] ?? "0", 10),
      g: Number.parseInt(rgbMatch[2] ?? "0", 10),
      b: Number.parseInt(rgbMatch[3] ?? "0", 10),
      a: rgbMatch[4] ? Number.parseFloat(rgbMatch[4]) : 1,
    };
  }

  // Parse hsl/hsla colors
  const hslMatch = trimmed.match(
    /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)$/,
  );
  if (hslMatch) {
    const h = Number.parseInt(hslMatch[1] ?? "0", 10);
    const s = Number.parseInt(hslMatch[2] ?? "0", 10) / 100;
    const l = Number.parseInt(hslMatch[3] ?? "0", 10) / 100;
    const a = hslMatch[4] ? Number.parseFloat(hslMatch[4]) : 1;

    // Convert HSL to RGB
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (h >= 300 && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
      a,
    };
  }

  // Parse hsb/hsba colors
  const hsbMatch = trimmed.match(
    /^hsba?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)$/,
  );
  if (hsbMatch) {
    const h = Number.parseInt(hsbMatch[1] ?? "0", 10);
    const s = Number.parseInt(hsbMatch[2] ?? "0", 10);
    const v = Number.parseInt(hsbMatch[3] ?? "0", 10);
    const a = hsbMatch[4] ? Number.parseFloat(hsbMatch[4]) : 1;

    return hsvToRgb({ h, s, v, a });
  }

  return null;
}

type Direction = "ltr" | "rtl";

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

interface ColorPickerStoreState {
  color: ColorValue;
  hsv: HSVColorValue;
  open: boolean;
  format: ColorFormat;
}

interface ColorPickerStoreCallbacks {
  onColorChange?: (colorString: string) => void;
  onOpenChange?: (open: boolean) => void;
  onFormatChange?: (format: ColorFormat) => void;
}

interface ColorPickerStore {
  subscribe: (cb: () => void) => () => void;
  getState: () => ColorPickerStoreState;
  setColor: (value: ColorValue) => void;
  setHsv: (value: HSVColorValue) => void;
  setOpen: (value: boolean) => void;
  setFormat: (value: ColorFormat) => void;
  notify: () => void;
}

function createColorPickerStore(
  listenersRef: React.RefObject<Set<() => void>>,
  stateRef: React.RefObject<ColorPickerStoreState>,
  callbacks?: ColorPickerStoreCallbacks,
): ColorPickerStore {
  const store: ColorPickerStore = {
    subscribe: (cb) => {
      if (listenersRef.current) {
        listenersRef.current.add(cb);
        return () => listenersRef.current?.delete(cb);
      }
      return () => {};
    },
    getState: () =>
      stateRef.current || {
        color: { r: 0, g: 0, b: 0, a: 1 },
        hsv: { h: 0, s: 0, v: 0, a: 1 },
        open: false,
        format: "hex" as ColorFormat,
      },
    setColor: (value: ColorValue) => {
      if (!stateRef.current) return;
      if (Object.is(stateRef.current.color, value)) return;

      const prevState = { ...stateRef.current };
      stateRef.current.color = value;

      if (callbacks?.onColorChange) {
        const colorString = colorToString(value, prevState.format);
        callbacks.onColorChange(colorString);
      }

      store.notify();
    },
    setHsv: (value: HSVColorValue) => {
      if (!stateRef.current) return;
      if (Object.is(stateRef.current.hsv, value)) return;

      const prevState = { ...stateRef.current };
      stateRef.current.hsv = value;

      if (callbacks?.onColorChange) {
        const colorValue = hsvToRgb(value);
        const colorString = colorToString(colorValue, prevState.format);
        callbacks.onColorChange(colorString);
      }

      store.notify();
    },
    setOpen: (value: boolean) => {
      if (!stateRef.current) return;
      if (Object.is(stateRef.current.open, value)) return;

      stateRef.current.open = value;

      if (callbacks?.onOpenChange) {
        callbacks.onOpenChange(value);
      }

      store.notify();
    },
    setFormat: (value: ColorFormat) => {
      if (!stateRef.current) return;
      if (Object.is(stateRef.current.format, value)) return;

      stateRef.current.format = value;

      if (callbacks?.onFormatChange) {
        callbacks.onFormatChange(value);
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

function useColorPickerStoreContext(consumerName: string) {
  const context = React.useContext(ColorPickerStoreContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`ColorPickerRoot\``,
    );
  }
  return context;
}

function useColorPickerStore<U>(
  selector: (state: ColorPickerStoreState) => U,
): U {
  const store = useColorPickerStoreContext("useColorPickerStoreSelector");

  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface ColorPickerContextValue {
  dir: Direction;
  disabled?: boolean;
  inline?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

const ColorPickerStoreContext = React.createContext<ColorPickerStore | null>(
  null,
);
const ColorPickerContext = React.createContext<ColorPickerContextValue | null>(
  null,
);

function useColorPickerContext(consumerName: string) {
  const context = React.useContext(ColorPickerContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`ColorPickerRoot\``,
    );
  }
  return context;
}

interface ColorPickerRootProps
  extends Omit<React.ComponentProps<"div">, "onValueChange">,
    Pick<
      React.ComponentProps<typeof Popover>,
      "defaultOpen" | "open" | "onOpenChange" | "modal"
    > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  dir?: Direction;
  format?: ColorFormat;
  defaultFormat?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  name?: string;
  asChild?: boolean;
  disabled?: boolean;
  inline?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

function ColorPickerRoot(props: ColorPickerRootProps) {
  const {
    value: valueProp,
    defaultValue = "#000000",
    onValueChange,
    dir: dirProp,
    format: formatProp,
    defaultFormat = "hex",
    onFormatChange,
    defaultOpen,
    open: openProp,
    onOpenChange,
    name,
    disabled,
    inline,
    readOnly,
    required,
    ...rootProps
  } = props;

  const initialColor = React.useMemo(() => {
    const colorString = valueProp ?? defaultValue;
    const color = hexToRgb(colorString);

    return {
      color,
      hsv: rgbToHsv(color),
      open: openProp ?? defaultOpen ?? false,
      format: formatProp ?? defaultFormat,
    };
  }, [
    valueProp,
    defaultValue,
    formatProp,
    defaultFormat,
    openProp,
    defaultOpen,
  ]);

  const stateRef = useLazyRef(() => initialColor);
  const listenersRef = useLazyRef(() => new Set<() => void>());

  const storeCallbacks = React.useMemo<ColorPickerStoreCallbacks>(
    () => ({
      onColorChange: onValueChange,
      onOpenChange: onOpenChange,
      onFormatChange: onFormatChange,
    }),
    [onValueChange, onOpenChange, onFormatChange],
  );

  const store = React.useMemo(
    () => createColorPickerStore(listenersRef, stateRef, storeCallbacks),
    [listenersRef, stateRef, storeCallbacks],
  );

  return (
    <ColorPickerStoreContext.Provider value={store}>
      <ColorPickerRootImpl
        {...rootProps}
        value={valueProp}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        dir={dirProp}
        format={formatProp}
        defaultFormat={defaultFormat}
        onFormatChange={onFormatChange}
        defaultOpen={defaultOpen}
        open={openProp}
        onOpenChange={onOpenChange}
        name={name}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        inline={inline}
      />
    </ColorPickerStoreContext.Provider>
  );
}

function ColorPickerRootImpl(props: ColorPickerRootProps) {
  const {
    value: valueProp,
    defaultValue = "#000000",
    onValueChange,
    dir: dirProp,
    format: formatProp,
    defaultFormat = "hex",
    onFormatChange,
    defaultOpen,
    open: openProp,
    onOpenChange,
    name,
    ref,
    asChild,
    disabled,
    readOnly,
    required,
    modal,
    inline,
    ...rootProps
  } = props;

  const store = useColorPickerStoreContext("ColorPickerRootImpl");

  const dir = useDirection(dirProp);

  const [formTrigger, setFormTrigger] = React.useState<HTMLDivElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, (node) => setFormTrigger(node));

  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  React.useEffect(() => {
    if (valueProp !== undefined) {
      const currentState = store.getState();
      const color = hexToRgb(valueProp, currentState.color.a);
      const hsv = rgbToHsv(color);
      store.setColor(color);
      store.setHsv(hsv);
    }
  }, [valueProp, store]);

  React.useEffect(() => {
    if (openProp !== undefined) {
      store.setOpen(openProp);
    }
  }, [openProp, store]);

  const contextValue = React.useMemo<ColorPickerContextValue>(
    () => ({
      dir,
      disabled,
      readOnly,
      required,
      inline,
    }),
    [dir, disabled, readOnly, required, inline],
  );

  const open = useColorPickerStore((state) => state.open);

  const onPopoverOpenChange = (newOpen: boolean) => {
    store.setOpen(newOpen);
  };

  const RootPrimitive = asChild ? Slot : "div";

  const currentValue = useColorPickerStore((state) => {
    const color = state.color;
    return rgbToHex(color);
  });

  if (inline) {
    return (
      <ColorPickerContext.Provider value={contextValue}>
        <RootPrimitive {...rootProps} ref={composedRef} />
        {isFormControl && (
          <VisuallyHiddenInput
            type="hidden"
            control={formTrigger}
            name={name}
            value={currentValue}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
          />
        )}
      </ColorPickerContext.Provider>
    );
  }

  return (
    <ColorPickerContext.Provider value={contextValue}>
      <Popover
        defaultOpen={defaultOpen}
        open={open}
        onOpenChange={onPopoverOpenChange}
        modal={modal}
      >
        <RootPrimitive {...rootProps} ref={composedRef} />
        {isFormControl && (
          <VisuallyHiddenInput
            type="hidden"
            control={formTrigger}
            name={name}
            value={currentValue}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
          />
        )}
      </Popover>
    </ColorPickerContext.Provider>
  );
}

interface ColorPickerTriggerProps
  extends React.ComponentProps<typeof PopoverTrigger> {
  asChild?: boolean;
}

function ColorPickerTrigger(props: ColorPickerTriggerProps) {
  const { asChild, ...triggerProps } = props;
  const context = useColorPickerContext("ColorPickerTrigger");

  const TriggerPrimitive = asChild ? Slot : Button;

  return (
    <PopoverTrigger asChild disabled={context.disabled}>
      <TriggerPrimitive {...triggerProps} />
    </PopoverTrigger>
  );
}

interface ColorPickerContentProps
  extends React.ComponentProps<typeof PopoverContent> {
  asChild?: boolean;
}

function ColorPickerContent(props: ColorPickerContentProps) {
  const { asChild, className, children, ...popoverContentProps } = props;
  const context = useColorPickerContext("ColorPickerContent");

  if (context.inline) {
    const ContentPrimitive = asChild ? Slot : "div";
    return (
      <ContentPrimitive
        className={cn("flex w-80 flex-col gap-4 p-4", className)}
        {...popoverContentProps}
      >
        {children}
      </ContentPrimitive>
    );
  }

  return (
    <PopoverContent
      className={cn("flex w-80 flex-col gap-4 p-4", className)}
      {...popoverContentProps}
    >
      {children}
    </PopoverContent>
  );
}

interface ColorPickerAreaProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function ColorPickerArea(props: ColorPickerAreaProps) {
  const { asChild, className, ...areaProps } = props;
  const context = useColorPickerContext("ColorPickerArea");
  const store = useColorPickerStoreContext("ColorPickerArea");

  const hsv = useColorPickerStore((state) => state.hsv);
  const areaRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);

  const updateColorFromPosition = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!areaRef.current) return;

      const rect = areaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(
        0,
        Math.min(1, 1 - (clientY - rect.top) / rect.height),
      );

      const newHsv: HSVColorValue = {
        h: hsv?.h ?? 0,
        s: Math.round(x * 100),
        v: Math.round(y * 100),
        a: hsv?.a ?? 1,
      };

      store.setHsv(newHsv);
      store.setColor(hsvToRgb(newHsv));
    },
    [hsv, store],
  );

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (context.disabled) return;

      isDragging.current = true;
      areaRef.current?.setPointerCapture(event.pointerId);
      updateColorFromPosition(event.clientX, event.clientY);
    },
    [context.disabled, updateColorFromPosition],
  );

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent) => {
      if (isDragging.current) {
        updateColorFromPosition(event.clientX, event.clientY);
      }
    },
    [updateColorFromPosition],
  );

  const onPointerUp = React.useCallback((event: React.PointerEvent) => {
    isDragging.current = false;
    areaRef.current?.releasePointerCapture(event.pointerId);
  }, []);

  const hue = hsv?.h ?? 0;
  const backgroundHue = hsvToRgb({ h: hue, s: 100, v: 100, a: 1 });

  const AreaPrimitive = asChild ? Slot : "div";

  return (
    <AreaPrimitive
      ref={areaRef}
      className={cn(
        "relative h-32 w-full cursor-crosshair touch-none rounded-sm border",
        context.disabled && "pointer-events-none opacity-50",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      {...areaProps}
    >
      <div className="absolute inset-0 overflow-hidden rounded-sm">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgb(${backgroundHue.r}, ${backgroundHue.g}, ${backgroundHue.b})`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, #fff, transparent)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent, #000)",
          }}
        />
      </div>
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute h-3 w-3 rounded-full border-2 border-white shadow-sm"
        style={{
          left: `${hsv?.s ?? 0}%`,
          top: `${100 - (hsv?.v ?? 0)}%`,
        }}
      />
    </AreaPrimitive>
  );
}

interface ColorPickerHueSliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  asChild?: boolean;
}

function ColorPickerHueSlider(props: ColorPickerHueSliderProps) {
  const { asChild, className, ...sliderProps } = props;
  const context = useColorPickerContext("ColorPickerHueSlider");
  const store = useColorPickerStoreContext("ColorPickerHueSlider");

  const hsv = useColorPickerStore((state) => state.hsv);

  const onValueChange = React.useCallback(
    (values: number[]) => {
      const newHsv: HSVColorValue = {
        h: values[0] ?? 0,
        s: hsv?.s ?? 0,
        v: hsv?.v ?? 0,
        a: hsv?.a ?? 1,
      };
      store.setHsv(newHsv);
      store.setColor(hsvToRgb(newHsv));
    },
    [hsv, store],
  );

  return (
    <SliderPrimitive.Root
      value={[hsv?.h ?? 0]}
      onValueChange={onValueChange}
      max={360}
      step={1}
      disabled={context.disabled}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...sliderProps}
    >
      <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-red-500 via-blue-500 via-cyan-500 via-green-500 via-purple-500 via-yellow-500 to-red-500">
        <SliderPrimitive.Range className="absolute h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
}

interface ColorPickerAlphaSliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  asChild?: boolean;
}

function ColorPickerAlphaSlider(props: ColorPickerAlphaSliderProps) {
  const { asChild, className, ...sliderProps } = props;
  const context = useColorPickerContext("ColorPickerAlphaSlider");
  const store = useColorPickerStoreContext("ColorPickerAlphaSlider");

  const color = useColorPickerStore((state) => state.color);
  const hsv = useColorPickerStore((state) => state.hsv);

  const onValueChange = React.useCallback(
    (values: number[]) => {
      const alpha = (values[0] ?? 0) / 100;
      const newColor = { ...color, a: alpha };
      const newHsv = { ...hsv, a: alpha };
      store.setColor(newColor);
      store.setHsv(newHsv);
    },
    [color, hsv, store],
  );

  const gradientColor = `rgb(${color?.r ?? 0}, ${color?.g ?? 0}, ${color?.b ?? 0})`;

  return (
    <SliderPrimitive.Root
      value={[Math.round((color?.a ?? 1) * 100)]}
      onValueChange={onValueChange}
      max={100}
      step={1}
      disabled={context.disabled}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...sliderProps}
    >
      <SliderPrimitive.Track
        className="relative h-3 w-full grow overflow-hidden rounded-full"
        style={{
          background:
            "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
          backgroundSize: "8px 8px",
          backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, ${gradientColor})`,
          }}
        />
        <SliderPrimitive.Range className="absolute h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
}

interface ColorPickerSwatchProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function ColorPickerSwatch(props: ColorPickerSwatchProps) {
  const { asChild, className, ...swatchProps } = props;
  const context = useColorPickerContext("ColorPickerSwatch");

  const color = useColorPickerStore((state) => state.color);
  const format = useColorPickerStore((state) => state.format);

  const backgroundStyle = React.useMemo(() => {
    if (!color) {
      return {
        background:
          "linear-gradient(to bottom right, transparent calc(50% - 1px), hsl(var(--destructive)) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)) no-repeat",
      };
    }

    const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;

    if (color.a < 1) {
      return {
        background: `linear-gradient(${colorString}, ${colorString}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0% 50% / 8px 8px`,
      };
    }

    return {
      backgroundColor: colorString,
    };
  }, [color]);

  const ariaLabel = !color
    ? "No color selected"
    : `Current color: ${colorToString(color, format)}`;

  const SwatchPrimitive = asChild ? Slot : "div";

  return (
    <SwatchPrimitive
      role={asChild ? undefined : "img"}
      aria-label={ariaLabel}
      className={cn(
        "box-border size-8 rounded-sm border shadow-sm",
        context.disabled && "opacity-50",
        className,
      )}
      style={{
        ...backgroundStyle,
        forcedColorAdjust: "none",
      }}
      {...swatchProps}
    />
  );
}

interface ColorPickerEyeDropperProps
  extends React.ComponentProps<typeof Button> {
  asChild?: boolean;
}

function ColorPickerEyeDropper(props: ColorPickerEyeDropperProps) {
  const { asChild, children, size, ...buttonProps } = props;
  const context = useColorPickerContext("ColorPickerEyeDropper");
  const store = useColorPickerStoreContext("ColorPickerEyeDropper");

  const color = useColorPickerStore((state) => state.color);

  const onEyeDropper = React.useCallback(async () => {
    if (!window.EyeDropper) return;

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();

      if (result.sRGBHex) {
        const currentAlpha = color?.a ?? 1;
        const newColor = hexToRgb(result.sRGBHex, currentAlpha);
        const newHsv = rgbToHsv(newColor);
        store.setColor(newColor);
        store.setHsv(newHsv);
      }
    } catch (error) {
      console.warn("EyeDropper error:", error);
    }
  }, [color, store]);

  const hasEyeDropper = typeof window !== "undefined" && !!window.EyeDropper;

  if (!hasEyeDropper) return null;

  const buttonSize = size ?? (children ? "default" : "icon");

  return (
    <Button
      variant="outline"
      size={buttonSize}
      onClick={onEyeDropper}
      disabled={context.disabled}
      {...buttonProps}
    >
      {children ?? <PipetteIcon />}
    </Button>
  );
}

interface ColorPickerFormatSelectProps
  extends Omit<React.ComponentProps<typeof Select>, "value" | "onValueChange">,
    Pick<React.ComponentProps<typeof SelectTrigger>, "size"> {}

function ColorPickerFormatSelect(props: ColorPickerFormatSelectProps) {
  const { size, ...selectProps } = props;
  const context = useColorPickerContext("ColorPickerFormatSelector");
  const store = useColorPickerStoreContext("ColorPickerFormatSelector");

  const format = useColorPickerStore((state) => state.format);

  const onFormatChange = React.useCallback(
    (value: ColorFormat) => {
      store.setFormat(value);
    },
    [store],
  );

  return (
    <Select
      value={format}
      onValueChange={onFormatChange}
      disabled={context.disabled}
      {...selectProps}
    >
      <SelectTrigger size={size ?? "sm"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {colorFormats.map((format) => (
          <SelectItem key={format} value={format}>
            {format.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface ColorPickerInputProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "value" | "onChange" | "color"
  > {
  withoutAlpha?: boolean;
}

function ColorPickerInput(props: ColorPickerInputProps) {
  const context = useColorPickerContext("ColorPickerInput");
  const store = useColorPickerStoreContext("ColorPickerInput");

  const color = useColorPickerStore((state) => state.color);
  const format = useColorPickerStore((state) => state.format);
  const hsv = useColorPickerStore((state) => state.hsv);

  const onColorChange = React.useCallback(
    (newColor: ColorValue) => {
      const newHsv = rgbToHsv(newColor);
      store.setColor(newColor);
      store.setHsv(newHsv);
    },
    [store],
  );

  if (format === "hex") {
    return (
      <HexInput
        color={color}
        onColorChange={onColorChange}
        context={context}
        {...props}
      />
    );
  }

  if (format === "rgb") {
    return (
      <RgbInput
        color={color}
        onColorChange={onColorChange}
        context={context}
        {...props}
      />
    );
  }

  if (format === "hsl") {
    return (
      <HslInput
        color={color}
        onColorChange={onColorChange}
        context={context}
        {...props}
      />
    );
  }

  if (format === "hsb") {
    return (
      <HsbInput
        hsv={hsv}
        onColorChange={onColorChange}
        context={context}
        {...props}
      />
    );
  }
}

interface FormatInputProps extends ColorPickerInputProps {
  color: ColorValue;
  onColorChange: (color: ColorValue) => void;
  context: ColorPickerContextValue;
}

function HexInput(props: FormatInputProps) {
  const {
    color,
    onColorChange,
    context,
    withoutAlpha,
    className,
    ...inputProps
  } = props;

  const hexValue = rgbToHex(color);
  const alphaValue = Math.round((color?.a ?? 1) * 100);

  const onHexChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const parsedColor = parseColorString(value);
      if (parsedColor) {
        onColorChange({ ...parsedColor, a: color?.a ?? 1 });
      }
    },
    [color, onColorChange],
  );

  const onAlphaChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isNaN(value) && value >= 0 && value <= 100) {
        onColorChange({ ...color, a: value / 100 });
      }
    },
    [color, onColorChange],
  );

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        aria-label="Hex color value"
        placeholder="#000000"
        className="h-8 font-mono"
        value={hexValue}
        onChange={onHexChange}
        disabled={context.disabled}
        {...inputProps}
      />
      {!withoutAlpha && (
        <Input
          aria-label="Alpha transparency percentage"
          placeholder="100"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          max="100"
          className="h-8 w-14"
          value={alphaValue}
          onChange={onAlphaChange}
          disabled={context.disabled}
          {...inputProps}
        />
      )}
    </div>
  );
}

function RgbInput(props: FormatInputProps) {
  const {
    color,
    onColorChange,
    context,
    withoutAlpha,
    className,
    ...inputProps
  } = props;

  const rValue = Math.round(color?.r ?? 0);
  const gValue = Math.round(color?.g ?? 0);
  const bValue = Math.round(color?.b ?? 0);
  const alphaValue = Math.round((color?.a ?? 1) * 100);

  const onChannelChange = React.useCallback(
    (channel: "r" | "g" | "b" | "a", max: number, isAlpha = false) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(event.target.value, 10);
        if (!Number.isNaN(value) && value >= 0 && value <= max) {
          const newValue = isAlpha ? value / 100 : value;
          onColorChange({ ...color, [channel]: newValue });
        }
      },
    [color, onColorChange],
  );

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        aria-label="Red color component (0-255)"
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="255"
        className="h-8 w-14"
        value={rValue}
        onChange={onChannelChange("r", 255)}
        disabled={context.disabled}
        {...inputProps}
      />
      <Input
        aria-label="Green color component (0-255)"
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="255"
        className="h-8 w-14"
        value={gValue}
        onChange={onChannelChange("g", 255)}
        disabled={context.disabled}
        {...inputProps}
      />
      <Input
        aria-label="Blue color component (0-255)"
        placeholder="0"
        value={bValue}
        onChange={onChannelChange("b", 255)}
        disabled={context.disabled}
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="255"
        className="h-8 w-14"
        {...inputProps}
      />
      {!withoutAlpha && (
        <Input
          aria-label="Alpha transparency percentage"
          placeholder="100"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          max="100"
          className="h-8 w-14"
          value={alphaValue}
          onChange={onChannelChange("a", 100, true)}
          disabled={context.disabled}
          {...inputProps}
        />
      )}
    </div>
  );
}

function HslInput(props: FormatInputProps) {
  const {
    color,
    onColorChange,
    context,
    withoutAlpha,
    className,
    ...inputProps
  } = props;

  const hsl = React.useMemo(() => rgbToHsl(color), [color]);
  const alphaValue = Math.round((color?.a ?? 1) * 100);

  const onHslChannelChange = React.useCallback(
    (channel: "h" | "s" | "l", max: number) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(event.target.value, 10);
        if (!Number.isNaN(value) && value >= 0 && value <= max) {
          const newHsl = { ...hsl, [channel]: value };
          const newColor = hslToRgb(newHsl, color?.a ?? 1);
          onColorChange(newColor);
        }
      },
    [hsl, color, onColorChange],
  );

  const onAlphaChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isNaN(value) && value >= 0 && value <= 100) {
        onColorChange({ ...color, a: value / 100 });
      }
    },
    [color, onColorChange],
  );

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        aria-label="Hue degree (0-360)"
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="360"
        className="h-8 w-14"
        value={hsl.h}
        onChange={onHslChannelChange("h", 360)}
        disabled={context.disabled}
        {...inputProps}
      />
      <Input
        aria-label="Saturation percentage (0-100)"
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="100"
        className="h-8 w-14"
        value={hsl.s}
        onChange={onHslChannelChange("s", 100)}
        disabled={context.disabled}
        {...inputProps}
      />
      <Input
        aria-label="Lightness percentage (0-100)"
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="100"
        className="h-8 w-14"
        value={hsl.l}
        onChange={onHslChannelChange("l", 100)}
        disabled={context.disabled}
        {...inputProps}
      />
      {!withoutAlpha && (
        <Input
          aria-label="Alpha transparency percentage"
          placeholder="100"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          max="100"
          className="h-8 w-14"
          value={alphaValue}
          onChange={onAlphaChange}
          disabled={context.disabled}
          {...inputProps}
        />
      )}
    </div>
  );
}

interface HsbInputProps extends Omit<FormatInputProps, "color"> {
  hsv: HSVColorValue;
}

function HsbInput(props: HsbInputProps) {
  const {
    hsv,
    onColorChange,
    context,
    withoutAlpha,
    className,
    ...inputProps
  } = props;

  const alphaValue = Math.round((hsv?.a ?? 1) * 100);

  const onHsvChannelChange = React.useCallback(
    (channel: "h" | "s" | "v", max: number) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(event.target.value, 10);
        if (!Number.isNaN(value) && value >= 0 && value <= max) {
          const newHsv = { ...hsv, [channel]: value };
          const newColor = hsvToRgb(newHsv);
          onColorChange(newColor);
        }
      },
    [hsv, onColorChange],
  );

  const onAlphaChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isNaN(value) && value >= 0 && value <= 100) {
        const currentColor = hsvToRgb(hsv);
        onColorChange({ ...currentColor, a: value / 100 });
      }
    },
    [hsv, onColorChange],
  );

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        aria-label="Hue degree (0-360)"
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="360"
        className="h-8 w-14"
        value={hsv?.h ?? 0}
        onChange={onHsvChannelChange("h", 360)}
        disabled={context.disabled}
        {...inputProps}
      />
      <Input
        aria-label="Saturation percentage (0-100)"
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="100"
        className="h-8 w-14"
        value={hsv?.s ?? 0}
        onChange={onHsvChannelChange("s", 100)}
        disabled={context.disabled}
        {...inputProps}
      />
      <Input
        aria-label="Brightness percentage (0-100)"
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="100"
        className="h-8 w-14"
        value={hsv?.v ?? 0}
        onChange={onHsvChannelChange("v", 100)}
        disabled={context.disabled}
        {...inputProps}
      />
      {!withoutAlpha && (
        <Input
          aria-label="Alpha transparency percentage"
          placeholder="100"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          max="100"
          className="h-8 w-14"
          value={alphaValue}
          onChange={onAlphaChange}
          disabled={context.disabled}
          {...inputProps}
        />
      )}
    </div>
  );
}

export {
  ColorPickerRoot as ColorPicker,
  ColorPickerTrigger,
  ColorPickerContent,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerAlphaSlider,
  ColorPickerSwatch,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerInput,
  //
  ColorPickerRoot as Root,
  ColorPickerTrigger as Trigger,
  ColorPickerContent as Content,
  ColorPickerArea as Area,
  ColorPickerHueSlider as HueSlider,
  ColorPickerAlphaSlider as AlphaSlider,
  ColorPickerSwatch as Swatch,
  ColorPickerEyeDropper as EyeDropper,
  ColorPickerFormatSelect as FormatSelect,
  ColorPickerInput as Input,
  //
  useColorPickerStore as useColorPicker,
};
