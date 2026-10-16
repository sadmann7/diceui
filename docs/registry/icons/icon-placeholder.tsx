import type * as React from "react";

import { cn } from "cn";
import * as icons from "lucide-react";

interface IconPlaceholderProps extends React.ComponentProps<"svg"> {
  lucide: string;
  tabler?: string;
  hugeicons?: string;
  phosphor?: string;
  remixicon?: string;
}

function IconPlaceholder({
  lucide,
  tabler: _tabler,
  hugeicons: _hugeicons,
  phosphor: _phosphor,
  remixicon: _remixicon,
  className,
  ...props
}: IconPlaceholderProps) {
  const iconsByName = icons as unknown as Record<
    string,
    React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined
  >;
  const Icon = iconsByName[lucide];

  // Expand `cn-*` markers like the CLI does, so `[class*='size-']`
  // selectors see the same classes as an installed icon.
  return Icon ? <Icon className={cn(className)} {...props} /> : null;
}

export { IconPlaceholder };
