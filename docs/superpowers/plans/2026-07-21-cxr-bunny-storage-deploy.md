# CXR Bunny Storage Deploy Target Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Bunny Storage as a second, selectable upload target (alongside Oracle) for the contextual-reels deploy, with both targets default-on, a `--dry-run` flag, and pull-zone cache purge.

**Architecture:** A new `scripts/deploy.ts` orchestrator owns target selection (interactive checkbox, both default-on; CI = both) and dispatches to two independent uploaders — the existing Oracle uploader (refactored to a pure function) and a new Bunny Storage uploader. Shared file-discovery helpers are extracted to `scripts/buildFiles.ts`. Bunny cache purge reuses `BUNNY_API_KEY` against a per-env pull-zone URL.

**Tech Stack:** TypeScript (ESM, run via `tsx`), `@aws-sdk/client-s3` v3.835 (S3-compatible API for both Oracle and Bunny), `@inquirer/prompts`, `chalk`, `cli-progress`, `dotenv`.

> **Working directory:** `packages/contextual-reels`. All relative paths in this plan are relative to that package. Scripts are ESM: **imports of local files use the `.js` extension** (e.g. `import { x } from './buildFiles.js'`).
>
> **No unit-test harness exists for these scripts, and the spec keeps that parity.** Verification per task is: `pnpm --filter @genuin/contextual-reels typecheck` passes, and (where relevant) a `--dry-run` invocation logs the expected plan without sending anything. Commit after each task.

---

## File Structure

- **Create** `scripts/buildFiles.ts` — shared `getFilesRecursively()` + `getBuildFiles()` (dist discovery + content-type + cache-control helpers).
- **Create** `scripts/uploadToBunny.ts` — `uploadBuildsToBunny({ paths, dryRun })` + `getBunnyStorageConfig()`.
- **Create** `scripts/deploy.ts` — orchestrator entry point (target + path selection, flags, dispatch). Replaces `uploadToOracle.ts` as the invoked script.
- **Modify** `scripts/uploadToOracle.ts` — strip self-invocation + argv/prompt logic; export `uploadBuildsToOracle({ paths, dryRun })` and `getOracleConfig()`; import discovery from `buildFiles.ts`.
- **Modify** `scripts/bunnyPurge.ts` — add `purgeBunnyStorage(paths)`; leave `purgeBunnyCDN` untouched.
- **Modify** `.env.common`, `.env.common.example`, `.env.qa`, `.env.qa.example`, `.env.production`, `.env.production.example` — new Bunny Storage vars.
- **Modify** `package.json` — rename `publish:oracle:*` → `publish:*` pointing at `deploy.ts`; update `deploy:*`; add `publish:interactive:*`.
- **Delete** `scripts/uploadToOracle.ts`? **No** — keep as a library module (no longer directly invoked).

---

## Task 1: Extract shared build-file discovery into `buildFiles.ts`

**Files:**
- Create: `scripts/buildFiles.ts`
- Modify: `scripts/uploadToOracle.ts` (remove local copies of the helpers, import them)

- [ ] **Step 1: Create `scripts/buildFiles.ts`**

```ts
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

/** Recursively lists all files under a directory, returning paths relative to that directory. */
export function getFilesRecursively(dir: string, basePath: string = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getFilesRecursively(fullPath, basePath));
    } else {
      files.push(path.relative(basePath, fullPath));
    }
  }
  return files;
}

/**
 * Discovers all dist/ files that should be uploaded.
 * QA: includes source maps. Production: excludes source maps.
 */
export function getBuildFiles(): string[] {
  const NODE_ENV = process.env.NODE_ENV ?? 'qa';
  const isProduction = NODE_ENV === 'production';

  const allFiles = getFilesRecursively('dist').map((f) => path.join('dist', f));

  const buildFiles = allFiles.filter((file) => {
    const filename = path.basename(file);
    const ext = path.extname(file);

    // Stable loader
    if (filename === 'gen_ext.min.js') return true;
    // Hashed core bundle: gen_ext-[hash].js
    if (/^gen_ext-[A-Za-z0-9_-]+\.js$/.test(filename)) return true;
    // CSS assets: cxr-[hash].css
    if (file.includes('assets/') && ext === '.css' && /^cxr-[A-Za-z0-9_-]+\.css$/.test(filename)) return true;
    // Chunks
    if (file.includes('chunks/') && ext === '.js') return true;
    // Source maps — QA only
    if (!isProduction && ext === '.map') return true;

    return false;
  });

  console.log(chalk.blue(`\nDiscovered ${buildFiles.length} files to upload:`));
  buildFiles.forEach((f) => console.log(chalk.gray(`  • ${f}`)));

  return buildFiles;
}

/** Content type for an upload, based on file extension. */
export function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.js') return 'application/javascript';
  if (ext === '.css') return 'text/css';
  if (ext === '.map') return 'application/json';
  return 'application/octet-stream';
}

/**
 * Cache-Control for an upload. The stable loader must revalidate every load so new
 * releases are picked up; hashed files are content-addressed and cache forever.
 */
export function cacheControlFor(filePath: string): string {
  const filename = path.basename(filePath);
  if (filename === 'gen_ext.min.js') return 'no-cache';
  return 'public, max-age=31536000, immutable';
}
```

