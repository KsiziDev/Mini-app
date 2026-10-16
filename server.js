const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", "Allow": "GET, HEAD" });
    return res.end("Method Not Allowed");
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400);
    return res.end("Bad Request");
  }

  if (pathname === "/") pathname = "/Index.html";
  const requested = path.resolve(ROOT, "." + pathname);

  if (!requested.startsWith(ROOT + path.sep) || requested === ROOT) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(requested, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not Found");
    }

    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(requested).toLowerCase()] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache"
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(requested).pipe(res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`StarDrop is listening on port ${PORT}`);
});
