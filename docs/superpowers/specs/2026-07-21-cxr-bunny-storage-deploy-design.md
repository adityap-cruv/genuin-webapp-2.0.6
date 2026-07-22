# CXR deploy: add Bunny Storage as a second upload target

**Date:** 2026-07-21
**Scope:** `packages/contextual-reels` deploy scripts only. No changes to `web-sdk`.

## Problem

The contextual-reels (CXR) deploy uploads the built `dist/` to Oracle Object Storage
and then purges Bunny CDN. We now need to **also** upload the same build to a new
**Bunny Storage** zone, then purge it. Both storage targets must be **selectable in
interactive mode, with both selected by default**. In CI (non-interactive) mode, both
targets upload automatically.

Bunny Storage details (from Nayan, Slack):

- Bucket / storage zone: `infolink`
- Storage Access Key: `14d25dab-...` (secret — real value goes in `.env.common`, never committed)
- S3-compatible endpoint: `https://de-s3.storage.bunnycdn.com`
- Region: `de` (Falkenstein — matches the `de-` endpoint prefix)
- Upload folder: `cxr/<version>/…` (mirrors the existing Oracle path `cxr/1.0.0`)
- Purge: reuse the existing `BUNNY_API_KEY` against the zone's public pull-zone URL

## Locked decisions

- **Scope:** CXR package only.
- **Bunny region:** `de`.
- **CI-mode targets:** both Oracle + Bunny.
- **Secret placement:** access key + zone identity in `.env.common`; per-env pull-zone
  purge URL in `.env.qa` / `.env.production`.
- **Upload path:** reuse the selected Oracle path(s) verbatim as the Bunny key prefix —
  they are already `cxr/<version>`.
- **Entry point:** rename `scripts/uploadToOracle.ts` → `scripts/deploy.ts` (orchestrator).
- **Dry-run:** add a `--dry-run` flag.

## Architecture

`scripts/deploy.ts` is the single entry point invoked by `package.json`. It owns
**target selection** and delegates the actual per-target upload+purge to two modules:

```
scripts/deploy.ts          # orchestrator: target selection, dry-run, CI vs interactive
  ├─ scripts/uploadToOracle.ts   # Oracle upload (existing logic, exported fn)
  │    └─ scripts/bunnyPurge.ts  # purgeBunnyCDN(paths) — existing CDN purge (unchanged)
  └─ scripts/uploadToBunny.ts    # NEW: Bunny Storage upload + pull-zone purge
       └─ scripts/bunnyPurge.ts  # purgeBunnyStorage(paths) — NEW purge fn
```

Each target is independent: a Bunny failure must not abort Oracle, and vice-versa.
Genuine upload failures still `process.exit(1)`; a failed **purge** stays non-fatal
(logged, matching today's behavior).

### `scripts/uploadToOracle.ts` (refactor)

- Keep all current Oracle upload logic, but:
  - Remove the module-level self-invocation (`uploadBuildsToOracle().catch(...)`) — it is
    now called by `deploy.ts`, not run directly.
  - Remove the `--interactive` confirm/checkbox prompts from this module; target selection
    and path selection move up to `deploy.ts`. `uploadBuildsToOracle` takes an explicit
    `{ paths, dryRun }` argument instead of reading `process.argv`.
  - Export `getOracleConfig()` (or accept config) so `deploy.ts` can show config status.
  - In dry-run: log every intended `PutObjectCommand` (bucket + key) and the purge URLs,
    send nothing.

### `scripts/uploadToBunny.ts` (new)

Mirrors the Oracle uploader's shape:

- `getBunnyStorageConfig()` — reads from `.env.common` + env-specific file:
  `BUNNY_STORAGE_ACCESS_KEY`, `BUNNY_STORAGE_ZONE`, `BUNNY_STORAGE_ENDPOINT`,
  `BUNNY_STORAGE_REGION`. Returns `null` (with a logged reason) if any is missing, so a
  misconfigured Bunny target is skipped rather than crashing the whole deploy.
- Reuses the same `getBuildFiles()` / `getFilesRecursively()` file-discovery rules as the
  Oracle uploader. To avoid duplication, extract those two helpers into a small shared
  module `scripts/buildFiles.ts` and import from both uploaders.
- `S3Client` config for Bunny:
  ```ts
  new S3Client({
    region,                       // "de"
    endpoint,                     // "https://de-s3.storage.bunnycdn.com"
    credentials: { accessKeyId: BUNNY_STORAGE_ACCESS_KEY, secretAccessKey: BUNNY_STORAGE_ACCESS_KEY },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",   // Bunny rejects x-amz-checksum-* headers
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  ```
  > **Gotcha:** AWS SDK v3.835 defaults to `WHEN_SUPPORTED`, which adds a
  > `x-amz-checksum-crc32` header that Bunny's S3-compatible API rejects. The two
  > `*ChecksumCalculation`/`*Validation: WHEN_REQUIRED` options disable it. This is the
  > single most likely failure point — verify uploads actually succeed against QA first.
  >
  > **Bunny Storage auth:** the S3-compatible API uses the Storage Zone **password**
  > (the "Storage Access Key" from Slack) as **both** `accessKeyId` and `secretAccessKey`,
  > with the storage-zone name as the bucket. If v4 SigV4 auth is rejected by Bunny,
  > fall back to Bunny's native Storage HTTP API (`PUT https://<region>.storage.bunnycdn.com/<zone>/<path>`
  > with header `AccessKey: <storage key>`). Decide during implementation based on what QA accepts.
