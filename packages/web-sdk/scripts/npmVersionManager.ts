#!/usr/bin/env node
import { execSync } from "child_process";
import readline from "readline";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.common
const commonEnvFile = path.resolve(process.cwd(), ".env.common");
if (fs.existsSync(commonEnvFile)) {
  dotenv.config({ path: commonEnvFile, override: false });
}

type VersionType = "major" | "minor" | "patch";

function createPrompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function promptVersion() {
  const NODE_ENV = process.env.NODE_ENV || "development";

  // For development environment, just show info message and exit
  if (NODE_ENV === "development") {
    console.log("\n\x1b[36mℹ Version management is disabled for development environment\x1b[0m");
    console.log("\x1b[36mℹ Use QA or Production builds for version management\x1b[0m\n");
    return;
  }

  // Read current version info from package.json
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const currentVersion = packageJson.version;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n\x1b[36m=== Version Management ===\x1b[0m");
  console.log(`Current version: \x1b[33m${currentVersion}\x1b[0m`);
  console.log(`Environment: \x1b[33m${NODE_ENV}\x1b[0m\n`);

  const shouldBump = await createPrompt(rl, "Do you want to bump the version? (y/n): ");

  if (shouldBump === "y") {
    console.log("\nSelect version bump type:");
    console.log("1. major (x.0.0) - Breaking changes");
    console.log("2. minor (0.x.0) - New features");
    console.log("3. patch (0.0.x) - Bug fixes\n");

    const bumpType = await createPrompt(rl, "Enter your choice (1-3): ");
    let versionType: VersionType = "patch";

    switch (bumpType) {
      case "1":
        versionType = "major";
        break;
      case "2":
        versionType = "minor";
        break;
      case "3":
        versionType = "patch";
        break;
      default:
        console.log("\x1b[33m⚠ Invalid choice. Using patch version bump.\x1b[0m\n");
    }

    try {
      // Use npm version command to bump the version
      console.log(`\nUpdating version (${versionType})...`);
      execSync(`npm version ${versionType} --no-git-tag-version`);

      // Read the new version
      const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const newVersion = updatedPackageJson.version;

      console.log("\n\x1b[32m✓ Version updated successfully\x1b[0m");
      console.log(`Previous version: \x1b[33m${currentVersion}\x1b[0m`);
      console.log(`New version: \x1b[32m${newVersion}\x1b[0m\n`);
    } catch (error) {
      console.error("\n\x1b[31m❌ Error updating version:\x1b[0m");
      console.error(error);
    }
  } else {
    console.log("\n\x1b[36mℹ Version bump skipped\x1b[0m\n");
  }

  // Prompt for CSS path selection
  console.log("\x1b[36m=== CSS Path Configuration ===\x1b[0m");

  // Read available S3 upload paths from environment
  const s3UploadPaths = process.env.S3_UPLOAD_PATHS || "/sdk";
  const availablePaths = s3UploadPaths.split(",").map((path) => path.trim());

  console.log("Select CSS path for this deployment:");
  availablePaths.forEach((path, index) => {
    const displayPath = path === "/sdk" ? `${path}/assets/` : `${path}/assets/`;
    const description = path === "/sdk" ? " (default)" : "";
    console.log(`${index + 1}. ${displayPath}${description}`);
  });
  console.log();

  const pathChoice = await createPrompt(rl, `Select path (1-${availablePaths.length}): `);

  const choiceIndex = parseInt(pathChoice) - 1;
  if (choiceIndex >= 0 && choiceIndex < availablePaths.length) {
    const selectedPath = availablePaths[choiceIndex];

    if (selectedPath === "/sdk") {
      // Default path - no version path needed
      const tempEnvFile = path.resolve(process.cwd(), ".env.deploy.tmp");
      if (fs.existsSync(tempEnvFile)) {
        fs.unlinkSync(tempEnvFile);
      }
      console.log("\n\x1b[32m✓ Selected default CSS path\x1b[0m");
      console.log("CSS will be loaded from: \x1b[36m/sdk/assets/web-sdk.css\x1b[0m\n");
    } else {
      // Extract version from path (everything after /sdk/)
      const versionPath = selectedPath.replace("/sdk/", "").replace("/sdk", "");

      // Set environment variable for the build process
      process.env.SDK_VERSION_PATH = versionPath;

      // Also write to a temporary file that can be sourced by the build process
      const tempEnvFile = path.resolve(process.cwd(), ".env.deploy.tmp");
      fs.writeFileSync(tempEnvFile, `SDK_VERSION_PATH=${versionPath}\n`);

      console.log(`\n\x1b[32m✓ CSS path version set to: ${versionPath}\x1b[0m`);
      console.log(`CSS will be loaded from: \x1b[36m${selectedPath}/assets/web-sdk.css\x1b[0m\n`);
    }
  } else {
    // Invalid choice - use default
    const tempEnvFile = path.resolve(process.cwd(), ".env.deploy.tmp");
    if (fs.existsSync(tempEnvFile)) {
      fs.unlinkSync(tempEnvFile);
    }
    console.log("\n\x1b[33m⚠ Invalid choice. Using default CSS path: /sdk/assets/web-sdk.css\x1b[0m\n");
  }

  rl.close();
}

// If script is run directly
if (require.main === module) {
  promptVersion().catch(console.error);
}

export default promptVersion;
