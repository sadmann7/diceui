"use client";

import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import * as React from "react";
import {
  Gauge,
  GaugeIndicator,
  GaugeLabel,
  GaugeRange,
  GaugeTrack,
  GaugeValueText,
} from "@/registry/bases/radix/ui/gauge";

const sizes = [
  { size: 100, thickness: 6, label: "Small", valueTextClassName: "text-xl" },
  { size: 140, thickness: 10, label: "Medium", valueTextClassName: "text-3xl" },
  { size: 180, thickness: 12, label: "Large", valueTextClassName: "text-4xl" },
] as const;

export default function GaugeSizesDemo() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      {sizes.map((config, index) => (
        <AnimatedGauge key={config.label} config={config} index={index} />
      ))}
    </div>
  );
}

interface AnimatedGaugeProps {
  config: (typeof sizes)[number];
  index: number;
}

function AnimatedGauge({ config, index }: AnimatedGaugeProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 60,
    damping: 15,
    mass: 1,
  });

  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (isInView) {
      const delay = index * 150;
      const timer = setTimeout(() => {
        motionValue.set(68);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isInView, motionValue, index]);

  React.useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });

    return unsubscribe;
  }, [springValue]);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.21, 1.11, 0.81, 0.99],
      }}
    >
      <Gauge
        value={displayValue}
        size={config.size}
        thickness={config.thickness}
      >
        <GaugeIndicator>
          <GaugeTrack />
          <GaugeRange />
        </GaugeIndicator>
        <GaugeValueText className={config.valueTextClassName} />
        <GaugeLabel className="sr-only">{config.label}</GaugeLabel>
      </Gauge>
      <p className="text-muted-foreground text-sm">{config.label}</p>
    </motion.div>
  );
}
