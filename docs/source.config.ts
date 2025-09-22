import { getHighlighter } from "@shikijs/compat";
import { rehypeCode, remarkGfm, remarkNpm } from "fumadocs-core/mdx-plugins";
import { fileGenerator, remarkDocGen } from "fumadocs-docgen";

import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { codeImport } from "remark-code-import";
import remarkMath from "remark-math";
import { z } from "zod";
import { rehypeComponent } from "@/lib/rehype-component";

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    rehypePlugins: [
      rehypeCode,
      rehypeSlug,
      rehypeComponent,
      [
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark",
            light: "github-light",
          },
          getHighlighter: async () => {
            // Use lazy loading and memory-optimized highlighter
            const highlighter = await getHighlighter({
              themes: ["github-dark", "github-light"],
              // Only load essential languages to reduce memory usage
              langs: [
                "typescript",
                "tsx",
                "javascript",
                "jsx",
                "json",
                "bash",
                "css",
                "html",
                "markdown",
              ],
            });
            return highlighter;
          },
          onVisitLine(node: { children: { length: number } }) {
            // Prevent lines from collapsing in `display: grid` mode, and allow empty
            // lines to be copy/pasted
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
          },
          onVisitHighlightedLine(node: {
            properties: { className: string[] };
          }) {
            node.properties.className.push("line--highlighted");
          },
          onVisitHighlightedWord(node: {
            properties: { className: string[] };
          }) {
            node.properties.className = ["word--highlighted"];
          },
        },
      ],
    ],
    remarkPlugins: [
      codeImport,
      remarkGfm,
      remarkMath,
      [remarkNpm, { persist: { id: "package-manager" } }],
      [remarkDocGen, { generators: [fileGenerator()] }],
    ],
  },
});

export const { docs, meta } = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      preview: z.boolean().optional(),
      links: z
        .object({
          doc: z.string().optional(),
          api: z.string().optional(),
        })
        .optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});
