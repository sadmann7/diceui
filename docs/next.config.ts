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
      // Serve flat registry URLs required by the shadcn registry index.
      // The index lists @diceui with URL https://diceui.com/r/{name}.json,
      // so these rewrites map flat requests to radix-vega as the default style.
      {
        source: "/r/registry.json",
        destination: "/r/styles/radix-vega/registry.json",
      },
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
