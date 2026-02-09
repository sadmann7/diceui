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
    const componentNames = [
      "action-bar",
      "angle-slider",
      "avatar-group",
      "badge-overflow",
      "checkbox-group",
      "circular-progress",
      "color-picker",
      "color-swatch",
      "combobox",
      "compare-slider",
      "cropper",
      "data-grid",
      "data-table",
      "editable",
      "file-upload",
      "fps",
      "gauge",
      "kanban",
      "kbd",
      "key-value",
      "listbox",
      "marquee",
      "mask-input",
      "masonry",
      "media-player",
      "mention",
      "phone-input",
      "qr-code",
      "rating",
      "relative-time-card",
      "responsive-dialog",
      "scroll-spy",
      "scroller",
      "segmented-input",
      "selection-toolbar",
      "sortable",
      "speed-dial",
      "stack",
      "stat",
      "status",
      "stepper",
      "swap",
      "tags-input",
      "time-picker",
      "timeline",
      "tour",
    ];

    const componentRedirects = componentNames.map((name) => ({
      source: `/docs/components/${name}`,
      destination: `/docs/components/radix/${name}`,
      permanent: false,
    }));

    return [
      {
        source: "/docs",
        destination: "/docs/introduction",
        permanent: false,
      },
      ...componentRedirects,
      {
        source: "/r/:component(data-table.*\\.json|data-grid.*\\.json)",
        destination: "https://tablecn.com/r/:component",
        permanent: true,
      },
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
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/:path*",
        permanent: true,
      },
    ];
  },
  // Already doing typechecking as separate tasks in CI
  typescript: { ignoreBuildErrors: true },
};

export default withMDX(nextConfig);