- `Bucket` = `BUNNY_STORAGE_ZONE` (`infolink`). `Key` = `<path>/<dist-relative-path>`
  where `<path>` is a selected path (already `cxr/<version>`).
- Content-type + cache-control: same rules as the Oracle uploader (static loader
  `gen_ext.min.js` → `no-cache`; hashed files → long immutable cache).
- After upload, call `purgeBunnyStorage(paths)`.
- Dry-run: log intended keys + purge URLs, send nothing.

### `scripts/bunnyPurge.ts` (extend)

Add a second purge function; keep the existing `purgeBunnyCDN` untouched.

```ts
/** Purges the new Bunny Storage pull-zone for the given cxr paths, reusing BUNNY_API_KEY. */
export async function purgeBunnyStorage(uploadPaths: string[]): Promise<void>
```

- Reads `BUNNY_API_KEY` (from `.env.common`) and `BUNNY_STORAGE_PULL_URL` (per-env).
- Returns early (logged, non-fatal) if either is missing.
- Purge URL per path: `${BUNNY_STORAGE_PULL_URL}/<clean-path>/*`.
- Reuses the existing `purgeBunnyUrls()` batching/rate-limit helper.

### `scripts/deploy.ts` (new entry point)

```
const targets = [
  { id: 'oracle', label: 'Oracle Object Storage', run: uploadBuildsToOracle },
  { id: 'bunny',  label: 'Bunny Storage',         run: uploadBuildsToBunny },
];
```

Flow:

1. Parse flags: `--interactive`, `--dry-run`.
2. Determine selected targets:
   - **Interactive:** `checkbox` of the two targets, **both checked by default**
     (`checked: true` on each choice); validate at least one selected.
   - **CI (default):** both targets.
3. Determine paths:
   - **Interactive:** existing per-run path checkbox from `S3_UPLOAD_PATHS`
     (shown once; same paths apply to each selected target since both use `cxr/<version>`).
   - **CI:** all `S3_UPLOAD_PATHS`.
4. For each selected target, `await target.run({ paths, dryRun })` inside its own
   try/catch so one target's failure is isolated and reported at the end.
5. Exit non-zero if any selected **upload** (not purge) failed.

## Environment variables

**`.env.common`** (+ `.env.common.example` with empty values):

```
# Bunny Storage (S3-compatible) — CXR build uploads
BUNNY_STORAGE_ACCESS_KEY=""   # Storage Zone password (from Slack)
BUNNY_STORAGE_ZONE="infolink"
BUNNY_STORAGE_ENDPOINT="https://de-s3.storage.bunnycdn.com"
BUNNY_STORAGE_REGION="de"
```

**`.env.qa` / `.env.production`** (+ `.example`s):

```
# Public pull-zone URL fronting the Bunny 'infolink' storage zone (for cache purge)
BUNNY_STORAGE_PULL_URL=""   # user-provided, e.g. https://infolink.b-cdn.net
```

`.example` files get the non-secret defaults (`infolink`, endpoint, region) and empty
strings for the secret / pull URL, following the existing example-file convention.

## package.json script changes

- `publish:oracle:qa` / `publish:oracle:prod` → renamed to `publish:qa` / `publish:prod`,
  each pointing at `scripts/deploy.ts` (CI mode: both targets). The `oracle` suffix is
  dropped since the script is no longer Oracle-only.
- `deploy:qa` / `deploy:prod` → updated to call `publish:qa` / `publish:prod`.
- Add interactive convenience scripts:
  `publish:interactive:qa` / `publish:interactive:prod` → `deploy.ts --interactive`.

## Testing

- No unit-test framework exists for these scripts; keep parity (no new harness).
- **Manual QA verification (required before merge):**
  1. `pnpm --filter @genuin/contextual-reels build:qa`
  2. Run deploy `--interactive --dry-run`; confirm both targets + correct keys/purge URLs
     are logged and nothing is sent.
  3. Run deploy `--interactive`, Bunny only; confirm objects appear under `cxr/1.0.0/` in
     the `infolink` zone and the purge returns HTTP 200.
  4. Run deploy `--interactive`, Oracle only; confirm unchanged Oracle behavior.
  5. Run CI mode (no flags); confirm both targets upload.

## Out of scope

- Any change to `web-sdk` deploy scripts.
- CDN/pull-zone provisioning in the Bunny dashboard (done externally).
- Automated tests for deploy scripts.
