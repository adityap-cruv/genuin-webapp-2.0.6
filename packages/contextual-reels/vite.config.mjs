import fs from "fs";
import { createRequire } from 'module';
import { resolve } from "path";
import { fileURLToPath } from "url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const _require = createRequire(import.meta.url);
const { version: pkgVersion } = _require('./package.json');

// Non-production builds (both 'qa' and 'development') fall back to the QA CDN.
// Development builds point at the same QA CDN because devs run against QA services
// and the loader's CDN_BASE is only ever a fallback when document.currentScript fails.
const CDN_BASE_HOST = nodeEnv === 'production'
  ? 'https://media.begenuin.com'
  : 'https://media.qa.begenuin.com';
const CDN_BASE = `${CDN_BASE_HOST}/cxr/${pkgVersion}/`;
const STABLE_LOADER_NAME = "gen_ext.min.js";
const PIXEL_URL = process.env.VITE_CXR_PIXEL_URL || "https://api.begenuin.com/goservices/dsp/pixel";

// Replace build-time placeholders in the stable loader so it can resolve the
// hashed core chunk + CSS asset emitted alongside it.
const processLoaderPlugin = () => ({
  name: "process-cxr-loader",
  writeBundle(_options, bundle) {
    const distDir = resolve(__dirname, "dist");
    const assetsDir = resolve(distDir, "assets");

    const distFiles = fs.readdirSync(distDir);
    const assetFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];

    const coreFile = distFiles.find((name) => /^gen_ext-[A-Za-z0-9_-]+\.js$/.test(name) && name !== STABLE_LOADER_NAME);
    if (!coreFile) {
      throw new Error("[contextual-reels] Could not find hashed core bundle in dist/");
    }

    const loaderPath = resolve(distDir, STABLE_LOADER_NAME);
    if (!fs.existsSync(loaderPath)) {
      throw new Error(`[contextual-reels] Stable loader not emitted at ${loaderPath}`);
    }

    const cssFile = assetFiles.find((name) => name.startsWith("cxr") && name.endsWith(".css"));

    const header = `/** Genuin Contextual Reels loader (env: ${nodeEnv}) — built ${new Date().toISOString()} */\n`;
    let loaderCode = fs.readFileSync(loaderPath, "utf8");
    loaderCode = loaderCode
      .replace(/__CR_CORE_FILENAME__/g, coreFile)
      .replace(/__CR_CSS_FILENAME__/g, cssFile ?? "")
      .replace(/__CR_CDN_BASE__/g, CDN_BASE)
      .replace(/__CR_PIXEL_URL__/g, PIXEL_URL);
    fs.writeFileSync(loaderPath, header + loaderCode, "utf8");

    // Keep in-memory bundle in sync so downstream plugins see the patched code.
    const loaderChunk = Object.values(bundle).find((chunk) => chunk.fileName === STABLE_LOADER_NAME && "code" in chunk);
    if (loaderChunk) loaderChunk.code = header + loaderCode;
  },
});

// Resolve @genuin/genai-sdk from source (not its pre-built dist) so Vite can
// deduplicate shared deps (React, Radix UI, etc.) with the rest of the cxr
// bundle instead of bundling genai's pre-compiled chunks that re-ship those deps.
const genaiSourceResolver = () => ({
  name: "cxr-genai-source-resolver",
  enforce: "pre", // Run before Vite's built-in resolvers
  resolveId(id, importer) {
    const genaiSrcDir = resolve(__dirname, "../genai/src");

    // @genuin/genai-sdk → genai's source entry.
    if (id === "@genuin/genai-sdk") {
      const mainPath = resolve(genaiSrcDir, "index.ts");
      if (fs.existsSync(mainPath)) return mainPath;
    }

    // @genuin/genai-sdk/styles → always use the pre-built dist CSS. genai uses
    // its own Tailwind v4 config (gai/gen prefix) that cannot be processed
    // through cxr's CSS pipeline (gencl prefix).
    if (id === "@genuin/genai-sdk/styles") {
      const cssPath = resolve(__dirname, "../genai/dist/genai-sdk.css");
      if (fs.existsSync(cssPath)) return cssPath;
    }

    // When genai/src/index.ts imports its own './styles/index.css', redirect to
    // the pre-built dist CSS for the same reason as above.
    const genaiSrcIndex = resolve(genaiSrcDir, "index.ts");
    if (importer === genaiSrcIndex && id === "./styles/index.css") {
      const cssPath = resolve(__dirname, "../genai/dist/genai-sdk.css");
      if (fs.existsSync(cssPath)) return cssPath;
    }

    // genai source files use '@/' as an alias to their own 'genai/src/'
    // directory. cxr defines no '@/' alias, so resolve it explicitly here.
    if (importer && importer.startsWith(genaiSrcDir + "/") && id.startsWith("@/")) {
      const subPath = id.slice(2);
      const base = resolve(genaiSrcDir, subPath);
      if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
      const extensions = [".ts", ".tsx", ".js", ".jsx"];
      for (const ext of extensions) {
        if (fs.existsSync(base + ext)) return base + ext;
      }
      for (const ext of extensions) {
        const idx = resolve(base, `index${ext}`);
        if (fs.existsSync(idx)) return idx;
      }
    }

    return null;
  },
});

export default defineConfig({
  base: "./",
  plugins: [
    genaiSourceResolver(),
    tailwindcss(),
    react({ include: /\.(js|jsx|ts|tsx)$/ }),
    ...(process.env.ANALYZE === "true"
      ? [visualizer({ filename: "dist/stats.html", open: false, gzipSize: true, brotliSize: true })]
      : []),
    processLoaderPlugin(),
  ],
  esbuild: {
    ...(isProduction ? { drop: ["console", "debugger"] } : {}),
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(nodeEnv),
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@cxr": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: isProduction ? "hidden" : true,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 600,
    lib: {
      entry: {
        core: resolve(__dirname, "src/index.jsx"),
        loader: resolve(__dirname, "src/loader.jsx"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "loader") return STABLE_LOADER_NAME;
          return "gen_ext-[hash].js";
        },
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "assets/cxr-[hash][extname]";
          return "assets/[name]-[hash][extname]";
        },
      },
      treeshake: true,
    },
  },
  server: {
    port: 3010,
    host: "0.0.0.0",
  },
  preview: {
    port: 3010,
    host: "0.0.0.0",
  },
});
