/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/v4/lib/rehype.ts
 */

import fs from "node:fs";
import path from "node:path";
import { u } from "unist-builder";
import { visit } from "unist-util-visit";
import { DEFAULT_BASE } from "@/lib/constants";
import type { UnistNode, UnistTree } from "@/types/unist";

function resolveExamplePath(
  name: string,
  base: string = DEFAULT_BASE,
): string | null {
  const p = path.join(
    process.cwd(),
    `registry/bases/${base}/examples/${name}.tsx`,
  );
  return fs.existsSync(p) ? p : null;
}

function normalizeSource(source: string, base: string = DEFAULT_BASE): string {
  return source
    .replaceAll(`@/registry/bases/${base}/`, "@/components/")
    .replaceAll("export default", "export");
}

export function rehypeComponent() {
  return async (tree: UnistTree) => {
    visit(tree, (node: UnistNode) => {
      if (node.name !== "ComponentTabs") return;

      const name = getNodeAttributeByName(node, "name")?.value as string;
      if (!name) return;

      try {
        const filePath = resolveExamplePath(name, DEFAULT_BASE);
        if (!filePath) {
          console.warn(
            `[rehype-component] Could not resolve example "${name}"`,
          );
          return;
        }

        const raw = fs.readFileSync(filePath, "utf8");
        const source = normalizeSource(raw);

        node.children?.push(
          u("element", {
            tagName: "pre",
            properties: { __src__: filePath },
            children: [
              u("element", {
                tagName: "code",
                properties: { className: ["language-tsx"] },
                children: [{ type: "text", value: source }],
              }),
            ],
          }),
        );
      } catch (error) {
        console.error(error);
      }
    });
  };
}

function getNodeAttributeByName(node: UnistNode, name: string) {
  return node.attributes?.find((attribute) => attribute.name === name);
}
