"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { cn } from "@/lib/utils";

const fpsVariants = cva(
  "fixed z-50 flex items-center gap-2 rounded-md bg-black/80 px-3 py-1.5 font-mono text-sm text-white backdrop-blur-sm",
  {
    variants: {
      position: {
        "top-left": "top-4 left-4",
        "top-right": "top-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "bottom-right": "right-4 bottom-4",
      },
      status: {
        good: "text-primary",
        warning: "text-orange-500",
        error: "text-destructive",
      },
    },
    defaultVariants: {
      position: "top-right",
      status: "good",
    },
  },
);

interface FpsProps
  extends React.ComponentProps<"div">,
    Omit<VariantProps<typeof fpsVariants>, "status"> {
  label?: string;
  enabled?: boolean;
  updateInterval?: number;
  warningThreshold?: number;
  errorThreshold?: number;
  portalContainer?: Element | DocumentFragment | null;
}

function Fps(props: FpsProps) {
  const {
    enabled = true,
    updateInterval = 500,
    position = "top-right",
    label,
    warningThreshold = 30,
    errorThreshold = 20,
    portalContainer: portalContainerProp,
    className,
    ...fpsProps
  } = props;

  const labelId = React.useId();
  const [fps, setFps] = React.useState(0);
  const frameCountRef = React.useRef(0);
  const lastTimeRef = React.useRef(performance.now());
  const animationFrameRef = React.useRef<number | null>(null);
  const updateTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [mounted, setMounted] = React.useState(false);
  React.useLayoutEffect(() => setMounted(true), []);

  const status = React.useMemo(() => {
    if (fps < errorThreshold) return "error";
    if (fps < warningThreshold) return "warning";
    return "good";
  }, [fps, errorThreshold, warningThreshold]);

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    function measureFps() {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      frameCountRef.current += 1;

      if (delta >= updateInterval) {
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(measureFps);
    }

    animationFrameRef.current = requestAnimationFrame(measureFps);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (updateTimeoutRef.current !== null) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [enabled, updateInterval]);

  if (!enabled) return null;

  const portalContainer =
    portalContainerProp ?? (mounted ? globalThis.document?.body : null);

  if (!portalContainer) return null;

  return ReactDOM.createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-labelledby={label ? labelId : undefined}
      {...fpsProps}
      className={cn(fpsVariants({ position, status }), className)}
    >
      {label && (
        <span id={labelId} className="text-muted-foreground">
          {label}:
        </span>
      )}
      <span>{fps}</span>
    </div>,
    portalContainer,
  );
}

export { Fps };
