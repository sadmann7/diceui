import type { NextConfig } from "next";

import { createMDX } from "fumadocs-mdx/next";

import { DEFAULT_STYLE_ID, getStyleIds } from "./registry/styles";

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
        destination: "/llms.mdx/docs/:path*/content.md",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Published style ids resolve to their static directory.
      {
        source: `/r/:style(${getStyleIds().join("|")})/:name.json`,
        destination: "/r/styles/:style/:name.json",
      },
      // Bases we don't author (`aria-*`) and legacy v3 ids fall back to the
      // default rather than 404ing on an otherwise valid install.
      {
        source: "/r/:style/:name.json",
        destination: `/r/styles/${DEFAULT_STYLE_ID}/:name.json`,
      },
      // Flat /r/{name}.json → default base (no style in URL).
      {
        source: "/r/:name.json",
        destination: `/r/styles/${DEFAULT_STYLE_ID}/:name.json`,
      },
    ];
  },
  // Already doing typechecking as separate tasks in CI
  typescript: { ignoreBuildErrors: true },
};

export default withMDX(nextConfig);
