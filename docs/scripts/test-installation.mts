#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_URL = process.env.REGISTRY_URL || "https://diceui.com";
const TEST_COMPONENT = process.env.TEST_COMPONENT || "action-bar";

console.log("🧪 Testing DiceUI Installation");
console.log("================================\n");
console.log(`Registry URL: ${REGISTRY_URL}`);
console.log(`Test Component: @diceui/${TEST_COMPONENT}\n`);

// Create a temporary test directory
const tempDir = path.join(__dirname, "../.test-installation");
const testProjectDir = path.join(tempDir, "test-project");

try {
  // Clean up any existing test directory
  if (fs.existsSync(tempDir)) {
    console.log("🧹 Cleaning up previous test directory...");
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  // Create test project structure
  console.log("📁 Creating test project structure...");
  fs.mkdirSync(testProjectDir, { recursive: true });
  fs.mkdirSync(path.join(testProjectDir, "components/ui"), { recursive: true });
  fs.mkdirSync(path.join(testProjectDir, "hooks"), { recursive: true });
  fs.mkdirSync(path.join(testProjectDir, "lib"), { recursive: true });

  // Create package.json
  const packageJson = {
    name: "test-diceui-installation",
    version: "0.0.1",
    private: true,
    dependencies: {
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      next: "^15.0.0",
    },
  };
  fs.writeFileSync(
    path.join(testProjectDir, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  // Create components.json with DiceUI registry
  const componentsJson = {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: true,
    tsx: true,
    tailwind: {
      config: "tailwind.config.ts",
      css: "styles/globals.css",
      baseColor: "zinc",
      cssVariables: true,
      prefix: "",
    },
    iconLibrary: "lucide",
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
    },
    registries: {
      "@diceui": `${REGISTRY_URL}/r/{name}.json`,
    },
  };
  fs.writeFileSync(
    path.join(testProjectDir, "components.json"),
    JSON.stringify(componentsJson, null, 2),
  );

  // Create utils file
  fs.mkdirSync(path.join(testProjectDir, "lib"), { recursive: true });
  fs.writeFileSync(
    path.join(testProjectDir, "lib/utils.ts"),
    `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
  );

  console.log("✅ Test project structure created\n");

  // Test fetching the registry entry
  console.log(`📥 Fetching registry entry for ${TEST_COMPONENT}...`);
  const registryUrl = `${REGISTRY_URL}/r/${TEST_COMPONENT}.json`;
  console.log(`   URL: ${registryUrl}`);

  try {
    const response = await fetch(registryUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const registryData = await response.json();
    console.log(`✅ Registry entry fetched successfully\n`);

    // Check registry dependencies
    console.log("🔍 Checking registry dependencies...");
    if (registryData.registryDependencies) {
      for (const dep of registryData.registryDependencies) {
        console.log(`   - ${dep}`);

        // If it's a @diceui dependency, verify it exists
        if (dep.startsWith("@diceui/")) {
          const depName = dep.replace("@diceui/", "");
          const depUrl = `${REGISTRY_URL}/r/${depName}.json`;

          try {
            const depResponse = await fetch(depUrl);
            if (!depResponse.ok) {
              throw new Error(
                `HTTP ${depResponse.status}: ${depResponse.statusText}`,
              );
            }
            const depData = await depResponse.json();
            console.log(`     ✅ Found at ${depUrl}`);

            // Check nested dependencies
            if (
              depData.registryDependencies &&
              depData.registryDependencies.length > 0
            ) {
              console.log(
                `     Dependencies: ${depData.registryDependencies.join(", ")}`,
              );
            }
          } catch (error) {
            console.error(`     ❌ Failed to fetch: ${error.message}`);
            throw new Error(`Missing registry dependency: ${dep}`);
          }
        }
      }
      console.log(`✅ All registry dependencies exist\n`);
    }

    // Display component details
    console.log("📦 Component Details:");
    console.log(`   Name: ${registryData.name}`);
    console.log(`   Type: ${registryData.type}`);
    if (registryData.dependencies) {
      console.log(`   Dependencies: ${registryData.dependencies.join(", ")}`);
    }
    if (registryData.registryDependencies) {
      console.log(
        `   Registry Dependencies: ${registryData.registryDependencies.join(
          ", ",
        )}`,
      );
    }
    console.log(`   Files: ${registryData.files?.length || 0}`);
    console.log();

    // Try to install using shadcn CLI (dry run simulation)
    console.log("🎯 Testing installation command...");
    console.log(
      `   Command: pnpm dlx shadcn@latest add "@diceui/${TEST_COMPONENT}"\n`,
    );

    // Simulate what shadcn CLI would do
    console.log("📋 Installation would:");
    console.log(`   1. Fetch ${registryUrl}`);
    console.log(
      `   2. Resolve ${
        registryData.registryDependencies?.length || 0
      } registry dependencies`,
    );
    console.log(
      `   3. Install ${registryData.dependencies?.length || 0} npm packages`,
    );
    console.log(`   4. Create ${registryData.files?.length || 0} files`);

    if (registryData.files) {
      console.log("\n   Files to be created:");
      for (const file of registryData.files) {
        console.log(`   - ${file.path} (${file.type})`);
      }
    }

    console.log("\n✅ Installation test passed!");
    console.log("\n🎉 All checks completed successfully!");
    console.log(
      `\n💡 To test the actual installation, run:\n   pnpm dlx shadcn@latest add "@diceui/${TEST_COMPONENT}"`,
    );
  } catch (error) {
    console.error(`❌ Failed to fetch registry entry: ${error.message}`);
    throw error;
  }
} catch (error) {
  console.error("\n❌ Test failed:", error.message);
  process.exit(1);
} finally {
  // Clean up
  if (fs.existsSync(tempDir)) {
    console.log("\n🧹 Cleaning up test directory...");
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