- [ ] **Step 2: Update `scripts/uploadToOracle.ts` to import the shared helpers**

Remove the local `getBuildFiles` and `getFilesRecursively` definitions (lines defining them). At the top of the imports, add:

```ts
import { getBuildFiles, getFilesRecursively, contentTypeFor } from './buildFiles.js';
```

(`getFilesRecursively` may not be referenced directly in Oracle after this — if unused, omit it from the import to keep the lint clean. Keep `getBuildFiles` and `contentTypeFor`.) In `uploadFile`, replace the inline content-type block:

```ts
  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.js') contentType = 'application/javascript';
  else if (ext === '.css') contentType = 'text/css';
  else if (ext === '.map') contentType = 'application/json';
```

with:

```ts
  const contentType = contentTypeFor(filePath);
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @genuin/contextual-reels typecheck`
Expected: PASS (no errors). If `getFilesRecursively` is reported unused, remove it from the import.

- [ ] **Step 4: Commit**

```bash
git add packages/contextual-reels/scripts/buildFiles.ts packages/contextual-reels/scripts/uploadToOracle.ts
git commit -m "refactor(cxr): extract shared build-file discovery into buildFiles.ts"
```

---

## Task 2: Refactor `uploadToOracle.ts` to a pure, injectable function

Strip the argv parsing, interactive prompts, and self-invocation so `deploy.ts` can call it. Oracle config loading stays; upload logic stays.

**Files:**
- Modify: `scripts/uploadToOracle.ts`

- [ ] **Step 1: Export `getOracleConfig` and change the signature of the main function**

Change the export declaration:

```ts
export async function getOracleConfig(): Promise<OracleConfig | null> {
```

Replace the `uploadBuildsToOracle` signature and its prompt/argv block. The new function takes explicit options and does no prompting:

```ts
export type UploadOptions = {
  /** Paths to upload to (already resolved by the orchestrator, e.g. ['cxr/1.0.0']). */
  paths: string[];
  /** When true, log the intended actions but send nothing. */
  dryRun: boolean;
};

/**
 * Uploads the current dist/ build to Oracle Object Storage under each given path,
 * then purges Bunny CDN for those paths. Prompting/target selection happens upstream.
 */
export async function uploadBuildsToOracle({ paths, dryRun }: UploadOptions): Promise<void> {
  const oracleConfig = await getOracleConfig();
  if (!oracleConfig) return;

  const { bucketName, region, endpointUrl, namespace, accessKeyId, secretAccessKey } = oracleConfig;
  const selectedPaths = paths;
```

Delete the old block that read `process.argv.includes('--interactive')`, the `confirm`, and the `checkbox` for paths (the `if (isInteractive) { ... } else { ... }` section), and delete the now-unused `paths` destructured from `oracleConfig` (it is replaced by the argument). Remove the `confirm, checkbox` import if no longer used.

- [ ] **Step 2: Add dry-run handling to the Oracle upload**

Immediately after `const buildFiles = getBuildFiles();` and the empty-check, before creating the progress bar, insert:

