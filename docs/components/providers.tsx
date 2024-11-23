"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { RootProvider } from "fumadocs-ui/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </RootProvider>
  );
}
