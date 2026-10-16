import ts from "typescript-5";

// Markers that aren't styles: the CLI rewrites or keeps them as they are.
const ALLOWED_MARKERS = new Set([
  "cn-rtl-flip",
  "cn-font-heading",
  "cn-menu-target",
  "cn-menu-translucent",
  "cn-logical-sides",
]);

function getStrings(node: ts.Node) {
  const strings: string[] = [];
  const visit = (child: ts.Node) => {
    if (
      ts.isStringLiteral(child) ||
      ts.isNoSubstitutionTemplateLiteral(child)
    ) {
      strings.push(child.text);
    } else {
      ts.forEachChild(child, visit);
    }
  };
  visit(node);
  return strings.filter((value) => value.trim()).join(" ");
}

// Collects the class strings of a component file, keyed so a marker source
// (`bases/radix/ui`) lines up with its compiled copy (`new-york-v4/ui`): by
// `data-slot`, by `cva()` variant, or by position inside a function.
function getClassStrings(source: string) {
  const file = ts.createSourceFile(
    "component.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const classes = new Map<string, string>();
  let functionName = "";
  let functionIndex = 0;

  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name) {
      functionName = node.name.text;
      functionIndex = 0;
    }

    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      node.initializer.expression.getText() === "cva"
    ) {
      const name = node.name.getText();
      const [base, config] = node.initializer.arguments;
      if (base) classes.set(`cva:${name}:base`, getStrings(base));
      if (config && ts.isObjectLiteralExpression(config)) {
        for (const property of config.properties) {
          if (
            !ts.isPropertyAssignment(property) ||
            property.name.getText() !== "variants" ||
            !ts.isObjectLiteralExpression(property.initializer)
          ) {
            continue;
          }
          for (const group of property.initializer.properties) {
            if (
              !ts.isPropertyAssignment(group) ||
              !ts.isObjectLiteralExpression(group.initializer)
            ) {
              continue;
            }
            for (const option of group.initializer.properties) {
              if (!ts.isPropertyAssignment(option)) continue;
              const key = option.name.getText().replace(/["']/g, "");
              classes.set(
                `cva:${name}:${group.name.getText()}:${key}`,
                getStrings(option.initializer),
              );
            }
          }
        }
      }
    }

    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const attributes = node.attributes.properties;
      const getAttribute = (name: string) =>
        attributes.find(
          (attribute): attribute is ts.JsxAttribute =>
            ts.isJsxAttribute(attribute) && attribute.name.getText() === name,
        );
      const className = getAttribute("className");
      if (className?.initializer) {
        const slot = getAttribute("data-slot")?.initializer;
        const key =
          slot && ts.isStringLiteral(slot)
            ? `slot:${slot.text}:${node.tagName.getText()}`
            : `fn:${functionName}:${functionIndex++}`;
        if (!classes.has(key)) {
          classes.set(key, getStrings(className.initializer));
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(file);
  return classes;
}

// The New York classes behind each marker in a component: the compiled
// string minus the structural classes the marker source keeps inline.
export function getNewYorkClasses(markerSource: string, newYorkSource: string) {
  const markerClasses = getClassStrings(markerSource);
  const newYorkClasses = getClassStrings(newYorkSource);
  const result: Record<string, string> = {};

  for (const [key, value] of markerClasses) {
    const tokens = value.split(/\s+/).filter(Boolean);
    const markers = tokens.filter(
      (token) => token.startsWith("cn-") && !ALLOWED_MARKERS.has(token),
    );
    const compiled = newYorkClasses.get(key);
    if (!markers.length || compiled === undefined) continue;

    const structural = new Set(
      tokens.filter((token) => !token.startsWith("cn-")),
    );
    result[markers[0]!] = compiled
      .split(/\s+/)
      .filter((token) => token && !structural.has(token))
      .join(" ");
  }

  return result;
}
