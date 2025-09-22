import { createGenerator } from "fumadocs-typescript";
import { AutoTypeTable as FumadocsAutoTypeTable } from "fumadocs-typescript/ui";

let cachedGenerator: ReturnType<typeof createGenerator> | null = null;

function getGenerator() {
  if (!cachedGenerator) {
    cachedGenerator = createGenerator();
  }
  return cachedGenerator;
}

export function AutoTypeTable(props: Record<string, unknown>) {
  return (
    <div className="auto-type-table">
      <FumadocsAutoTypeTable {...props} generator={getGenerator()} />
    </div>
  );
}