```ts
  if (dryRun) {
    console.log(chalk.magenta('\n[dry-run] Oracle — would upload:'));
    for (const filePath of buildFiles) {
      const relativePath = path.relative('dist', filePath);
      for (const uploadPath of selectedPaths) {
        console.log(chalk.gray(`  • ${bucketName}/${uploadPath.replace(/^\//, '')}/${relativePath}`));
      }
    }
    console.log(chalk.magenta('[dry-run] Oracle — would then purge Bunny CDN for:'));
    selectedPaths.forEach((p) => console.log(chalk.gray(`  • ${p}`)));
    return;
  }
```

- [ ] **Step 3: Remove the module self-invocation**

Delete the trailing block:

```ts
uploadBuildsToOracle().catch((error: unknown) => {
  console.error(chalk.red('💥 Upload script failed:'), error);
  process.exit(1);
});
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @genuin/contextual-reels typecheck`
Expected: PASS. Fix any unused-import errors (`confirm`/`checkbox`).

- [ ] **Step 5: Commit**

```bash
git add packages/contextual-reels/scripts/uploadToOracle.ts
git commit -m "refactor(cxr): make uploadBuildsToOracle an injectable pure function"
```

---

## Task 3: Add `purgeBunnyStorage` to `bunnyPurge.ts`

**Files:**
- Modify: `scripts/bunnyPurge.ts`

- [ ] **Step 1: Add the storage-purge config loader + function**

Append before the final `export { ... }` line:

```ts
/**
 * Purges the Bunny Storage pull-zone for the given cxr paths, reusing BUNNY_API_KEY.
 * Non-fatal if BUNNY_API_KEY or BUNNY_STORAGE_PULL_URL is missing.
 *
 * @param uploadPaths - Paths just uploaded to Bunny Storage (e.g. ['cxr/1.0.0'])
 */
