import { promises as fs } from "node:fs";
import path from "node:path";
import { registrySchema } from "shadcn/schema";

async function main() {
  const registryFile = path.join(process.cwd(), "public/r/registry.json");

  console.log("📦 Validating registry.json...\n");

  try {
    const content = await fs.readFile(registryFile, "utf-8");
    const registry = JSON.parse(content);

    const result = registrySchema.safeParse(registry);

    if (!result.success) {
      console.error("❌ Registry validation failed:\n");
      console.error(result.error.format());
      process.exit(1);
    }

    console.log("✅ Registry schema is valid!");
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
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
