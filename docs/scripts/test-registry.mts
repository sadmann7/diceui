import { type RegistryBase, registries } from "../registry";
import { STYLES } from "../registry/styles";

interface TestResult {
  success: boolean;
  error?: string;
  deps?: number;
}

interface ServerInfo {
  url: string;
  local: boolean;
}

interface RegistryItem {
  base: RegistryBase;
  style: string;
  name: string;
  type: string;
}

const PROD_URL = "https://diceui.com";
const LOCAL_URLS = ["http://localhost:3000", "http://localhost:3001"];
const VERBOSE = process.env.VERBOSE === "true";
const BASES: RegistryBase[] = ["radix", "base"];

// Use the first style as default for testing
const DEFAULT_STYLE = STYLES[0].name;

// Extract hooks and components from all bases (using default style)
const HOOKS: RegistryItem[] = [];
const COMPONENTS: RegistryItem[] = [];

for (const baseName of BASES) {
  const registry = registries[baseName];

  // Extract hooks
  const baseHooks = registry.items
    .filter((item) => item.type === "registry:hook")
    .map((item) => ({
      base: baseName,
      style: DEFAULT_STYLE,
      name: item.name,
      type: item.type,
    }));
  HOOKS.push(...baseHooks);

  // Extract components with @diceui dependencies
  const baseComponents = registry.items
    .filter(
      (item) =>
        item.type === "registry:ui" &&
        item.registryDependencies?.some((dep) => dep.startsWith("@diceui/")),
    )
    .map((item) => ({
      base: baseName,
      style: DEFAULT_STYLE,
      name: item.name,
      type: item.type,
    }));
  COMPONENTS.push(...baseComponents);
}

async function detectServer(): Promise<ServerInfo> {
  // Use the first hook or component to test server availability
  const testStyleName = `${BASES[0]}-${DEFAULT_STYLE}`;
  const testItemName = HOOKS[0]?.name ?? COMPONENTS[0]?.name ?? "utils";

  // Check local servers first
  for (const url of LOCAL_URLS) {
    try {
      const response = await fetch(
        `${url}/r/styles/${testStyleName}/${testItemName}.json`,
        { signal: AbortSignal.timeout(1000) },
      );
      if (response.ok) {
        return { url, local: true };
      }
    } catch {
      // Server not available, try next
    }
  }

  // Fall back to production
  return { url: PROD_URL, local: false };
}

async function testItem(item: RegistryItem, url: string): Promise<TestResult> {
  const styleName = `${item.base}-${item.style}`;
  const itemUrl = `${url}/r/styles/${styleName}/${item.name}.json`;

  try {
    const response = await fetch(itemUrl, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}`,
      };
    }

    if (VERBOSE) {
      const data = await response.json();
      const depCount = (
        data.registryDependencies?.filter((d: string) =>
          d.startsWith("@diceui/"),
        ) ?? []
      ).length;
      return { success: true, deps: depCount };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function main(): Promise<void> {
  const startTime = Date.now();

  console.log("🧪 DiceUI Registry Test");
  console.log("=======================\n");

  // Detect server
  console.log("🔍 Detecting server...");
  const { url, local } = await detectServer();
  console.log(`✅ ${local ? "Local" : "Production"}: ${url}`);

  if (VERBOSE) {
    console.log(
      `📋 Loaded ${HOOKS.length} hooks + ${COMPONENTS.length} components from registry`,
    );
  }
  console.log();

  let passed = 0;
  let failed = 0;
  const failedItems: string[] = [];

  // Test hooks
  console.log(`🔧 Testing Hooks (${HOOKS.length})...`);
  for (const hook of HOOKS) {
    const result = await testItem(hook, url);
    const displayName = `${hook.base}-${hook.style}/${hook.name}`;
    if (result.success) {
      const suffix = VERBOSE && result.deps ? ` (${result.deps} deps)` : "";
      console.log(`✅ ${displayName}${suffix}`);
      passed++;
    } else {
      console.log(`❌ ${displayName} - ${result.error}`);
      failed++;
      failedItems.push(displayName);
    }
  }

  // Test components
  console.log(`\n📦 Testing Components (${COMPONENTS.length})...`);
  for (const component of COMPONENTS) {
    const result = await testItem(component, url);
    const displayName = `${component.base}-${component.style}/${component.name}`;
    if (result.success) {
      const suffix = VERBOSE && result.deps ? ` (${result.deps} deps)` : "";
      console.log(`✅ ${displayName}${suffix}`);
      passed++;
    } else {
      console.log(`❌ ${displayName} - ${result.error}`);
      failed++;
      failedItems.push(displayName);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  // Summary
  console.log("\n=======================");
  console.log("Summary");
  console.log("=======================");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  console.log(`⏱️  Duration: ${duration}s\n`);

  if (failed > 0) {
    console.log("❌ Failed items:");
    for (const item of failedItems) {
      console.log(`   - ${item}`);
    }
    console.log();
    process.exit(1);
  } else {
    console.log("🎉 All registry entries validated!\n");
    if (local) {
      console.log("💡 Testing against local server");
      console.log("   Deploy to test production\n");
    } else {
      console.log("✨ Production registry is ready\n");
    }
  }
}

main().catch((error: Error) => {
  console.error("\n❌ Test failed:", error.message);
  process.exit(1);
});