export async function purgeBunnyStorage(uploadPaths: string[]): Promise<void> {
  const NODE_ENV = process.env.NODE_ENV ?? 'qa';
  const commonEnv = dotenv.config({ path: '.env.common' }).parsed ?? {};
  const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.qa';
  const envConfig = dotenv.config({ path: envFile }).parsed ?? {};
  const combinedEnv = { ...commonEnv, ...envConfig };

  const apiKey = combinedEnv['BUNNY_API_KEY'];
  const pullUrl = combinedEnv['BUNNY_STORAGE_PULL_URL'];

  console.log(chalk.blue('\nChecking Bunny Storage purge configuration:'));
  console.log('API Key:', chalk.yellow(apiKey ? 'set' : 'not set'));
  console.log('Pull-zone URL:', chalk.yellow(pullUrl ?? 'not set'));

  if (!apiKey || !pullUrl) {
    console.log(chalk.yellow('⚠ Bunny Storage pull-zone not configured, skipping cache purge'));
    return;
  }

  if (uploadPaths.length === 0) {
    console.log(chalk.yellow('⚠ No upload paths provided, skipping Bunny Storage purge'));
    return;
  }

  const base = pullUrl.replace(/\/$/, '');
  const urlsToPurge = uploadPaths.map((p) => `${base}/${p.replace(/^\//, '')}/*`);
  console.log(chalk.blue('\nBunny Storage purge URLs:'));
  urlsToPurge.forEach((url) => console.log(chalk.gray(`  • ${url}`)));

  await purgeBunnyUrls(urlsToPurge, apiKey);
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @genuin/contextual-reels typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/contextual-reels/scripts/bunnyPurge.ts
git commit -m "feat(cxr): add purgeBunnyStorage for the new pull-zone"
```

---

## Task 4: Create the Bunny Storage uploader

**Files:**
- Create: `scripts/uploadToBunny.ts`

- [ ] **Step 1: Create `scripts/uploadToBunny.ts`**

```ts
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import chalk from 'chalk';
import dotenv from 'dotenv';
import cliProgress from 'cli-progress';
import { getBuildFiles, contentTypeFor, cacheControlFor } from './buildFiles.js';
import { purgeBunnyStorage } from './bunnyPurge.js';
import type { UploadOptions } from './uploadToOracle.js';

type BunnyStorageConfig = {
  accessKey: string;
  zone: string;
  endpoint: string;
  region: string;
};

/**
 * Loads Bunny Storage credentials from .env.common and the env-specific file.
 * Returns null (with a logged reason) if any key is missing, so a misconfigured
 * Bunny target is skipped rather than crashing the whole deploy.
 */
export async function getBunnyStorageConfig(): Promise<BunnyStorageConfig | null> {
  const NODE_ENV = process.env.NODE_ENV ?? 'qa';
  const commonEnv = dotenv.config({ path: '.env.common' }).parsed ?? {};
  const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.qa';
  const envConfig = dotenv.config({ path: envFile }).parsed ?? {};
  const combinedEnv = { ...commonEnv, ...envConfig };

  const accessKey = combinedEnv['BUNNY_STORAGE_ACCESS_KEY'];
  const zone = combinedEnv['BUNNY_STORAGE_ZONE'];
  const endpoint = combinedEnv['BUNNY_STORAGE_ENDPOINT'];
  const region = combinedEnv['BUNNY_STORAGE_REGION'];

  console.log(chalk.blue('\nChecking Bunny Storage configuration:'));
  console.log('Environment:', chalk.yellow(NODE_ENV));
  console.log('Access Key:', chalk.yellow(accessKey ? '***configured***' : 'not set'));
  console.log('Zone:', chalk.yellow(zone ?? 'not set'));
  console.log('Endpoint:', chalk.yellow(endpoint ?? 'not set'));
  console.log('Region:', chalk.yellow(region ?? 'not set'));

  if (!accessKey || !zone || !endpoint || !region) {
    console.log(chalk.red('❌ Missing required Bunny Storage configuration'));
    return null;
  }

  console.log(chalk.green('✓ Bunny Storage configuration found'));
  return { accessKey, zone, endpoint, region };
}

/** Uploads a single file to Bunny Storage, preserving its dist/ subdirectory structure. */
async function uploadFile(
  client: S3Client,
  zone: string,
  filePath: string,
  bunnyBasePath: string,
  progressBar: cliProgress.SingleBar,
): Promise<void> {
  const fileContent = fs.readFileSync(filePath);
  const relativePath = path.relative('dist', filePath);
  const key = `${bunnyBasePath.replace(/^\//, '')}/${relativePath}`;

  const command = new PutObjectCommand({
    Bucket: zone,
    Key: key,
    Body: fileContent,
    ContentType: contentTypeFor(filePath),
    CacheControl: cacheControlFor(filePath),
  });

  try {
    await client.send(command);
    progressBar.increment();
    console.log(chalk.green(`✓ Uploaded ${relativePath} → ${zone}/${key}`));
  } catch (error) {
    console.error(chalk.red(`✗ Failed to upload ${relativePath} → ${zone}/${key}`));
    throw error;
  }
}

/**
 * Uploads the current dist/ build to Bunny Storage under each given path, then purges
 * the pull-zone. Prompting/target selection happens upstream in deploy.ts.
 */
export async function uploadBuildsToBunny({ paths, dryRun }: UploadOptions): Promise<void> {
  const config = await getBunnyStorageConfig();
  if (!config) return;

  const { accessKey, zone, endpoint, region } = config;
  const selectedPaths = paths;

  const buildFiles = getBuildFiles();
  if (buildFiles.length === 0) {
    console.log(chalk.yellow('⚠ No build files found to upload'));
    return;
  }

  if (dryRun) {
    console.log(chalk.magenta('\n[dry-run] Bunny Storage — would upload:'));
    for (const filePath of buildFiles) {
      const relativePath = path.relative('dist', filePath);
      for (const uploadPath of selectedPaths) {
        console.log(chalk.gray(`  • ${zone}/${uploadPath.replace(/^\//, '')}/${relativePath}`));
      }
    }
    console.log(chalk.magenta('[dry-run] Bunny Storage — would then purge pull-zone for:'));
    selectedPaths.forEach((p) => console.log(chalk.gray(`  • ${p}`)));
    return;
  }

  // Bunny's S3-compatible API rejects the x-amz-checksum-* headers that AWS SDK v3.835
  // adds by default (WHEN_SUPPORTED). WHEN_REQUIRED disables them. Bunny uses the storage
  // zone password as both the access key id and secret, and the zone name as the bucket.
  const client = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId: accessKey, secretAccessKey: accessKey },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });

  const existingFiles = buildFiles.filter((f) => {
    if (!fs.existsSync(f)) {
      console.warn(chalk.yellow(`⚠ ${f} does not exist, skipping`));
      return false;
    }
    return true;
  });

  const totalUploads = existingFiles.length * selectedPaths.length;
  const progressBar = new cliProgress.SingleBar({
    format: 'Uploading |' + chalk.cyan('{bar}') + '| {percentage}% || {value}/{total} Files',
    barCompleteChar: '█',
    barIncompleteChar: '░',
  });

  console.log(chalk.blue('\nStarting Bunny Storage upload...'));
  progressBar.start(totalUploads, 0);

  try {
    const uploadPromises: Promise<void>[] = [];
    for (const filePath of existingFiles) {
      for (const uploadPath of selectedPaths) {
        uploadPromises.push(uploadFile(client, zone, filePath, uploadPath, progressBar));
      }
    }
    await Promise.all(uploadPromises);
    progressBar.stop();

    console.log(chalk.green('\n✓ Bunny Storage upload completed successfully!'));
    console.log(chalk.blue(`\nFiles uploaded to Bunny Storage zone: ${zone}`));
    console.log(chalk.blue(`Endpoint: ${endpoint}`));

    try {
      await purgeBunnyStorage(selectedPaths);
    } catch (error) {
      console.error(chalk.red('\n⚠ Bunny Storage purge failed (non-critical):'), error);
    }
  } catch (error) {
    progressBar.stop();
    console.error(chalk.red('\n✗ Bunny Storage upload failed:'), error);
    throw error;
  }
}
```

> **Note:** this uploader `throw`s on upload failure (it does not `process.exit(1)` itself);
> `deploy.ts` decides the process exit code after all targets run. This differs from the old
> Oracle script that exited directly — Task 5 makes Oracle behave the same way.

- [ ] **Step 2: Make Oracle throw instead of `process.exit(1)` on upload failure**

In `scripts/uploadToOracle.ts`, in the `catch` at the end of `uploadBuildsToOracle`, replace:

```ts
  } catch (error) {
    progressBar.stop();
    console.error(chalk.red('\n✗ Oracle Object Storage upload failed:'), error);
    process.exit(1);
  }
