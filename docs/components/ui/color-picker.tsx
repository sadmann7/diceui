"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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

interface ColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface HSVColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

function hexToRgb(hex: string): ColorValue {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1] ?? "0", 16),
        g: Number.parseInt(result[2] ?? "0", 16),
        b: Number.parseInt(result[3] ?? "0", 16),
        a: 1,
      }
    : { r: 0, g: 0, b: 0, a: 1 };
}

function rgbToHex(color: ColorValue): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

function rgbToHsv(color: ColorValue): HSVColor {
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

function hsvToRgb(hsv: HSVColor): ColorValue {
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

function colorToString(
  color: ColorValue,
  format: "hex" | "rgb" | "hsl" = "hex",
): string {
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
  hsv: HSVColor;
  open: boolean;
  format: "hex" | "rgb" | "hsl";
}

interface ColorPickerStoreCallbacks {
  onColorChange?: (colorString: string) => void;
  onOpenChange?: (open: boolean) => void;
}

interface ColorPickerStore {
  subscribe: (cb: () => void) => () => void;
  getState: () => ColorPickerStoreState;
  setColor: (value: ColorValue) => void;
  setHsv: (value: HSVColor) => void;
  setOpen: (value: boolean) => void;
  setFormat: (value: "hex" | "rgb" | "hsl") => void;
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
        format: "hex" as const,
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
    setHsv: (value: HSVColor) => {
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
    setFormat: (value: "hex" | "rgb" | "hsl") => {
      if (!stateRef.current) return;
      if (Object.is(stateRef.current.format, value)) return;

      stateRef.current.format = value;
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
  disabled: boolean;
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
  format?: "hex" | "rgb" | "hsl";
  asChild?: boolean;
  disabled?: boolean;
}

function ColorPickerRoot(props: ColorPickerRootProps) {
  const {
    value: valueProp,
    defaultValue = "#000000",
    onValueChange,
    dir: dirProp,
    format: formatProp = "hex",
    defaultOpen,
    open: openProp,
    onOpenChange,
    disabled = false,
    ...rootProps
  } = props;

  const initialColor = React.useMemo(() => {
    const colorString = valueProp ?? defaultValue;
    const color = hexToRgb(colorString);
    return {
      color,
      hsv: rgbToHsv(color),
      open: openProp ?? defaultOpen ?? false,
      format: formatProp,
    };
  }, [valueProp, defaultValue, formatProp, openProp, defaultOpen]);

  const stateRef = useLazyRef(() => initialColor);
  const listenersRef = useLazyRef(() => new Set<() => void>());

  const storeCallbacks = React.useMemo<ColorPickerStoreCallbacks>(
    () => ({
      onColorChange: onValueChange,
      onOpenChange: onOpenChange,
    }),
    [onValueChange, onOpenChange],
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
        defaultOpen={defaultOpen}
        open={openProp}
        onOpenChange={onOpenChange}
        disabled={disabled}
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
    format: formatProp = "hex",
    defaultOpen,
    open: openProp,
    onOpenChange,
    asChild,
    disabled = false,
    modal,
    ...rootProps
  } = props;

  const store = useColorPickerStoreContext("ColorPickerRootImpl");

  const dir = useDirection(dirProp);

  React.useEffect(() => {
    if (valueProp !== undefined) {
      const color = hexToRgb(valueProp);
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
    }),
    [dir, disabled],
  );

  const open = useColorPickerStore((state) => state.open);

  const onPopoverOpenChange = (newOpen: boolean) => {
    store.setOpen(newOpen);
  };

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <ColorPickerContext.Provider value={contextValue}>
      <Popover
        defaultOpen={defaultOpen}
        open={open}
        onOpenChange={onPopoverOpenChange}
        modal={modal}
      >
        <RootPrimitive {...rootProps} />
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

  return (
    <PopoverContent
      className={cn("flex w-64 flex-col gap-4 p-4", className)}
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

      const newHsv: HSVColor = {
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
      const newHsv: HSVColor = {
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
        background: `linear-gradient(${colorString}, ${colorString}), repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--background)) 0% 50%) 0% 50% / 8px 8px`,
      };
    }

    return {
      backgroundColor: colorString,
    };
  }, [color]);

  const ariaLabel = !color
    ? "No color selected"
    : `Current color: ${colorToString(color, format ?? "hex")}`;

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

interface ColorPickerInputProps extends React.ComponentProps<typeof Input> {
  asChild?: boolean;
}

function ColorPickerInput(props: ColorPickerInputProps) {
  const { asChild, ...inputProps } = props;
  const context = useColorPickerContext("ColorPickerInput");
  const store = useColorPickerStoreContext("ColorPickerInput");

  const color = useColorPickerStore((state) => state.color);
  const format = useColorPickerStore((state) => state.format);

  const [inputValue, setInputValue] = React.useState("");

  const colorString = React.useMemo(() => {
    if (!color) return "#000000";
    return colorToString(color, format ?? "hex");
  }, [color, format]);

  React.useEffect(() => {
    setInputValue(colorString);
  }, [colorString]);

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);

      try {
        if (
          value.startsWith("#") &&
          (value.length === 4 || value.length === 7)
        ) {
          const newColor = hexToRgb(value);
          const newHsv = rgbToHsv(newColor);
          store.setColor(newColor);
          store.setHsv(newHsv);
        }
      } catch {
        // Invalid color, ignore it
      }
    },
    [store],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      event.target.select();
    },
    [],
  );

  return (
    <Input
      placeholder="#000000"
      value={inputValue}
      onChange={onInputChange}
      onFocus={onFocus}
      disabled={context.disabled}
      {...inputProps}
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

  const onEyeDropper = React.useCallback(async () => {
    if (!window.EyeDropper) return;

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();

      if (result.sRGBHex) {
        const newColor = hexToRgb(result.sRGBHex);
        const newHsv = rgbToHsv(newColor);
        store.setColor(newColor);
        store.setHsv(newHsv);
      }
    } catch (error) {
      console.warn("EyeDropper error:", error);
    }
  }, [store]);

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

export {
  ColorPickerRoot as ColorPicker,
  ColorPickerTrigger,
  ColorPickerContent,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerAlphaSlider,
  ColorPickerSwatch,
  ColorPickerInput,
  ColorPickerEyeDropper,
  //
  ColorPickerRoot as Root,
  ColorPickerTrigger as Trigger,
  ColorPickerContent as Content,
  ColorPickerArea as Area,
  ColorPickerHueSlider as HueSlider,
  ColorPickerAlphaSlider as AlphaSlider,
  ColorPickerSwatch as Swatch,
  ColorPickerInput as Input,
  ColorPickerEyeDropper as EyeDropper,
  //
  useColorPickerStore as useColorPicker,
};
