import type { NextConfig } from "next";

import { createMDX } from "fumadocs-mdx/next";

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
        destination: "/docs/components/base/:name",
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
        destination: "/llms.mdx/docs/:path*/content.md",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/r/:style/:name.json",
        destination: "/r/styles/:style/:name.json",
      },
      {
        source: "/r/:name.json",
        destination: "/r/styles/base-nova/:name.json",
      },
    ];
  },
  // Already doing typechecking as separate tasks in CI
  typescript: { ignoreBuildErrors: true },
};

export default withMDX(nextConfig);
