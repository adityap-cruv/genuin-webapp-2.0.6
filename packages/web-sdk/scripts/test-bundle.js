const fs = require("fs");
const path = require("path");

const bundlePath = path.resolve(__dirname, "../dist/genuin-sdk.min.js");
const devBundlePath = path.resolve(__dirname, "../dist/genuin-sdk.js");

console.log("🔍 Validating Genuin SDK bundle...");

// Check which bundle exists
const isProduction = fs.existsSync(bundlePath);
const isDevelopment = fs.existsSync(devBundlePath);
const targetPath = isProduction ? bundlePath : devBundlePath;
const buildType = isProduction ? "production" : "development";

if (!isProduction && !isDevelopment) {
  console.error("❌ No bundle found!");
  console.error(`Expected: ${bundlePath} or ${devBundlePath}`);
  process.exit(1);
}

console.log(`✅ Found ${buildType} bundle: ${path.basename(targetPath)}`);

// Get bundle stats
const bundleStats = fs.statSync(targetPath);
const bundleSize = bundleStats.size;
const bundleSizeKB = Math.round(bundleSize / 1024);
const bundleSizeMB = (bundleSize / (1024 * 1024)).toFixed(2);

console.log(`📦 Size: ${bundleSizeKB} KB (${bundleSizeMB} MB)`);

// Size warnings
if (bundleSizeKB > 3000) {
  console.warn(`⚠️ Bundle is quite large (${bundleSizeKB} KB). Consider optimizations.`);
} else if (bundleSizeKB > 1500) {
  console.log(`💡 Bundle size is reasonable (${bundleSizeKB} KB)`);
} else {
  console.log(`🎉 Excellent bundle size (${bundleSizeKB} KB)`);
}

// Validate bundle content
const bundleContent = fs.readFileSync(targetPath, "utf-8");

// Expected exports and global variables
const expectedExports = [
  "GenuinSDK", // Main export name
  "window.GenuinSDK", // Global SDK access
  "window.genuin", // Legacy API
];

const expectedComponents = ["createCommunityEmbed", "createLoopEmbed", "createUserEmbed", "SDKProvider", "useSDK"];

const expectedLibraries = [
  // React should be bundled
  "React",
  "createElement",
  // Core functionality
  "useState",
  "useEffect",
  // Should have some bundled dependencies
  "uuid",
  "crypto",
];

let allValidationsPass = true;

console.log("\n🔍 Validating exports...");
expectedExports.forEach((exportName) => {
  if (bundleContent.includes(exportName)) {
    console.log(`✅ Found: ${exportName}`);
  } else {
    console.error(`❌ Missing: ${exportName}`);
    allValidationsPass = false;
  }
});

console.log("\n🔍 Validating SDK components...");
expectedComponents.forEach((component) => {
  if (bundleContent.includes(component)) {
    console.log(`✅ Found: ${component}`);
  } else {
    console.warn(`⚠️  Component may be missing: ${component}`);
  }
});

console.log("\n🔍 Validating bundled libraries...");
expectedLibraries.forEach((lib) => {
  if (bundleContent.includes(lib)) {
    console.log(`✅ Found: ${lib}`);
  } else {
    console.warn(`⚠️  Library may be missing: ${lib}`);
  }
});

// Check for potential issues
console.log("\n🔍 Checking for potential issues...");

if (bundleContent.includes("import(")) {
  console.warn("⚠️  Found dynamic imports - may break single bundle approach");
}

if (bundleContent.includes("require(")) {
  console.log("✅ CommonJS require calls found (normal for bundled dependencies)");
}

if (bundleContent.includes("use client") || bundleContent.includes("use server")) {
  console.warn("⚠️  React directives not stripped properly");
}

// Check if CSS is inlined
if (bundleContent.includes(".css") && !bundleContent.includes("style")) {
  console.warn("⚠️  CSS files may not be properly inlined");
} else if (bundleContent.includes("style") || bundleContent.includes("stylesheet")) {
  console.log("✅ CSS appears to be inlined");
}

// Summary
console.log("\n📊 Validation Summary:");
if (allValidationsPass) {
  console.log("🎉 Bundle validation passed!");
  console.log(`✨ Ready to deploy ${buildType} build (${bundleSizeKB} KB)`);
} else {
  console.warn("⚠️  Some validations failed, but bundle may still work");
}

// Performance recommendations
console.log("\n💡 Performance recommendations:");
if (bundleSizeKB > 2000) {
  console.log("- Consider code splitting for better loading performance");
  console.log("- Enable gzip compression on your server");
}
if (bundleSizeKB > 1000) {
  console.log("- Consider lazy loading non-critical components");
}
console.log("- Test loading performance across different network conditions");

process.exit(allValidationsPass ? 0 : 1);
