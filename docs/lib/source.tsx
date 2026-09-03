import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";

import { docs, meta } from "@/.source/server";

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
              <span className="inline-flex items-center gap-2">
                {node.name}
                <span
                  className="flex size-2 rounded-full bg-blue-500"
                  title="New"
                />
              </span>
            );
          }

          return node;
        },
      },
    }),
  ],
});
