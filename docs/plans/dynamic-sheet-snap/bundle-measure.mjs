// Reproduces the §8.1 engine bundle-cost numbers in DESIGN.md.
//
// Run in a throwaway dir (keeps the monorepo clean):
//   mkdir -p /tmp/sheet-engine-bundle && cp this file there && cd there
//   npm init -y && npm i motion @use-gesture/react @react-spring/web esbuild
//   node bundle-measure.mjs
//
// Measures each engine's MARGINAL gzipped cost (React externalized — it's
// already shipped by the SDK), so the numbers reflect what each option adds.

import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("entries", { recursive: true });

const entries = {
  "framer-full": `
    import { motion, useDragControls, animate } from "motion/react";
    export function S(){ const c = useDragControls();
      return motion.div && useDragControls && animate ? 1 : 0; }
  `,
  "framer-lazy": `
    import { m, LazyMotion, domAnimation } from "motion/react";
    export function S(){ return m.div && LazyMotion && domAnimation ? 1 : 0; }
  `,
  "usegesture-only": `
    import { useDrag } from "@use-gesture/react";
    export function S(){ return useDrag ? 1 : 0; }
  `,
  "usegesture-spring": `
    import { useDrag } from "@use-gesture/react";
    import { useSpring, animated } from "@react-spring/web";
    export function S(){ return useDrag && useSpring && animated ? 1 : 0; }
  `,
};

const results = [];
for (const [name, code] of Object.entries(entries)) {
  const entry = `entries/${name}.jsx`;
  writeFileSync(entry, code);
  const out = await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: "esm",
    write: false,
    external: ["react", "react-dom", "react/jsx-runtime"],
    logLevel: "silent",
  });
  const raw = out.outputFiles[0].contents;
  results.push({ name, minified: raw.length, gzipped: gzipSync(raw, { level: 9 }).length });
}

results.sort((a, b) => a.gzipped - b.gzipped);
const kb = (n) => (n / 1024).toFixed(1) + " KB";
console.log("\nEngine marginal bundle cost (React externalized):\n");
console.log("engine".padEnd(20), "minified".padStart(12), "gzipped".padStart(12));
for (const r of results) {
  console.log(r.name.padEnd(20), kb(r.minified).padStart(12), kb(r.gzipped).padStart(12));
}
console.log("hand-rolled (no dep)".padEnd(20), kb(0).padStart(12), kb(0).padStart(12));
