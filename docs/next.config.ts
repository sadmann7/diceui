import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Use SWC minifier for faster builds with less memory
  swcMinify: true,
  // Disable source maps in production to save memory during build
  productionBrowserSourceMaps: false,
  experimental: {
    webpackMemoryOptimizations: true,
    // Reduce parallelism to save memory
    webpackBuildWorker: true,
    // Optimize CSS handling
    optimizeCss: true,
  },
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
  // Optimize webpack configuration for memory
  webpack: (config) => {
    // Reduce memory usage by limiting parallelism
    config.parallelism = 1;

    // Optimize chunk splitting to reduce memory pressure
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        maxInitialRequests: 5,
        maxAsyncRequests: 5,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Group all node_modules into fewer chunks
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
            name: "vendors",
          },
          // Group registry components separately
          registry: {
            test: /[\\/]__registry__[\\/]/,
            priority: 0,
            reuseExistingChunk: true,
            name: "registry",
          },
        },
      },
    };

    // Reduce cache type to save memory
    config.cache = {
      type: "memory",
      maxGenerations: 1,
    };

    return config;
  },
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/docs/introduction",
        permanent: false,
      },
      {
        source: "/r/:component(data-table.*|data-grid.*)",
        destination: "https://tablecn.com/r/:component.json",
        permanent: true,
      },
      /**
       * @see https://github.com/magicuidesign/magicui/blob/main/next.config.mjs
       */
      {
        source: "/r/index",
        destination: "/r/index.json",
        permanent: true,
      },
      {
        source: "/r/registry",
        destination: "/r/registry.json",
        permanent: true,
      },
      {
        source: "/r/:name((?!index\\.json|registry\\.json|styles/).*)",
        destination: "/r/styles/default/:name.json",
        permanent: true,
        missing: [
          {
            type: "query",
            key: "_redirected",
            value: undefined,
          },
        ],
      },
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/:path*",
        permanent: true,
      },
    ];
  },
  // Already doing linting and typechecking as separate tasks in CI
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default withMDX(nextConfig);
