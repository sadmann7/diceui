import type { Metadata, Viewport } from "next";

import Script from "next/script";

import { Providers } from "@/components/providers";
import { ReactScan } from "@/components/react-scan";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { DEFAULT_STYLE } from "@/lib/constants";
import { fontMono, fontSans } from "@/lib/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { getStyleScript } from "@/lib/style";
import { cn } from "@/lib/utils";
import { Toaster } from "@/styles/radix-nova/ui/sonner";
import "@/styles/globals.css";
import "@/styles/registry-styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "react",
    "ui",
    "ui-library",
    "shadcn-ui",
    "accessibility",
    "wai-aria",
  ],
  authors: [
    {
      name: "sadmann7",
      url: "https://www.sadmn.com",
    },
  ],
  creator: "sadmann7",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: "@sadmann17",
  },
  icons: {
    icon: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "isolate min-h-screen font-sans antialiased",
          `style-${DEFAULT_STYLE}`,
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <script dangerouslySetInnerHTML={{ __html: getStyleScript() }} />
        <Script defer src="https://assets.onedollarstats.com/stonks.js" />
        <TailwindIndicator />
        <Toaster />
        <ReactScan />
        <Providers
          theme={{
            attribute: "class",
            defaultTheme: "system",
            enableSystem: true,
            disableTransitionOnChange: true,
          }}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
