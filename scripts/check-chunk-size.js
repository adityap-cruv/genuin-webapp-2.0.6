import chalk from "chalk";
import fs from "fs";
import path from "path";
import { execSync, spawn } from "child_process";

const ROOT = execSync("git rev-parse --show-toplevel", {
  encoding: "utf-8",
}).trim();

// size in kb
const MAX_GZIP_SIZE_KB = 1600;

// Size thresholds in KB
const SMALL_CHUNK_THRESHOLD_KB = 10;
const LARGE_CHUNK_THRESHOLD_KB = 30;

// Maximum allowed number of chunks
const MAX_CHUNK_COUNT = 90;

// Allow 1% over the limit
const TOLERANCE_PERCENT = 1;

const MAX_GZIP_SIZE_BYTES = MAX_GZIP_SIZE_KB * 1024;
const MAX_GZIP_SIZE_WITH_TOLERANCE = MAX_GZIP_SIZE_BYTES * (1 + TOLERANCE_PERCENT / 100);

const MAX_CHUNK_COUNT_TOLERANCE = Math.round(MAX_CHUNK_COUNT * (1 + TOLERANCE_PERCENT / 100));

const BUNDLE_FILE = path.join(ROOT, "packages/web-sdk/dist/bundle-size-report.json");

const bytesToKB = (bytes) => (bytes / 1024).toFixed(2);

function readBundleFile() {
  console.log(chalk.cyan("🔨 Generating bundle size report...\n"));

  // Generate the bundle size report by building the web-sdk
  const buildProcess = spawn("pnpm", ["build", "--filter=@genuin/web-sdk"], {
    stdio: "inherit",
  });

  return new Promise((resolve) => {
    buildProcess.on("close", (code) => {
      if (code === 0) {
        console.log(chalk.green("✅ Bundle size report generated successfully\n"));
        if (fs.existsSync(BUNDLE_FILE)) {
          resolve(JSON.parse(fs.readFileSync(BUNDLE_FILE, "utf-8")));
        } else {
          console.error(chalk.red("❌ Bundle file still not found after build"));
          process.exit(1);
        }
      } else {
        console.error(chalk.red("❌ Build failed, cannot generate bundle size report"));
        process.exit(1);
      }
    });

    buildProcess.on("error", (error) => {
      console.error(chalk.red(`❌ Build error: ${error.message}`));
      process.exit(1);
    });
  });
}

function getTotalEntry(bundleData) {
  const total = bundleData.find((item) => item.file === "TOTAL");
  if (!total) {
    console.error(chalk.red("❌ TOTAL entry not found in bundle report"));
    process.exit(1);
  }
  return total;
}

function calculateBundleStats(bundleData) {
  const chunks = bundleData.filter((item) => item.file !== "TOTAL");

  if (chunks.length === 0) {
    return null;
  }

  const invalidChunks = chunks.filter((item) => typeof item.sizeBytes !== "number");
  if (invalidChunks.length > 0) {
    console.error(chalk.red("❌ Invalid chunk data found in bundle report"));
    invalidChunks.forEach((chunk) => {
      console.error(chalk.red(`   - ${chunk.file} has invalid sizeBytes: ${chunk.sizeBytes}`));
      process.exit(1);
    });
  }

  const totalUncompressedBytes = chunks.reduce((sum, item) => sum + item.sizeBytes, 0);

  const avgChunkSizeBytes = totalUncompressedBytes / chunks.length;

  const smallChunks = chunks.filter((item) => item.sizeBytes / 1024 < SMALL_CHUNK_THRESHOLD_KB);
  const largeChunks = chunks.filter((item) => item.sizeBytes / 1024 > LARGE_CHUNK_THRESHOLD_KB);

  return {
    totalChunks: chunks.length,
    totalUncompressedBytes,
    avgChunkSizeBytes,
    smallChunksCount: smallChunks.length,
    largeChunksCount: largeChunks.length,
  };
}

function checkChunkCount(chunkCount) {
  console.log(
    `${chalk.cyan("Total Chunks:")} ${chunkCount} | ${chalk.cyan("Maximum Allowed:")} ${MAX_CHUNK_COUNT_TOLERANCE}`
  );

  if (chunkCount > MAX_CHUNK_COUNT_TOLERANCE) {
    const excess = chunkCount - MAX_CHUNK_COUNT_TOLERANCE;
    console.log(chalk.red(`⚠️  WARNING: Chunk count exceeded by ${excess} chunks`));
    return false;
  } else {
    console.log(chalk.green(`✅ Chunk count within limit`));
    return true;
  }
}

function printBundleStats(stats) {
  if (!stats) {
    return;
  }

  console.log(`${chalk.cyan("Total Size (uncompressed):")} ${bytesToKB(stats.totalUncompressedBytes)} KB`);
  console.log(`${chalk.cyan("Average Chunk Size:")} ${bytesToKB(stats.avgChunkSizeBytes)} KB`);
  console.log(`${chalk.cyan("Small chunks")} (<${SMALL_CHUNK_THRESHOLD_KB}KB): ${stats.smallChunksCount}`);
  console.log(`${chalk.cyan("Large chunks")} (>${LARGE_CHUNK_THRESHOLD_KB}KB): ${stats.largeChunksCount}`);
}

function printLargestFiles(bundleData, limit = 5) {
  console.log("\nLargest files in bundle:");

  bundleData
    .filter((item) => item.file !== "TOTAL")
    .sort((a, b) => b.gzipSizeBytes - a.gzipSizeBytes)
    .slice(0, limit)
    .forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.file}: ${bytesToKB(item.gzipSizeBytes)} KB`);
    });

  console.log("");
}

function printFailure() {
  console.log(chalk.bold(chalk.red("⚠️  BUNDLE SIZE EXCEEDED")));
  console.log("");
  console.log(chalk.cyan("The size of chunks is larger than expected."));
  console.log(chalk.cyan("Contact Web-SDK team for refactor."));
  console.log("");
  process.exit(1);
}

async function checkChunkSizes() {
  console.log("📦 Checking bundle size...\n");
  const bundleData = await readBundleFile();
  const { gzipSizeBytes } = getTotalEntry(bundleData);
  console.log(
    `  Current: ${bytesToKB(gzipSizeBytes)} KB | Max: ${MAX_GZIP_SIZE_KB} KB (with ${TOLERANCE_PERCENT}% tolerance: ${bytesToKB(MAX_GZIP_SIZE_WITH_TOLERANCE)} KB)\n`
  );

  const stats = calculateBundleStats(bundleData);

  checkChunkCount(stats.totalChunks);
  console.log("");
  printBundleStats(stats);
  printLargestFiles(bundleData);

  if (gzipSizeBytes > MAX_GZIP_SIZE_WITH_TOLERANCE) {
    printFailure();
  }

  console.log(chalk.green("✅ Gzipped bundle size within threshold\n"));
}

checkChunkSizes().catch((error) => {
  console.error(chalk.red(`❌ Error: ${error.message}`));
  process.exit(1);
});
