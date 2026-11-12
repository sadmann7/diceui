/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/use-previous/src/usePrevious.tsx
 */

import * as React from "react";

function usePrevious<T>(value: T) {
  const [state, setState] = React.useState({ value, previous: value });

  if (!Object.is(state.value, value)) {
    setState({ value, previous: state.value });
    return state.value;
  }

  return state.previous;
}

export { usePrevious };
