"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { RootProvider, type RootProviderProps } from "fumadocs-ui/provider";

interface ProvidersProps extends RootProviderProps {
  children: React.ReactNode;
}

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <RootProvider {...props}>
      <TooltipProvider>{children}</TooltipProvider>
    </RootProvider>
  );
}
