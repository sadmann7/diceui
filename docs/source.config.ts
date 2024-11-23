import { rehypeCode } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    rehypePlugins: [rehypeCode],
  },
});

export const { docs, meta } = defineDocs({
  dir: "src/content/docs",
});
