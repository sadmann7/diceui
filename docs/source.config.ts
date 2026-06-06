import { remarkGfm, remarkNpm } from "fumadocs-core/mdx-plugins";
import { fileGenerator, remarkDocGen } from "fumadocs-docgen";
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import rehypeSlug from "rehype-slug";
import { codeImport } from "remark-code-import";
import remarkMath from "remark-math";
import { z } from "zod";
import { rehypeComponent } from "@/lib/rehype-component";

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        dark: "github-dark",
        light: "github-light",
      },
      langs: ["typescript", "tsx", "javascript", "jsx", "json", "bash", "css"],
    },
    rehypePlugins: (plugins) => {
      plugins.push(rehypeSlug, rehypeComponent);
      return plugins;
    },
    remarkPlugins: (plugins) => {
      plugins.push(
        codeImport,
        remarkGfm,
        remarkMath,
        [remarkNpm, { persist: { id: "package-manager" } }],
        [remarkDocGen, { generators: [fileGenerator()] }],
      );
      return plugins;
    },
  },
});

export const { docs, meta } = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      preview: z.boolean().optional(),
      base: z.enum(["radix", "base"]).optional(),
      date: z.coerce.string().optional(),
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
