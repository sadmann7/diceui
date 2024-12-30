"use client";

import { ReactScanProvider } from "@/components/react-scan-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RootProvider, type RootProviderProps } from "fumadocs-ui/provider";
import { Provider as JotaiProvider, createStore } from "jotai";

const store = createStore();

interface ProvidersProps extends RootProviderProps {
  children: React.ReactNode;
}

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <RootProvider {...props}>
      <JotaiProvider store={store}>
        <TooltipProvider>
          <ReactScanProvider>{children}</ReactScanProvider>
        </TooltipProvider>
      </JotaiProvider>
    </RootProvider>
  );
}
