"use client";

import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressRange,
  CircularProgressTrack,
  CircularProgressValueText,
} from "@/registry/bases/radix/ui/circular-progress";

const themes = [
  {
    name: "Default",
    trackClass: "text-muted-foreground/20",
    rangeClass: "text-primary",
    textClass: "text-foreground",
  },
  {
    name: "Success",
    trackClass: "text-green-200 dark:text-green-900",
    rangeClass: "text-green-500",
    textClass: "text-green-700 dark:text-green-300",
  },
  {
    name: "Warning",
    trackClass: "text-yellow-200 dark:text-yellow-900",
    rangeClass: "text-yellow-500",
    textClass: "text-yellow-700 dark:text-yellow-300",
  },
  {
    name: "Destructive",
    trackClass: "text-red-200 dark:text-red-900",
    rangeClass: "text-red-500",
    textClass: "text-red-700 dark:text-red-300",
  },
  {
    name: "Purple",
    trackClass: "text-purple-200 dark:text-purple-900",
    rangeClass: "text-purple-500",
    textClass: "text-purple-700 dark:text-purple-300",
  },
  {
    name: "Orange",
    trackClass: "text-orange-200 dark:text-orange-900",
    rangeClass: "text-orange-500",
    textClass: "text-orange-700 dark:text-orange-300",
  },
  {
    name: "Blue",
    trackClass: "text-blue-200 dark:text-blue-900",
    rangeClass: "text-blue-500",
    textClass: "text-blue-700 dark:text-blue-300",
  },
  {
    name: "Pink",
    trackClass: "text-pink-200 dark:text-pink-900",
    rangeClass: "text-pink-500",
    textClass: "text-pink-700 dark:text-pink-300",
  },
];

export default function CircularProgressColorsDemo() {
  return (
    <>
      <div className="hidden grid-cols-4 gap-4 sm:grid">
        {themes.map((theme, index) => (
          <AnimatedCircularProgress
            key={theme.name}
            theme={theme}
            index={index}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:hidden">
        {themes.slice(0, 4).map((theme, index) => (
          <AnimatedCircularProgress
            key={theme.name}
            theme={theme}
            index={index}
          />
        ))}
      </div>
    </>
  );
}

interface AnimatedCircularProgressProps {
  theme: (typeof themes)[0];
  index: number;
}

function AnimatedCircularProgress({
  theme,
  index,
}: AnimatedCircularProgressProps) {
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
        motionValue.set(75);
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
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.21, 1.11, 0.81, 0.99],
      }}
    >
      <CircularProgress value={displayValue} size={80} thickness={6}>
        <CircularProgressIndicator>
          <CircularProgressTrack className={theme.trackClass} />
          <CircularProgressRange className={theme.rangeClass} />
        </CircularProgressIndicator>
        <CircularProgressValueText
          className={cn("font-semibold text-sm", theme.textClass)}
        />
      </CircularProgress>
      <div className="flex flex-col items-center gap-1 text-center">
        <h4 className="font-medium text-sm">{theme.name}</h4>
        <p className="text-muted-foreground text-xs">
          {displayValue}% complete
        </p>
      </div>
    </motion.div>
  );
}
