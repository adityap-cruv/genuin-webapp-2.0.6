/**
 * Worker run inside `tsx` by `validate-page-artifact.mjs`. Imports
 * the artifact module + rule validator (both TypeScript), runs the
 * validation, and prints a single JSON line to stdout.
 *
 * Errors during import exit with code 2 so the parent script can
 * distinguish import failures from rule violations.
 *
 * NOTE: tsx compiles `.ts` files to CJS in this monorepo (no
 * `"type": "module"` on the package). Named ESM imports against a
 * tsx-transpiled module land on `mod.default`, so we use dynamic
 * `import()` and pluck `validatePage` from the namespace's default.
 */

import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const [, , artifactPath] = process.argv;
if (!artifactPath) {
  process.stderr.write('worker: missing artifact path\n');
  process.exit(2);
}

const workerDir = dirname(fileURLToPath(import.meta.url));
const rulesModulePath = resolve(
  workerDir,
  '../packages/hierarchical-tree/src/validate-rules.ts',
);

interface ValidateRulesModule {
  validatePage: (input: unknown) => {
    ok: boolean;
    errors: { code: string; message: string; path: string }[];
    warnings: { code: string; message: string; path: string }[];
  };
}

function pluck<T>(mod: unknown, key: string): T | undefined {
  if (mod === null || typeof mod !== 'object') return undefined;
  const m = mod as Record<string, unknown>;
  if (key in m) return m[key] as T;
  if (m.default && typeof m.default === 'object') {
    const inner = m.default as Record<string, unknown>;
    if (key in inner) return inner[key] as T;
  }
  return undefined;
}

let rulesMod: unknown;
try {
  rulesMod = await import(pathToFileURL(rulesModulePath).href);
} catch (err) {
  process.stderr.write(`failed to load validate-rules: ${(err as Error).message}\n`);
  process.exit(2);
}

const validatePage = pluck<ValidateRulesModule['validatePage']>(rulesMod, 'validatePage');
if (!validatePage) {
  process.stderr.write('validate-rules did not expose `validatePage`\n');
  process.exit(2);
}

const moduleUrl = pathToFileURL(resolve(artifactPath)).href;

let artifactMod: unknown;
try {
  artifactMod = await import(moduleUrl);
} catch (err) {
  process.stderr.write(`import failed: ${(err as Error).message}\n`);
  process.exit(2);
}

function findCandidate(mod: unknown): unknown {
  const direct = pluck<unknown>(mod, 'page');
  if (direct) return direct;
  // Walk all object-valued exports looking for a fixture shape.
  if (mod !== null && typeof mod === 'object') {
    const m = mod as Record<string, unknown>;
    const values: unknown[] = [];
    for (const value of Object.values(m)) {
      if (value && typeof value === 'object') values.push(value);
    }
    // Also unwrap default if it carries the named bindings (CJS interop).
    if (m.default && typeof m.default === 'object') {
      for (const value of Object.values(m.default as Record<string, unknown>)) {
        if (value && typeof value === 'object') values.push(value);
      }
    }
    for (const value of values) {
      const page = pluck<unknown>(value, 'page');
      if (page) return page;
    }
    if (values.length === 1) return values[0];
  }
  return undefined;
}

const candidate = findCandidate(artifactMod);
if (!candidate) {
  process.stderr.write(`no \`page\` export (or fixture { page }) in ${artifactPath}\n`);
  process.exit(2);
}

const result = validatePage(candidate);
process.stdout.write(
  JSON.stringify({ ok: result.ok, errors: result.errors, warnings: result.warnings }),
);
process.exit(0);
