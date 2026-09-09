#!/usr/bin/env node
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dir = "dist/client";
const assets = await readdir(join(dir, "assets"));
const css = assets.find((f) => /^styles-.*\.css$/.test(f));
if (!css) {
  throw new Error("No styles-*.css in dist/client/assets");
}

let html = await readFile(join(dir, "index.html"));
// Prerender sometimes writes a NUL that makes the file look binary.
html = Buffer.from(html.filter((b) => b !== 0)).toString("utf8");
html = html.replace(
  /\/Mexicoquerataro\/assets\/styles-[A-Za-z0-9_-]+\.css/g,
  `/Mexicoquerataro/assets/${css}`,
);
if (!html.includes(`assets/${css}`)) {
  throw new Error(`Failed to point index.html at ${css}`);
}

await writeFile(join(dir, "index.html"), html);
await writeFile(join(dir, "404.html"), html);
await writeFile(join(dir, ".nojekyll"), "");
console.log("GitHub Pages shell ready:", css);
