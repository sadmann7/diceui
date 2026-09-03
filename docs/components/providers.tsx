"use client";

import type { RootProviderProps } from "fumadocs-ui/provider/base";

import { RootProvider } from "fumadocs-ui/provider/next";
import { createStore, Provider as JotaiProvider } from "jotai";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { DocSearchDialog } from "@/components/doc-search-dialog";
import { ThemeShortcut } from "@/components/theme-shortcut";
import { TooltipProvider as BaseTooltipProvider } from "@/registry/bases/base/ui/tooltip";
import { TooltipProvider as RadixTooltipProvider } from "@/registry/bases/radix/ui/tooltip";

const store = createStore();

interface ProvidersProps extends RootProviderProps {
  children: React.ReactNode;
}

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <RootProvider
      {...props}
      search={{
        SearchDialog: DocSearchDialog,
      }}
    >
      <NuqsAdapter>
        <JotaiProvider store={store}>
          <RadixTooltipProvider>
            <BaseTooltipProvider>
              <ThemeShortcut />
              {children}
            </BaseTooltipProvider>
          </RadixTooltipProvider>
        </JotaiProvider>
      </NuqsAdapter>
    </RootProvider>
  );
}
