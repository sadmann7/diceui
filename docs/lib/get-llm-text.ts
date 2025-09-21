import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/source";

export async function getLLMText(page: InferPageType<typeof source>) {
  try {
    // Read the raw MDX file from the filesystem
    const filePath = join(process.cwd(), "content/docs", page.file.path);
    const content = await readFile(filePath, "utf-8");

    return `# ${page.data.title}
URL: ${page.url}

${content}`;
  } catch {
    // Fallback if file reading fails
    return `# ${page.data.title}
URL: ${page.url}

${page.data.description || "No content available"}`;
  }
}
