import { promises as fs } from "node:fs";
import path from "node:path";
import { registrySchema } from "shadcn/schema";
import { type RegistryBase, registries } from "../registry";
import { STYLES } from "../registry/styles";

const BASES: RegistryBase[] = ["radix", "base"];

async function main() {
  console.log("📦 Validating registry files...\n");

  let hasErrors = false;

  for (const baseName of BASES) {
    for (const style of STYLES) {
      const styleName = `${baseName}-${style.name}`;
      const registryFile = path.join(
        process.cwd(),
        `public/r/styles/${styleName}/registry.json`,
      );

      console.log(`🔍 Validating ${styleName}/registry.json...`);

      try {
        const content = await fs.readFile(registryFile, "utf-8");
        const registry = JSON.parse(content);

        const result = registrySchema.safeParse(registry);

        if (!result.success) {
          console.error(`❌ ${styleName} registry validation failed:\n`);
          console.error(result.error.format());
          hasErrors = true;
          continue;
        }

        console.log(`✅ ${styleName} registry schema is valid!`);
        console.log(`   - Name: ${registry.name}`);
        console.log(`   - Homepage: ${registry.homepage}`);
        console.log(`   - Total items: ${registry.items.length}`);

        // Count by type
        const typeCounts: Record<string, number> = {};
        for (const item of registry.items) {
          typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
        }

        console.log("\n📊 Items by type:");
        for (const [type, count] of Object.entries(typeCounts).sort()) {
          console.log(`   - ${type}: ${count}`);
        }
        console.log();
      } catch (error) {
        console.error(
          `❌ Error validating ${styleName}:`,
          error instanceof Error ? error.message : error,
        );
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log("🎉 All registries are valid!");
}

main();