```

with:

```ts
  } catch (error) {
    progressBar.stop();
    console.error(chalk.red('\n✗ Oracle Object Storage upload failed:'), error);
    throw error;
  }
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @genuin/contextual-reels typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/contextual-reels/scripts/uploadToBunny.ts packages/contextual-reels/scripts/uploadToOracle.ts
git commit -m "feat(cxr): add Bunny Storage uploader"
```

---

## Task 5: Create the `deploy.ts` orchestrator

**Files:**
- Create: `scripts/deploy.ts`

- [ ] **Step 1: Create `scripts/deploy.ts`**

```ts
#!/usr/bin/env tsx
import { confirm, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { uploadBuildsToOracle } from './uploadToOracle.js';
import { uploadBuildsToBunny } from './uploadToBunny.js';
import type { UploadOptions } from './uploadToOracle.js';

type Target = {
  id: 'oracle' | 'bunny';
  label: string;
  run: (opts: UploadOptions) => Promise<void>;
};

const TARGETS: Target[] = [
  { id: 'oracle', label: 'Oracle Object Storage', run: uploadBuildsToOracle },
  { id: 'bunny', label: 'Bunny Storage', run: uploadBuildsToBunny },
];

/** Reads S3_UPLOAD_PATHS from .env.common + the env-specific file. */
function getConfiguredPaths(): string[] {
  const NODE_ENV = process.env.NODE_ENV ?? 'qa';
  const commonEnv = dotenv.config({ path: '.env.common' }).parsed ?? {};
  const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.qa';
  const envConfig = dotenv.config({ path: envFile }).parsed ?? {};
  const combinedEnv = { ...commonEnv, ...envConfig };
  return (combinedEnv['S3_UPLOAD_PATHS'] ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

async function main(): Promise<void> {
  const isInteractive = process.argv.includes('--interactive');
  const dryRun = process.argv.includes('--dry-run');

  console.log(chalk.blue('🚀 Contextual Reels Deploy'));
  console.log(chalk.gray('==========================\n'));
  if (dryRun) console.log(chalk.magenta('DRY RUN — no files will be uploaded or purged.\n'));

  const configuredPaths = getConfiguredPaths();
  if (configuredPaths.length === 0) {
    console.error(chalk.red('❌ S3_UPLOAD_PATHS is not set — nothing to deploy.'));
    process.exit(1);
  }

  // Resolve which targets to run.
  let selectedTargets: Target[];
  if (isInteractive) {
    const chosen = await checkbox<Target['id']>({
      message: 'Select the storage targets to upload to:',
      choices: TARGETS.map((t) => ({ value: t.id, name: t.label, checked: true })),
      validate: (selected) => selected.length > 0 || 'You must select at least one target',
    });
    selectedTargets = TARGETS.filter((t) => chosen.includes(t.id));
  } else {
    selectedTargets = TARGETS;
    console.log(chalk.blue(`CI mode: uploading to all targets: ${selectedTargets.map((t) => t.label).join(', ')}`));
  }

  // Resolve which paths to use.
  let selectedPaths: string[];
  if (isInteractive) {
    selectedPaths = await checkbox<string>({
      message: 'Select the paths to upload the build files to:',
      choices: configuredPaths.map((p) => ({ value: p, name: p, checked: true })),
      validate: (selected) => selected.length > 0 || 'You must select at least one path',
    });
    const proceed = await confirm({
      message: `Upload to [${selectedTargets.map((t) => t.label).join(', ')}] at [${selectedPaths.join(', ')}]?`,
      default: true,
    });
    if (!proceed) {
      console.log(chalk.yellow('Aborted by user.'));
      return;
    }
  } else {
    selectedPaths = configuredPaths;
  }

  // Run each target independently; isolate failures.
  const failures: string[] = [];
  for (const target of selectedTargets) {
    console.log(chalk.blue(`\n──────── ${target.label} ────────`));
    try {
      await target.run({ paths: selectedPaths, dryRun });
    } catch (error) {
      failures.push(target.label);
      console.error(chalk.red(`\n✗ ${target.label} failed:`), error);
    }
  }

  if (failures.length > 0) {
    console.error(chalk.red(`\n💥 Deploy finished with failures: ${failures.join(', ')}`));
    process.exit(1);
  }
  console.log(chalk.green('\n✓ Deploy completed successfully.'));
}

main().catch((error: unknown) => {
  console.error(chalk.red('💥 Deploy script failed:'), error);
  process.exit(1);
});
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @genuin/contextual-reels typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/contextual-reels/scripts/deploy.ts
git commit -m "feat(cxr): add deploy orchestrator with selectable targets and --dry-run"
```

---

## Task 6: Wire up env vars

**Files:**
- Modify: `.env.common`, `.env.common.example`, `.env.qa`, `.env.qa.example`, `.env.production`, `.env.production.example`

> `.env.common`, `.env.qa`, `.env.production` are gitignored (real credentials). Edit them
> locally but they will not be committed — only the `.example` files are committed.

- [ ] **Step 1: Add Bunny Storage vars to `.env.common`** (real access key from Slack)

Append:

```
# Bunny Storage (S3-compatible) — CXR build uploads
BUNNY_STORAGE_ACCESS_KEY="14d25dab-db16-4e6b-b52343405daa-5479-4b56"
BUNNY_STORAGE_ZONE="infolink"
BUNNY_STORAGE_ENDPOINT="https://de-s3.storage.bunnycdn.com"
BUNNY_STORAGE_REGION="de"
```

- [ ] **Step 2: Add matching stubs to `.env.common.example`**

Append:

```
# Bunny Storage (S3-compatible) — CXR build uploads
BUNNY_STORAGE_ACCESS_KEY=""
BUNNY_STORAGE_ZONE="infolink"
BUNNY_STORAGE_ENDPOINT="https://de-s3.storage.bunnycdn.com"
BUNNY_STORAGE_REGION="de"
```

- [ ] **Step 3: Add the pull-zone URL to `.env.qa` and `.env.qa.example`**

> **Status:** No QA pull-zone exists for the Bunny 'infolink' storage zone yet. Leave
> `BUNNY_STORAGE_PULL_URL=""`. `purgeBunnyStorage` treats an empty value as "not configured"
> and skips the purge non-fatally — uploads still succeed. Fill this in once the pull-zone is
> provisioned; no code change needed then.

To `.env.qa` (leave `""` until a QA pull-zone exists):

```
# Public pull-zone URL fronting the Bunny 'infolink' storage zone (for cache purge)
BUNNY_STORAGE_PULL_URL=""
```

To `.env.qa.example`:

```
# Public pull-zone URL fronting the Bunny 'infolink' storage zone (for cache purge)
BUNNY_STORAGE_PULL_URL=""
```

- [ ] **Step 4: Add the pull-zone URL to `.env.production` and `.env.production.example`**

Same two blocks as Step 3, added to `.env.production` and `.env.production.example`.

- [ ] **Step 5: Commit (example files only)**

```bash
git add packages/contextual-reels/.env.common.example packages/contextual-reels/.env.qa.example packages/contextual-reels/.env.production.example
git commit -m "chore(cxr): document Bunny Storage env vars in example files"
```

> Verify `.env.common` / `.env.qa` / `.env.production` are NOT staged: `git status` should
> not list them. If it does, they are not gitignored — STOP and confirm with the team before
> committing any real credentials.

---

## Task 7: Update `package.json` scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Rename publish scripts and point them at `deploy.ts`**

Replace:

```json
    "publish:oracle:qa": "env-cmd -f ./.env.qa cross-env NODE_ENV=qa npx tsx scripts/uploadToOracle.ts",
    "publish:oracle:prod": "env-cmd -f ./.env.production cross-env NODE_ENV=production npx tsx scripts/uploadToOracle.ts",
```

with:

```json
    "publish:qa": "env-cmd -f ./.env.qa cross-env NODE_ENV=qa npx tsx scripts/deploy.ts",
    "publish:prod": "env-cmd -f ./.env.production cross-env NODE_ENV=production npx tsx scripts/deploy.ts",
    "publish:interactive:qa": "env-cmd -f ./.env.qa cross-env NODE_ENV=qa npx tsx scripts/deploy.ts --interactive",
    "publish:interactive:prod": "env-cmd -f ./.env.production cross-env NODE_ENV=production npx tsx scripts/deploy.ts --interactive",
```

- [ ] **Step 2: Update `deploy:qa` / `deploy:prod` to call the renamed scripts**

Replace:

```json
    "deploy:qa": "env-cmd -f ./.env.qa cross-env NODE_ENV=qa npx tsx scripts/npmVersionManager.ts && npm run build:qa && npm run publish:oracle:qa",
    "deploy:prod": "env-cmd -f ./.env.production cross-env NODE_ENV=production npx tsx scripts/npmVersionManager.ts && npm run build:prod && npm run publish:oracle:prod",
```

with:

```json
    "deploy:qa": "env-cmd -f ./.env.qa cross-env NODE_ENV=qa npx tsx scripts/npmVersionManager.ts && npm run build:qa && npm run publish:qa",
    "deploy:prod": "env-cmd -f ./.env.production cross-env NODE_ENV=production npx tsx scripts/npmVersionManager.ts && npm run build:prod && npm run publish:prod",
```

- [ ] **Step 3: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('packages/contextual-reels/package.json','utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 4: Commit**

```bash
git add packages/contextual-reels/package.json
git commit -m "chore(cxr): point deploy scripts at new deploy.ts orchestrator"
```

---

## Task 8: Dry-run verification

**Files:** none (verification only)

- [ ] **Step 1: Build QA**

Run: `pnpm --filter @genuin/contextual-reels build:qa`
Expected: build succeeds, `packages/contextual-reels/dist/` populated.

- [ ] **Step 2: CI-mode dry run (both targets)**

Run (from `packages/contextual-reels`): `pnpm exec env-cmd -f ./.env.qa cross-env NODE_ENV=qa tsx scripts/deploy.ts --dry-run`
Expected: logs "CI mode: uploading to all targets: Oracle Object Storage, Bunny Storage", then for each target a `[dry-run] … would upload:` list with keys under `cxr/1.0.0/…` and `would … purge` lines. Nothing is sent.

- [ ] **Step 3: Interactive dry run**

Run: `pnpm exec env-cmd -f ./.env.qa cross-env NODE_ENV=qa tsx scripts/deploy.ts --interactive --dry-run`
Expected: target checkbox with both pre-checked; path checkbox with `cxr/1.0.0` pre-checked; confirmation; then the same dry-run output. Deselecting Oracle shows only the Bunny plan.

- [ ] **Step 4: Real Bunny-only upload against QA** (no pull-zone yet — purge is expected to skip)

Run: `pnpm exec env-cmd -f ./.env.qa cross-env NODE_ENV=qa tsx scripts/deploy.ts --interactive`
Deselect Oracle, keep Bunny + `cxr/1.0.0`, confirm.
Expected: uploads succeed; objects visible under `cxr/1.0.0/` in the `infolink` zone (Bunny dashboard). The purge step logs `⚠ Bunny Storage pull-zone not configured, skipping cache purge` — this is expected until `BUNNY_STORAGE_PULL_URL` is set, NOT a failure. If uploads fail with a checksum/signature error, capture the exact error — this is the SigV4-vs-native-API decision point flagged in the spec.

- [ ] **Step 5: No commit** (verification only). Record results in the PR description.

---

## Verification results (Task 8)

Run on 2026-07-21 against QA config after `build:qa`:

- **CI-mode dry-run** (`deploy.ts --dry-run`): both targets iterate; Oracle keys
  `genuin-qa-media/cxr/1.0.0/…` (51 files), Bunny keys `infolink/cxr/1.0.0/…` (51 files);
  Bunny config resolves to zone `infolink`, endpoint `de-s3.storage.bunnycdn.com`, region
  `de`; both purge steps logged; "Deploy completed successfully", exit 0.
- **Missing-config throw**: with Bunny storage vars absent, `uploadBuildsToBunny` throws
  `"Bunny Storage is not configured — cannot upload."` (verified by direct import). The
  orchestrator's per-target try/catch turns this into a recorded failure + non-zero exit.
- **Interactive** (`--interactive`): both target checkboxes render pre-selected (`◉` Oracle,
  `◉` Bunny) and the path checkbox renders `cxr/1.0.0` pre-selected — confirms `checked: true`.
- **Note on env loading:** the deploy scripts parse `.env.common`/`.env.<env>` directly via
  `dotenv.config({ path })`; they do NOT read vars injected by `env-cmd` into `process.env`.
  So config overrides must go in the actual env files, not layered `env-cmd -f` files.
- **Real Bunny upload (Step 4): DEFERRED** — pending user go-ahead to push a real build to
  the `infolink` bucket. Purge stays skipped until a pull-zone URL exists.

## Post-review change (Task 5 code review)

Both uploaders now **throw** (rather than returning silently) when their config is
missing or `dist/` is empty. Rationale: a *selected* target that can't upload must not
report success — the orchestrator's per-target try/catch turns the throw into a recorded
failure and a non-zero exit. The Bunny **purge** remains non-fatal (that skip is
intentional until a pull-zone exists); only the **upload** config is treated as required.

## Self-Review Notes

- **Spec coverage:** Bunny uploader (T4), target selection both-default-on (T5), CI both targets (T5), dry-run (T2/T4/T5), pull-zone purge reusing BUNNY_API_KEY (T3), env split common/per-env (T6), rename to deploy.ts + package.json (T5/T7), shared discovery to avoid duplication (T1), checksum gotcha (T4). All covered.
- **Type consistency:** `UploadOptions { paths, dryRun }` defined in T2, imported by T4 and T5. `uploadBuildsToOracle` / `uploadBuildsToBunny` both take `UploadOptions` and return `Promise<void>`. `purgeBunnyStorage(paths: string[])` used by T4.
- **Checkbox API:** `@inquirer/prompts` uses `name` for the display label (not `label`) — the existing code uses `{ value, label }`, which renders the value as the label; this plan uses `{ value, name, checked }` which is the correct field for a shown label + default-checked. Both work at runtime; `name` is intentional here for correct labels.
