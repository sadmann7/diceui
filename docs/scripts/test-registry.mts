#!/usr/bin/env tsx
/**
 * DiceUI Registry Test
 *
 * Auto-detects environment and validates all registry entries.
 */

interface TestResult {
  success: boolean;
  error?: string;
  deps?: number;
}

interface ServerInfo {
  url: string;
  local: boolean;
}

const PROD_URL = "https://diceui.com";
const LOCAL_URLS = ["http://localhost:3000", "http://localhost:3001"];
const VERBOSE = process.env.VERBOSE === "true";

const HOOKS = ["use-as-ref", "use-isomorphic-layout-effect", "use-lazy-ref"];

const COMPONENTS = [
  "action-bar",
  "angle-slider",
  "color-picker",
  "compare-slider",
  "cropper",
  "editable",
  "file-upload",
  "key-value",
  "masonry",
  "media-player",
  "rating",
  "scroll-spy",
  "speed-dial",
  "stepper",
  "time-picker",
  "tour",
];

async function detectServer(): Promise<ServerInfo> {
  // Check local servers first
  for (const url of LOCAL_URLS) {
    try {
      const response = await fetch(`${url}/r/use-as-ref.json`, {
        signal: AbortSignal.timeout(1000),
      });
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

async function testItem(name: string, url: string): Promise<TestResult> {
  const itemUrl = `${url}/r/${name}.json`;

  try {
    const response = await fetch(itemUrl);
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}`,
      };
    }

    if (VERBOSE) {
      const data = await response.json();
      const depCount =
        data.registryDependencies?.filter((d: string) =>
          d.startsWith("@diceui/"),
        ).length || 0;
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
  console.log(`✅ ${local ? "Local" : "Production"}: ${url}\n`);

  let passed = 0;
  let failed = 0;
  const failedItems: string[] = [];

  // Test hooks
  console.log(`🔧 Testing Hooks (${HOOKS.length})...`);
  for (const hook of HOOKS) {
    const result = await testItem(hook, url);
    if (result.success) {
      const suffix = VERBOSE && result.deps ? ` (${result.deps} deps)` : "";
      console.log(`✅ ${hook}${suffix}`);
      passed++;
    } else {
      console.log(`❌ ${hook} - ${result.error}`);
      failed++;
      failedItems.push(hook);
    }
  }

  // Test components
  console.log(`\n📦 Testing Components (${COMPONENTS.length})...`);
  for (const component of COMPONENTS) {
    const result = await testItem(component, url);
    if (result.success) {
      const suffix = VERBOSE && result.deps ? ` (${result.deps} deps)` : "";
      console.log(`✅ ${component}${suffix}`);
      passed++;
    } else {
      console.log(`❌ ${component} - ${result.error}`);
      failed++;
      failedItems.push(component);
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
