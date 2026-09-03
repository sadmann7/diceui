import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";

import { docs, meta } from "@/.source/server";
import { DOCS_CONTENT_ROUTE, DOCS_IMAGE_ROUTE } from "@/lib/constants";

export const source = loader({
  source: toFumadocsSource(docs, meta),
  baseUrl: "/docs",
  plugins: ({ typedPlugin }) => [
    typedPlugin({
      transformPageTree: {
        file(node, file) {
          if (!file) return node;

          const fileData = this.storage.read(file);
          const isNew =
            fileData?.data && "new" in fileData.data && fileData.data.new;

          if (isNew) {
            node.name = (
              <span key={node.url} className="inline-flex items-center gap-2">
                {node.name}
                <span
                  aria-hidden="true"
                  title="New"
                  className="size-2 rounded-full bg-blue-500"
                />
                <span className="sr-only">New</span>
              </span>
            );
          }

          return node;
        },
      },
    }),
  ],
});

export function getPageImage(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `${DOCS_IMAGE_ROUTE}/${segments.join("/")}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url: `${DOCS_CONTENT_ROUTE}/${segments.join("/")}`,
  };
}
