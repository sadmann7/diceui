/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/www/lib/rehype-component.ts
 *
 * Resolves component source files using path conventions rather than importing
 * the generated registry index files. This keeps registry metadata out of the
 * Turbopack build graph entirely.
 */

import fs from "node:fs";
import path from "node:path";
import type { UnistNode, UnistTree } from "types/unist";
import { u } from "unist-builder";
import { visit } from "unist-util-visit";

const DEFAULT_BASE = "radix";

// Ordered list of subdirectories to try when resolving a component by name.
const SOURCE_DIRS = ["ui", "components", "lib", "hooks", "internal"];
const SOURCE_EXTENSIONS = [".tsx", ".ts"];

function resolveSourcePath(
  name: string,
  base: string = DEFAULT_BASE,
  fileName?: string,
): string | null {
  const cwd = process.cwd();

  // If a specific fileName is given, treat it as a direct path hint.
  if (fileName) {
    const candidates = SOURCE_EXTENSIONS.flatMap((ext) =>
      SOURCE_DIRS.map((dir) =>
        path.join(cwd, `registry/bases/${base}/${dir}/${fileName}${ext}`),
      ),
    );
    const hit = candidates.find((p) => fs.existsSync(p));
    if (hit) return hit;
  }

  const candidates = SOURCE_EXTENSIONS.flatMap((ext) =>
    SOURCE_DIRS.map((dir) =>
      path.join(cwd, `registry/bases/${base}/${dir}/${name}${ext}`),
    ),
  );
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

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
      const srcPath = getNodeAttributeByName(node, "src")?.value as
        | string
        | undefined;

      if (node.name === "ComponentSource") {
        const name = getNodeAttributeByName(node, "name")?.value as string;
        const fileName = getNodeAttributeByName(node, "fileName")?.value as
          | string
          | undefined;

        if (!name && !srcPath) return null;

        try {
          const filePath = srcPath
            ? fs.existsSync(srcPath)
              ? srcPath
              : path.join(process.cwd(), srcPath)
            : resolveSourcePath(name, DEFAULT_BASE, fileName);

          if (!filePath) {
            console.warn(
              `[rehype-component] Could not resolve source for "${name}"`,
            );
            return null;
          }

          const raw = fs.readFileSync(filePath, "utf8");
          const source = normalizeSource(raw);

          node.children?.push(
            u("element", {
              tagName: "pre",
              properties: {
                __src__: filePath,
                __style__: DEFAULT_BASE,
              },
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
      }

      if (node.name === "ComponentTabs") {
        const name = getNodeAttributeByName(node, "name")?.value as string;
        if (!name) return null;

        try {
          const filePath = resolveExamplePath(name, DEFAULT_BASE);
          if (!filePath) {
            console.warn(
              `[rehype-component] Could not resolve example "${name}"`,
            );
            return null;
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
      }
    });
  };
}

function getNodeAttributeByName(node: UnistNode, name: string) {
  return node.attributes?.find((attribute) => attribute.name === name);
}

export function getComponentSourceFileContent(node: UnistNode) {
  const src = getNodeAttributeByName(node, "src")?.value as string;
  if (!src) return null;
  const filePath = path.join(process.cwd(), src);
  return fs.readFileSync(filePath, "utf8");
}
