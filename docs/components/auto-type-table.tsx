import { createGenerator } from "fumadocs-typescript";
import { AutoTypeTable as AutoTypeTableImpl } from "fumadocs-typescript/ui";

let cachedGenerator: ReturnType<typeof createGenerator> | null = null;

function getGenerator() {
  if (!cachedGenerator) {
    cachedGenerator = createGenerator();
  }
  return cachedGenerator;
}

interface AutoTypeTableProps extends Record<string, unknown> {
  path?: string;
  name?: string;
  type?: string;
}

export async function AutoTypeTable(props: AutoTypeTableProps) {
  const generator = getGenerator();
  const docs = await generator.generateTypeTable({
    path: props.path,
    name: props.name,
    type: props.type,
  });

  if (docs.every((doc) => doc.entries.length === 0)) {
    return (
      <p className="text-muted-foreground">
        No props of its own. It accepts the native attributes of its element.
      </p>
    );
  }

  return (
    <div className="auto-type-table">
      <AutoTypeTableImpl {...props} generator={generator} />
    </div>
  );
}
