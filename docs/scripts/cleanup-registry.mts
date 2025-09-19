import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rimraf } from "rimraf";

import { registry } from "../registry";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.resolve(__dirname, "../public/r/styles/default");

// Reserved registry item names that should never be removed
const RESERVED_NAMES = new Set(["index", "style"]);

/**
 * Cleanup orphaned JSON files from the registry that are no longer referenced
 * in the registry TypeScript files (registry-ui.ts, registry-examples.ts, etc.)
 */
async function cleanupRegistry() {
  console.log("🧹 Starting registry cleanup...");

  try {
    // Get all registry item names from the TypeScript registry
    const registryItemNames = new Set(
      registry.items
        .filter((item) => !RESERVED_NAMES.has(item.name))
        .map((item) => item.name),
    );

    console.log(
      `📋 Found ${registryItemNames.size} items in registry TypeScript files`,
    );

    // Get all JSON files in the registry directory
    const registryFiles = await fs.readdir(REGISTRY_PATH);
    const jsonFiles = registryFiles.filter((file) => file.endsWith(".json"));

    console.log(
      `📁 Found ${jsonFiles.length} JSON files in registry directory`,
    );

    // Find orphaned files (JSON files without corresponding registry items)
    const orphanedFiles: string[] = [];
    const validFiles: string[] = [];

    for (const jsonFile of jsonFiles) {
      const itemName = path.basename(jsonFile, ".json");

      // Skip reserved files
      if (RESERVED_NAMES.has(itemName)) {
        validFiles.push(jsonFile);
        continue;
      }

      if (registryItemNames.has(itemName)) {
        validFiles.push(jsonFile);
      } else {
        orphanedFiles.push(jsonFile);
      }
    }

    console.log(`✅ Valid files: ${validFiles.length}`);
    console.log(`🗑️  Orphaned files found: ${orphanedFiles.length}`);

    if (orphanedFiles.length === 0) {
      console.log("🎉 No orphaned files found! Registry is clean.");
      return;
    }

    // List orphaned files
    console.log("\n📝 Orphaned files to be removed:");
    for (const file of orphanedFiles) {
      console.log(`  - ${file}`);
    }

    // Remove orphaned files
    console.log("\n🗑️  Removing orphaned files...");
    let removedCount = 0;

    for (const file of orphanedFiles) {
      const filePath = path.join(REGISTRY_PATH, file);
      try {
        await rimraf(filePath);
        console.log(`  ✓ Removed: ${file}`);
        removedCount++;
      } catch (error) {
        console.error(`  ✗ Failed to remove ${file}:`, error);
      }
    }

    console.log(
      `\n🎉 Cleanup completed! Removed ${removedCount} orphaned files.`,
    );

    // Summary
    console.log("\n📊 Summary:");
    console.log(`  - Registry items in TypeScript: ${registryItemNames.size}`);
    console.log(`  - Valid JSON files: ${validFiles.length}`);
    console.log(`  - Orphaned files removed: ${removedCount}`);
    console.log(`  - Remaining JSON files: ${jsonFiles.length - removedCount}`);
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
