export function createTemplate(template: string) {
  return (data: Record<string, unknown>) => {
    return template.replace(/<%-(.*?)%>/g, (_match: string, key: string) => {
      const props = key.trim().split(".");
      let value: unknown = data;
      for (const prop of props) {
        value = (value as Record<string, unknown>)?.[prop];
      }
      return String(value ?? "");
    });
  };
}
