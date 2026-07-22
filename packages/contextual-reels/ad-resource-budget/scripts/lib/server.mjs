// server.mjs — minimal static server that serves the host (publisher) page and,
// optionally, a local dist directory containing the built tag. No deps.
import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { brotliCompress, gzip } from "node:zlib";

const brotliCompressAsync = promisify(brotliCompress);
const gzipAsync = promisify(gzip);

// File types a real CDN serves compressed. Media (mp4/webm/images/fonts) is
// already compressed on the wire, so we never re-compress it — matching how
// Bunny/Oracle serve the tag in production. Compressing local dist chunks here
// is what makes encodedDataLength reflect the bytes Chrome actually receives.
const COMPRESSIBLE = new Set([".js", ".mjs", ".css", ".html", ".json", ".svg"]);

/**
 * Compress a response body using the best encoding the client accepts, mirroring
 * production CDN transport. Returns the raw body unchanged when the type is not
 * compressible or the client sent no usable Accept-Encoding.
 *
 * @param {Buffer} body raw file contents
 * @param {string} ext lowercased file extension (incl. leading dot)
 * @param {string} acceptEncoding value of the request's accept-encoding header
 * @returns {Promise<{ body: Buffer, encoding: string | null }>}
 */
async function encodeBody(body, ext, acceptEncoding) {
  if (!COMPRESSIBLE.has(ext)) return { body, encoding: null };
  const accepts = String(acceptEncoding || "").toLowerCase();
  if (accepts.includes("br")) return { body: await brotliCompressAsync(body), encoding: "br" };
  if (accepts.includes("gzip")) return { body: await gzipAsync(body), encoding: "gzip" };
  return { body, encoding: null };
}

const MIME = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// The host page: a stand-in publisher page that loads the tag inside a single
// iframe named "ad-under-test". Everything the tag does happens in that
// subtree, which is the unit Chrome's Heavy Ad Intervention measures.
//
// The frame is loaded via src=/ad-frame.html (a real served document), NOT a
// srcdoc attribute. A srcdoc document has a base URL of about:srcdoc, so a
// path-based script src (e.g. <script src="/tag.js">) and any relative dynamic
// import() the tag performs fail to resolve. Serving the frame as a same-origin
// document makes those resolve against the local origin — which is exactly what
// lets a loader-style tag pull its sibling chunks from the local --dir build.
function hostPage() {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>ad budget host</title></head>
<body style="margin:0;font-family:system-ui">
  <main style="padding:8px">
    <p style="color:#888;font:12px system-ui">ad-resource-budget host page</p>
    <iframe name="ad-under-test" id="ad-under-test" src="/ad-frame.html"
            style="width:970px;height:600px;border:1px dashed #ccc"></iframe>
  </main>
</body>
</html>`;
}

// Markup shared by both view modes: the tag (or inline snippet) itself. Kept as
// its own document body so the iframe view-mode can serve it, unchanged, one
// frame deeper (via /ad-frame-inner.html) behind a same-origin wrapper.
function innerFrameBody(tagSrc, inlineTag) {
  const frameBody = tagSrc ? `<script src=${JSON.stringify(tagSrc)}></script>` : inlineTag || "";
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">${frameBody}</body></html>`;
}

// The ad frame document. In 'direct' view-mode (default) this serves the tag
// markup itself, unchanged from before. In 'iframe' view-mode it instead serves
// a thin same-origin wrapper that nests the real tag markup one frame deeper —
// modeling a publisher who embeds the ad tag inside their own iframe. The frame
// keeps the name "ad-under-test" either way; measure.mjs's frame-attribution
// walk is recursive, so the nested wrapper frame is automatically included with
// no changes to that logic.
function adFramePage(tagSrc, inlineTag, viewMode) {
  if (viewMode === "iframe") {
    return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">` +
      `<iframe name="cxr-publisher-wrapper" src="/ad-frame-inner.html" style="width:100%;height:100%;border:0"></iframe>` +
      `</body></html>`;
  }
  return innerFrameBody(tagSrc, inlineTag);
}

export async function startServer({ distDir, tagSrc, inlineTag, viewMode }) {
  const root = distDir ? resolve(distDir) : null;

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      if (url.pathname === "/" || url.pathname === "/host.html") {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(hostPage());
        return;
      }
      if (url.pathname === "/ad-frame.html") {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        res.end(adFramePage(tagSrc, inlineTag, viewMode));
        return;
      }
      // Always registered — harmless in 'direct' mode (simply unused), and
      // needed by the 'iframe' wrapper's <iframe src>.
      if (url.pathname === "/ad-frame-inner.html") {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        res.end(innerFrameBody(tagSrc, inlineTag));
        return;
      }
      if (!root) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      // Serve files from the dist dir; block path traversal.
      const safe = normalize(url.pathname).replace(/^(\.\.[/\\])+/, "");
      const filePath = join(root, safe);
      if (!filePath.startsWith(root + sep) && filePath !== root) {
        res.writeHead(403);
        res.end("forbidden");
        return;
      }
      const info = await stat(filePath).catch(() => null);
      if (!info || !info.isFile()) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const raw = await readFile(filePath);
      const ext = extname(filePath).toLowerCase();
      const { body, encoding } = await encodeBody(raw, ext, req.headers["accept-encoding"]);
      const headers = {
        "content-type": MIME[ext] || "application/octet-stream",
        "cache-control": "no-store",
        vary: "Accept-Encoding",
      };
      if (encoding) headers["content-encoding"] = encoding;
      res.writeHead(200, headers);
      res.end(body);
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });

  await new Promise((res) => server.listen(0, "127.0.0.1", res));
  const { port } = server.address();
  return {
    origin: `http://127.0.0.1:${port}`,
    close: () => new Promise((res) => server.close(res)),
  };
}
