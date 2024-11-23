import { siteConfig } from "@/lib/config";
import { fontHeading, fontMono, fontSans } from "@/lib/fonts";
import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata, Viewport } from "next";
import type * as React from "react";
import { twMerge } from "tailwind-merge";

import "@/app/global.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sadmn.com"),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-1e6x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body
        className={twMerge(
          "min-h-screen font-sans antialiased",
          fontHeading.variable,
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
