import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rimraf } from "rimraf";

import { registries } from "../registry";
import { STYLES } from "../registry/styles";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STYLES_PATH = path.resolve(__dirname, "../public/r/styles");

// Define bases to match build-registry
const BASES = Object.keys(registries) as Array<keyof typeof registries>;

// Reserved file names within each style directory
const RESERVED_NAMES = new Set(["index", "registry"]);

async function cleanupRegistry() {
  console.log("🧹 Starting registry cleanup...");

  try {
    // Build expected style directory names
    const expectedStyleDirs = new Set<string>();
    for (const baseName of BASES) {
      for (const style of STYLES) {
        expectedStyleDirs.add(`${baseName}-${style.name}`);
      }
    }

    // Check if styles directory exists
    try {
      await fs.access(STYLES_PATH);
    } catch {
      console.log("📁 No styles directory found. Nothing to clean.");
      return;
    }

    // Get all directories in styles/
    const styleDirs = await fs.readdir(STYLES_PATH, { withFileTypes: true });
    const existingDirs = styleDirs
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    // Find orphaned style directories
    const orphanedDirs = existingDirs.filter(
      (dir) => !expectedStyleDirs.has(dir),
    );

    if (orphanedDirs.length > 0) {
      console.log(
        `\n🗑️  Removing ${orphanedDirs.length} orphaned style directories...`,
      );
      for (const dir of orphanedDirs) {
        const dirPath = path.join(STYLES_PATH, dir);
        await rimraf(dirPath);
        console.log(`  ✓ Removed directory: ${dir}/`);
      }
    }

    // Clean orphaned files within each valid style directory
    let totalOrphaned = 0;
    let totalValid = 0;

    for (const baseName of BASES) {
      const registry = registries[baseName];

      // Build expected item names for this base
      const expectedItems = new Set<string>();
      for (const item of registry.items) {
        if (!RESERVED_NAMES.has(item.name)) {
          expectedItems.add(item.name);
        }
      }
      // Add reserved file names
      for (const name of RESERVED_NAMES) {
        expectedItems.add(name);
      }

      for (const style of STYLES) {
        const styleName = `${baseName}-${style.name}`;
        const styleDir = path.join(STYLES_PATH, styleName);

        try {
          await fs.access(styleDir);
        } catch {
          continue; // Directory doesn't exist, skip
        }

        const files = await fs.readdir(styleDir);
        const jsonFiles = files.filter((f) => f.endsWith(".json"));

        for (const jsonFile of jsonFiles) {
          const itemName = path.basename(jsonFile, ".json");

          if (expectedItems.has(itemName)) {
            totalValid++;
          } else {
            const filePath = path.join(styleDir, jsonFile);
            await rimraf(filePath);
            console.log(`  ✓ Removed: ${styleName}/${jsonFile}`);
            totalOrphaned++;
          }
        }
      }
    }

    // Also clean the styles/index.json if it exists but is orphaned
    const indexPath = path.join(STYLES_PATH, "index.json");
    try {
      await fs.access(indexPath);
      totalValid++;
    } catch {
      // index.json doesn't exist, that's fine
    }

    console.log(
      `\n🎉 Cleanup completed! Removed ${totalOrphaned + orphanedDirs.length} orphaned items.`,
    );

    // Summary
    console.log("\n📊 Summary:");
    console.log(`  - Expected style directories: ${expectedStyleDirs.size}`);
    console.log(`  - Orphaned directories removed: ${orphanedDirs.length}`);
    console.log(`  - Valid JSON files: ${totalValid}`);
    console.log(`  - Orphaned JSON files removed: ${totalOrphaned}`);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

// Run the cleanup if this script is executed directly
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  cleanupRegistry();
}

export { cleanupRegistry };
