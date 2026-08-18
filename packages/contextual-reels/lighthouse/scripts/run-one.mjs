#!/usr/bin/env node
// run-one.mjs — run Lighthouse (desktop + mobile) against one tag × mount size
// cell, served from a local dist/ build via the same static server the
// ad-resource-budget harness uses. Prints category scores + core metrics as
// JSON to stdout (nothing else) so the matrix runner can capture and average
// it; use --out to also persist the two raw Lighthouse reports.
//
//   node run-one.mjs --dir ../../dist --html ./tag-snippet.html \
//     --tag-id 6a3aa86e4da8cd92d289ccda --width 320 --height 480
//
// Flags:
//   --dir <path>     dist directory to serve (required)
//   --html <file>    snippet template with __CR_TAG_ID__/__CR_WIDTH__/__CR_HEIGHT__ (required)
//   --tag-id <id>    tag id substituted into the snippet (required)
//   --width <px>     mount width (default 320)
//   --height <px>    mount height (default 480)
//   --out <prefix>   if set, writes <prefix>.desktop.json and <prefix>.mobile.json
import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { startServer } from "../../ad-resource-budget/scripts/lib/server.mjs";

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith("--")) continue;
    const name = k.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) a[name] = true;
    else {
      a[name] = next;
      i++;
    }
  }
  return a;
}

async function runLighthouse(url, { desktop, outPath }) {
  const args = [
    "lighthouse",
    url,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--chrome-flags=--headless=new",
    "--quiet",
    "--output=json",
    `--output-path=${outPath}`,
  ];
  if (desktop) args.push("--preset=desktop");
  await execFileAsync("npx", args, { maxBuffer: 1024 * 1024 * 64 });
  return JSON.parse(await readFile(outPath, "utf8"));
}

function extract(report) {
  const a = report.audits;
  return {
    performance: report.categories.performance.score,
    accessibility: report.categories.accessibility.score,
    bestPractices: report.categories["best-practices"].score,
    seo: report.categories.seo.score,
    fcp: a["first-contentful-paint"].numericValue,
    lcp: a["largest-contentful-paint"].numericValue,
    tbt: a["total-blocking-time"].numericValue,
    cls: a["cumulative-layout-shift"].numericValue,
    speedIndex: a["speed-index"].numericValue,
    bootupTime: a["bootup-time"].numericValue,
    mainthreadWork: a["mainthread-work-breakdown"].numericValue,
    totalByteWeight: a["total-byte-weight"].numericValue,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.dir || !args.html || !args["tag-id"]) {
    console.error("Usage: run-one.mjs --dir <distDir> --html <snippet> --tag-id <id> [--width] [--height] [--out]");
    process.exit(2);
  }

  const width = String(args.width || 320);
  const height = String(args.height || 480);
  let inlineTag = await readFile(resolve(args.html), "utf8");
  inlineTag = inlineTag
    .replace(/__CR_TAG_ID__/g, String(args["tag-id"]))
    .replace(/__CR_WIDTH__/g, width)
    .replace(/__CR_HEIGHT__/g, height);

  const server = await startServer({ distDir: resolve(args.dir), inlineTag, viewMode: "direct" });
  try {
    const url = `${server.origin}/ad-frame.html`;
    const outPrefix = args.out ? resolve(args.out) : resolve(__dirname, `lh-tmp.${process.pid}`);

    const desktopReport = await runLighthouse(url, { desktop: true, outPath: `${outPrefix}.desktop.json` });
    const mobileReport = await runLighthouse(url, { desktop: false, outPath: `${outPrefix}.mobile.json` });

    const result = {
      tagId: args["tag-id"],
      width: Number(width),
      height: Number(height),
      desktop: extract(desktopReport),
      mobile: extract(mobileReport),
    };
    if (args.out) {
      await writeFile(`${outPrefix}.json`, JSON.stringify(result, null, 2));
    }
    console.log(JSON.stringify(result));
  } finally {
    await server.close();
  }
}

main().catch((err) => {
  console.error("run-one error:", err);
  process.exit(2);
});
