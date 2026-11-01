// Tiny static server for local testing: node scripts/serve.mjs  ->  http://localhost:8123
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
const types = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".json": "application/json" };
createServer(async (req, res) => {
  const p = normalize(decodeURIComponent((req.url || "/").split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const file = join("docs", p.endsWith("/") ? p + "index.html" : p);
  try { const b = await readFile(file); res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" }); res.end(b); }
  catch { res.writeHead(404); res.end("not found"); }
}).listen(8123, () => console.log("http://localhost:8123"));
