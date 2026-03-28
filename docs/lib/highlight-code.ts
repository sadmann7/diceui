import { codeToHtml } from "shiki";

export async function highlightCode(
  code: string,
  lang: string,
): Promise<string> {
  try {
    return await codeToHtml(code, {
      lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    });
  } catch {
    // Fallback to plain text if the language is not supported
    return await codeToHtml(code, {
      lang: "text",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    });
  }
}
