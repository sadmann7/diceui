function getImportReplacement(
  match: string,
  _path: string,
  type: string,
  component: string,
) {
  if (type.endsWith("components")) {
    return `@/components/${component}`;
  } else if (type.endsWith("ui")) {
    return `@/components/ui/${component}`;
  } else if (type.endsWith("hooks")) {
    return `@/hooks/${component}`;
  } else if (type.endsWith("lib")) {
    return `@/lib/${component}`;
  }

  return match;
}

export function fixImport(content: string) {
  const regex = /@\/(.+?)\/((?:.*?\/)?(?:components|ui|hooks|lib))\/([\w-]+)/g;

  return content.replace(regex, getImportReplacement);
}
