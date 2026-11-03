"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import * as React from "react";
import * as ReactDOM from "react-dom";

const fpsVariants = cva("cn-fps", {
  variants: {
    strategy: {
      fixed: "cn-fps-strategy-fixed",
      absolute: "cn-fps-strategy-absolute",
    },
    position: {
      "top-left": "cn-fps-position-top-left",
      "top-right": "cn-fps-position-top-right",
      "bottom-left": "cn-fps-position-bottom-left",
      "bottom-right": "cn-fps-position-bottom-right",
    },
    status: {
      good: "cn-fps-status-good",
      warning: "cn-fps-status-warning",
      error: "cn-fps-status-error",
    },
  },
  defaultVariants: {
    strategy: "fixed",
    position: "top-right",
    status: "good",
  },
});

function subscribe() {
  return () => {};
}

interface FpsProps
  extends
    React.ComponentProps<"div">,
    Omit<VariantProps<typeof fpsVariants>, "status"> {
  label?: string;
  updateInterval?: number;
  warningThreshold?: number;
  errorThreshold?: number;
  portalContainer?: Element | DocumentFragment | null;
  enabled?: boolean;
}

function Fps(props: FpsProps) {
  const {
    strategy = "fixed",
    position = "top-right",
    label,
    updateInterval = 500,
    warningThreshold = 30,
    errorThreshold = 20,
    portalContainer: portalContainerProp,
    enabled = true,
    className,
    ...fpsProps
  } = props;

  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [fps, setFps] = React.useState(0);

  const status = React.useMemo(() => {
    if (fps < errorThreshold) return "error";
    if (fps < warningThreshold) return "warning";
    return "good";
  }, [fps, errorThreshold, warningThreshold]);

  React.useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    let frameCount = 0;
    let lastTime = performance.now();

    function measureFps() {
      const now = performance.now();
      const delta = now - lastTime;
      frameCount += 1;

      if (delta >= updateInterval) {
        setFps(Math.round((frameCount * 1000) / delta));
        frameCount = 0;
        lastTime = now;
      }

      frame = requestAnimationFrame(measureFps);
    }

    frame = requestAnimationFrame(measureFps);

    return () => cancelAnimationFrame(frame);
  }, [enabled, updateInterval]);

  if (!enabled) return null;

  const portalContainer =
    strategy === "absolute"
      ? null
      : (portalContainerProp ?? (mounted ? globalThis.document?.body : null));

  const Comp = (
    <div
      aria-hidden="true"
      data-slot="fps"
      {...fpsProps}
      className={cn(fpsVariants({ strategy, position, status }), className)}
    >
      {label && (
        <span data-slot="fps-label" className="cn-fps-label">
          {label}:
        </span>
      )}
      <span data-slot="fps-value">{fps}</span>
    </div>
  );

  return portalContainer ? ReactDOM.createPortal(Comp, portalContainer) : Comp;
}

export { Fps };
