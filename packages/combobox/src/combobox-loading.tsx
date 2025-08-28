import { Primitive, useProgress } from "@diceui/shared";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const LOADING_NAME = "ComboboxLoading";

interface ComboboxLoadingProps
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

const ComboboxLoading = React.forwardRef<HTMLDivElement, ComboboxLoadingProps>(
  (props, forwardedRef) => {
    const context = useComboboxContext(LOADING_NAME);
    const { value, max, label, ...progressProps } = props;
    const progress = useProgress({ value, max });

    if (!context.open) return null;
    if (progress.state === "complete") return null;

    return (
      <Primitive.div
        aria-label={label}
        {...progress.progressProps}
        {...progressProps}
        ref={forwardedRef}
      />
    );
  },
);

ComboboxLoading.displayName = LOADING_NAME;

const Loading = ComboboxLoading;

export { ComboboxLoading, Loading };

export type { ComboboxLoadingProps };
