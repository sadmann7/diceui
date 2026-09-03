import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { remarkGfm, remarkNpm } from "fumadocs-core/mdx-plugins";
import { pageSchema } from "fumadocs-core/source/schema";
import { fileGenerator, remarkDocGen } from "fumadocs-docgen";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { rehypePrettyCode } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { codeImport } from "remark-code-import";
import remarkMath from "remark-math";
import { z } from "zod";

import { rehypeComponent } from "@/lib/rehype-component";

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (plugins) => {
      plugins.shift();
      plugins.push(rehypeSlug, rehypeComponent, [
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark",
            light: "github-light",
          },
          transformers: [
            transformerNotationDiff({ matchAlgorithm: "v3" }),
            transformerNotationHighlight({ matchAlgorithm: "v3" }),
            transformerNotationWordHighlight({ matchAlgorithm: "v3" }),
            transformerNotationFocus({ matchAlgorithm: "v3" }),
          ],
        },
      ]);
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
    schema: pageSchema.extend({
      new: z.boolean().optional(),
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
