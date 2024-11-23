import { siteConfig } from "@/config/site";
import { fontHeading, fontMono, fontSans } from "@/lib/fonts";
import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata, Viewport } from "next";
import "@/app/global.css";
import { cn } from "@/lib/utils";
import type * as React from "react";
import { twMerge } from "tailwind-merge";

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

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
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
