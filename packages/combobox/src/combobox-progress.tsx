import { Primitive, useProgress } from "@diceui/shared";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const PROGRESS_NAME = "ComboboxProgress";

interface ComboboxProgressProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * The current progress value.
   * @default null
   */
  value?: number | null;

  /**
   * The maximum progress value.
   * @default 100
   */
  max?: number;

  /** The accessible label for the progress bar. */
  label?: string;
}

const ComboboxProgress = React.forwardRef<
  HTMLDivElement,
  ComboboxProgressProps
>((props, forwardedRef) => {
  const context = useComboboxContext(PROGRESS_NAME);

  if (!context.open) return null;

  const { value, max, label, ...progressProps } = props;
  const progress = useProgress({ value, max });

  if (progress.state === "complete") return null;

  return (
    <Primitive.div
      aria-label={label}
      {...progress.progressProps}
      {...progressProps}
      ref={forwardedRef}
    />
  );
});

ComboboxProgress.displayName = PROGRESS_NAME;

const Progress = ComboboxProgress;

export { ComboboxProgress, Progress };

export type { ComboboxProgressProps };
