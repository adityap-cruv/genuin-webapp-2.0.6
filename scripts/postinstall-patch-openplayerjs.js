/**
 * this script patches the openplayerjs library in node_modules
 * with custom player.js and ads.js files located in scripts/player.
 */

const fs = require("fs");
const path = require("path");

// Source files from scripts/player directory
const CUSTOM_PLAYER_JS = path.join(__dirname, "player", "player.js");
const CUSTOM_ADS_JS = path.join(__dirname, "player", "ads.js");

function findOpenPlayerJsRoot() {
  // Try normal resolution first
  try {
    const pkgJsonPath = require.resolve("openplayerjs/package.json");
    return path.dirname(pkgJsonPath);
  } catch (e) {}

  // pnpm layout fallback
  try {
    const pnpmDir = path.join(process.cwd(), "node_modules/.pnpm");
    if (fs.existsSync(pnpmDir)) {
      const entries = fs.readdirSync(pnpmDir);
      for (const e of entries) {
        if (e.startsWith("openplayerjs@")) {
          const candidate = path.join(
            pnpmDir,
            e,
            "node_modules",
            "openplayerjs"
          );
          if (fs.existsSync(candidate)) return candidate;
        }
      }
    }
  } catch (e) {}

  // direct node_modules fallback
  const direct = path.join(process.cwd(), "node_modules", "openplayerjs");
  if (fs.existsSync(direct)) return direct;

  return null;
}

function replaceFile(sourcePath, targetPath, fileName) {
  if (!fs.existsSync(sourcePath)) {
    console.warn(`Custom ${fileName} not found at ${sourcePath}; skipping.`);
    return false;
  }

  if (!fs.existsSync(targetPath)) {
    console.warn(`Target ${fileName} not found at ${targetPath}; skipping.`);
    return false;
  }

  // Create backup if it doesn't exist
  const backupPath = targetPath + ".genuin-patch.bak";
  try {
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(targetPath, backupPath);
      console.log(`Created backup: ${backupPath}`);
    }
  } catch (e) {
    console.warn(`Could not create backup of ${fileName}:`, e.message);
  }

  // Replace the file
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Replaced ${fileName} successfully.`);
    return true;
  } catch (e) {
    console.error(`Failed to replace ${fileName}:`, e.message);
    return false;
  }
}

(function main() {
  const openPlayerRoot = findOpenPlayerJsRoot();
  if (!openPlayerRoot) {
    console.warn(
      "openplayerjs not found in node_modules; skipping postinstall patch."
    );
    return;
  }

  console.log(`Found openplayerjs at: ${openPlayerRoot}`);

  // Define target paths
  const targetPlayerJs = path.join(openPlayerRoot, "dist", "esm", "player.js");
  const targetAdsJs = path.join(
    openPlayerRoot,
    "dist",
    "esm",
    "media",
    "ads.js"
  );

  let success = true;

  // Replace player.js
  if (!replaceFile(CUSTOM_PLAYER_JS, targetPlayerJs, "player.js")) {
    success = false;
  }

  // Replace ads.js
  if (!replaceFile(CUSTOM_ADS_JS, targetAdsJs, "ads.js")) {
    success = false;
  }

  if (success) {
    console.log("OpenPlayerJS patch completed successfully.");
  } else {
    console.warn("OpenPlayerJS patch completed with warnings.");
  }
})();
