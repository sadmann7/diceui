/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/www/lib/rehype-component.ts
 *
 * Injects example source code as children of ComponentTabs nodes so
 * rehype-pretty-code can syntax-highlight them at build time.
 */

import fs from "node:fs";
import path from "node:path";
import type { UnistNode, UnistTree } from "types/unist";
import { u } from "unist-builder";
import { visit } from "unist-util-visit";

const DEFAULT_BASE = "radix";

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
