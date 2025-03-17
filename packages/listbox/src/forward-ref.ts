/**
 * @see https://www.totaltypescript.com/forwardref-with-generic-components
 */

import * as React from "react";

type WithForwardedRef<T> = { ref?: React.ForwardedRef<T> };

interface WithDisplayName {
  displayName?: string;
}

interface ForwardRefComponent<T, P = {}>
  extends React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<T> & WithDisplayName
  > {}

function forwardRef<T, P = {}>(
  render: React.ForwardRefRenderFunction<T, React.PropsWithoutRef<P>>,
): ForwardRefComponent<T, P> {
  return Object.assign(
    React.forwardRef(render) as unknown as ForwardRefComponent<T, P>,
    {
      displayName: render.displayName ?? render.name,
    },
  );
}

export { forwardRef };

export type { ForwardRefComponent, WithDisplayName, WithForwardedRef };
