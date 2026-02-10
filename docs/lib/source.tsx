import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { docs, meta } from "@/.source/server";
import { Badge } from "@/components/ui/badge";

export const source = loader({
  source: toFumadocsSource(docs, meta),
  baseUrl: "/docs",
  plugins: ({ typedPlugin }) => [
    typedPlugin({
      transformPageTree: {
        file(node, file) {
          if (!file) return node;

          const fileData = this.storage.read(file);
          const preview =
            fileData?.data &&
            "preview" in fileData.data &&
            fileData.data.preview;

          if (preview) {
            node.name = (
              <>
                {node.name}
                <Badge variant="outline" className="not-prose ml-2 rounded-sm">
                  Preview
                </Badge>
              </>
            );
          }

          return node;
        },
      },
    }),
  ],
});
