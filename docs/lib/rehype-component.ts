/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/www/lib/rehype-component.ts
 */

import fs from "node:fs";
import path from "node:path";
import type { UnistNode, UnistTree } from "types/unist";
import { u } from "unist-builder";
import { visit } from "unist-util-visit";

import { Index } from "@/__registry__";
import { STYLES } from "@/registry/styles";

// Default base for backward compatibility
const DEFAULT_BASE = "radix";

// Map styles for compatibility
const styles = STYLES.map((s) => ({ name: s.name, label: s.title }));

export function rehypeComponent() {
  return async (tree: UnistTree) => {
    visit(tree, (node: UnistNode) => {
      // src prop overrides both name and fileName.
      const srcPath = getNodeAttributeByName(node, "src")?.value as
        | string
        | undefined;

      if (node.name === "ComponentSource") {
        const name = getNodeAttributeByName(node, "name")?.value as string;
        const fileName = getNodeAttributeByName(node, "fileName")?.value as
          | string
          | undefined;

        if (!name && !srcPath) {
          return null;
        }

        try {
          for (const style of styles) {
            let src: string;

            if (srcPath) {
              src = srcPath;
            } else {
              // Use the multi-base index structure: Index[base][style][name]
              const baseIndex = Index[DEFAULT_BASE];
              if (!baseIndex) continue;

              const styleIndex = baseIndex[style.name];
              if (!styleIndex) continue;

              const component = styleIndex[name];
              if (!component) continue;

              src = fileName
                ? component.files.find((file: string) => {
                    return (
                      file.endsWith(`${fileName}.tsx`) ||
                      file.endsWith(`${fileName}.ts`)
                    );
                  }) || component.files[0]?.path
                : component.files[0]?.path;
            }

            // Read the source file.
            const filePath = src;
            let source = fs.readFileSync(filePath, "utf8");

            // Replace imports.
            // TODO: Use @swc/core and a visitor to replace this.
            // For now a simple regex should do.
            source = source.replaceAll(
              `@/registry/bases/${DEFAULT_BASE}/`,
              "@/components/",
            );
            source = source.replaceAll(
              `@/registry/${style.name}/`,
              "@/components/",
            );
            source = source.replaceAll("export default", "export");

            // Add code as children so that rehype can take over at build time.
            node.children?.push(
              u("element", {
                tagName: "pre",
                properties: {
                  __src__: src,
                  __style__: style.name,
                },
                attributes: [
                  {
                    name: "styleName",
                    type: "mdxJsxAttribute",
                    value: style.name,
                  },
                ],
                children: [
                  u("element", {
                    tagName: "code",
                    properties: {
                      className: ["language-tsx"],
                    },
                    children: [
                      {
                        type: "text",
                        value: source,
                      },
                    ],
                  }),
                ],
              }),
            );
          }
        } catch (error) {
          console.error(error);
        }
      }

      if (node.name === "ComponentTabs") {
        const name = getNodeAttributeByName(node, "name")?.value as string;

        if (!name) {
          return null;
        }

        try {
          for (const style of styles) {
            // Use the multi-base index structure: Index[base][style][name]
            const baseIndex = Index[DEFAULT_BASE];
            if (!baseIndex) continue;

            const styleIndex = baseIndex[style.name];
            if (!styleIndex) continue;

            const component = styleIndex[name];
            if (!component) continue;

            const src = component.files[0]?.path;

            // Read the source file.
            const filePath = src;
            let source = fs.readFileSync(filePath, "utf8");

            // Replace imports.
            // TODO: Use @swc/core and a visitor to replace this.
            // For now a simple regex should do.
            source = source.replaceAll(
              `@/registry/bases/${DEFAULT_BASE}/`,
              "@/components/",
            );
            source = source.replaceAll(
              `@/registry/${style.name}/`,
              "@/components/",
            );
            source = source.replaceAll("export default", "export");

            // Add code as children so that rehype can take over at build time.
            node.children?.push(
              u("element", {
                tagName: "pre",
                properties: {
                  __src__: src,
                },
                children: [
                  u("element", {
                    tagName: "code",
                    properties: {
                      className: ["language-tsx"],
                    },
                    children: [
                      {
                        type: "text",
                        value: source,
                      },
                    ],
                  }),
                ],
              }),
            );
          }
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

  if (!src) {
    return null;
  }

  // Read the source file.
  const filePath = path.join(process.cwd(), src);
  const source = fs.readFileSync(filePath, "utf8");

  return source;
}
