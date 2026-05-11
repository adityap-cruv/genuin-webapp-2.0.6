/**
 * Chunk Size Validation Script
 *
 * Validates chunk sizes against optimal limits for CI/CD integration.
 * Exits with error code if chunks exceed limits.
 */

import { readdir, stat } from "fs/promises";
import { resolve, join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = resolve(__dirname, "../dist");
const chunksDir = resolve(distDir, "chunks");

const MAX_CHUNK_SIZE = 500 * 1024; // 500KB
const MIN_CHUNK_SIZE = 20 * 1024; // 20KB
const MAX_INDEX_CHUNK_SIZE = 200 * 1024; // 200KB for index chunk
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB total (warning threshold)

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

async function validateChunks(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let totalSize = 0;

  // Validate chunks directory
  try {
    const files = await readdir(chunksDir);
    for (const file of files) {
      if (file.endsWith(".js")) {
        const filePath = join(chunksDir, file);
        const stats = await stat(filePath);
        const size = stats.size;
        totalSize += size;

        // Check index chunk specifically
        if (file.includes("index") && size > MAX_INDEX_CHUNK_SIZE) {
          errors.push(`Index chunk "${file}" is ${(size / 1024).toFixed(2)}KB (max: ${MAX_INDEX_CHUNK_SIZE / 1024}KB)`);
        }

        // Check max size
        if (size > MAX_CHUNK_SIZE) {
          errors.push(`Chunk "${file}" is ${(size / 1024).toFixed(2)}KB (max: ${MAX_CHUNK_SIZE / 1024}KB)`);
        }

        // Check min size (warning only)
        if (size < MIN_CHUNK_SIZE) {
          warnings.push(
            `Chunk "${file}" is ${(size / 1024).toFixed(2)}KB (min recommended: ${MIN_CHUNK_SIZE / 1024}KB) - consider merging`
          );
        }
      }
    }
  } catch (error) {
    errors.push(`Could not read chunks directory: ${error}`);
  }

  // Check total size
  if (totalSize > MAX_TOTAL_SIZE) {
    warnings.push(
      `Total chunk size is ${(totalSize / (1024 * 1024)).toFixed(2)}MB (warning threshold: ${MAX_TOTAL_SIZE / (1024 * 1024)}MB)`
    );
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

async function main() {
  try {
    const result = await validateChunks();

    if (result.warnings.length > 0) {
      console.log("⚠️  Warnings:");
      result.warnings.forEach((warning) => console.log(`  - ${warning}`));
      console.log();
    }

    if (result.errors.length > 0) {
      console.error("❌ Validation failed:");
      result.errors.forEach((error) => console.error(`  - ${error}`));
      process.exit(1);
    }

    console.log("✅ All chunk sizes are within limits!");
  } catch (error) {
    console.error("❌ Error validating chunks:", error);
    process.exit(1);
  }
}

main();
