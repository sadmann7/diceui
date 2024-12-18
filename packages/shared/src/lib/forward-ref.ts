/**
 * @see https://www.totaltypescript.com/forwardref-with-generic-components
 */

import * as React from "react";

type ForwardRefComponent<T, P = {}> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;

function forwardRef<T, P = {}>(
  render: React.ForwardRefRenderFunction<T, React.PropsWithoutRef<P>>,
): ForwardRefComponent<T, P> {
  return React.forwardRef(render);
}

export { forwardRef };

export type { ForwardRefComponent };
