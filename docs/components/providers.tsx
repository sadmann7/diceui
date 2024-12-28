"use client";

import { ReactScanProvider } from "@/components/react-scan-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RootProvider, type RootProviderProps } from "fumadocs-ui/provider";

interface ProvidersProps extends RootProviderProps {
  children: React.ReactNode;
}

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <RootProvider {...props}>
      <TooltipProvider>
        <ReactScanProvider>{children}</ReactScanProvider>
      </TooltipProvider>
    </RootProvider>
  );
}
