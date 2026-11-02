// Bundles the game into docs/ (served by GitHub Pages).
import { build } from "esbuild";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
mkdirSync("docs", { recursive: true });
await build({
  entryPoints: ["src/game.ts"], bundle: true, format: "esm", minify: true, target: "es2020",
  outfile: "docs/game.js", legalComments: "eof", logLevel: "warning",
});
copyFileSync("src/index.html", "docs/index.html");
writeFileSync("docs/.nojekyll", "");
console.log("built docs/index.html + docs/game.js");
