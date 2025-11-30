// NOTE: Namespace import keeps Vite's browser stub for "fs/promises" from failing.
// Named imports trigger Rollup to validate exports against "__vite-browser-external".
import * as fs from "fs/promises";
import path from "path";

const cache = new Map<string, string>();

async function readPrompt(relativePath: string): Promise<string> {
  if (cache.has(relativePath)) {
    return cache.get(relativePath)!;
  }
  const abs = path.resolve(process.cwd(), "ai", "prompts", relativePath);
  const content = await fs.readFile(abs, "utf8");
  cache.set(relativePath, content);
  return content;
}

export async function renderPrompt(templateFile: string, values: Record<string, unknown>): Promise<string> {
  const [template, systemPrompt] = await Promise.all([
    readPrompt(templateFile),
    readPrompt("system_prompt.md"),
  ]);
  const withSystem = template.replace(/{{\s*SYSTEM_PROMPT\s*}}/g, systemPrompt.trim());
  return withSystem.replace(/{{\s*([\w.]+)\s*}}/g, (_, key: string) => {
    const value = key.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object" && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, values);

    if (value === undefined || value === null) {
      return "";
    }

    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    return JSON.stringify(value);
  });
}
