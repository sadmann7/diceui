"use client";

import {
  DirectionProvider as GlobalDirectionProvider,
  useDirection,
} from "@radix-ui/react-direction";
import type * as React from "react";

function DirectionProvider(
  props: React.ComponentProps<typeof GlobalDirectionProvider>,
) {
  return <GlobalDirectionProvider {...props} />;
}

export {
  DirectionProvider,
  //
  useDirection,
};
