import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";

const PORT = Number(process.env.PORT || 8787);
const DIST_DIR = resolve("dist");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function serveStatic(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const cleanPath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
  const requestedFile = cleanPath
    ? join(DIST_DIR, cleanPath)
    : join(DIST_DIR, "index.html");
  const filePath = existsSync(requestedFile)
    ? requestedFile
    : join(DIST_DIR, "index.html");

  if (!existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Build the frontend first with npm run build.");
    return;
  }

  response.writeHead(200, {
    "Content-Type": MIME_TYPES[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}

createServer((request, response) => {
  serveStatic(request, response);
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Dhanvika Boutique server running at http://127.0.0.1:${PORT}`);
});
