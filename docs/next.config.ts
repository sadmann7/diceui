import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: "picsum.photos",
      },
      {
        hostname: "9jxzamsunn.ufs.sh",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/docs/introduction",
        permanent: false,
      },
      {
        source: "/docs/components/:name((?!radix|base)[^/]+)",
        destination: "/docs/components/radix/:name",
        permanent: false,
      },
      {
        source: "/r/:component(data-table.*\\.json|data-grid.*\\.json)",
        destination: "https://tablecn.com/r/:component",
        permanent: true,
      },
      {
        source: "/r/styles",
        destination: "/r/styles/index.json",
        permanent: true,
      },
      {
        source: "/r/index",
        destination: "/r/index.json",
        permanent: true,
      },
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Known styles → serve the matching static directory.
      {
        source: "/r/:style(radix-vega|base-vega)/:name.json",
        destination: "/r/styles/:style/:name.json",
      },
      // Unknown styles (e.g. "new-york", "default") → radix-vega fallback.
      {
        source: "/r/:style/:name.json",
        destination: "/r/styles/radix-vega/:name.json",
      },
      // Flat /r/{name}.json → radix-vega default (no style in URL).
      {
        source: "/r/:name.json",
        destination: "/r/styles/radix-vega/:name.json",
      },
    ];
  },
  // Already doing typechecking as separate tasks in CI
  typescript: { ignoreBuildErrors: true },
};

export default withMDX(nextConfig);
