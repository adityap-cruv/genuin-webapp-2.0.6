#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { confirm, select, input } from "@inquirer/prompts";
import chalk from "chalk";

const __dirname = fileURLToPath(new URL("..", import.meta.url));

console.log(chalk.blue.bold("🔒 HTTPS Certificate Setup for Genuin Web SDK\n"));

// Check current certificate status
const mkcertKeyPath = resolve(__dirname, "cert/localhost+2-key.pem");
const mkcertCertPath = resolve(__dirname, "cert/localhost+2.pem");
const customKeyPath = resolve(__dirname, "cert/key.pem");
const customCertPath = resolve(__dirname, "cert/cert.pem");

const hasMkcert = existsSync(mkcertKeyPath) && existsSync(mkcertCertPath);
const hasCustom = existsSync(customKeyPath) && existsSync(customCertPath);

if (hasMkcert) {
  console.log(chalk.green("✅ mkcert certificates found! HTTPS is ready."));
  console.log(chalk.gray("   Certificates support localhost and network access."));
  process.exit(0);
}

if (hasCustom) {
  console.log(chalk.yellow("⚠️  Custom certificates found."));
  console.log(chalk.gray("   Note: These may only work for localhost."));

  const useCustom = await confirm({
    message: "Continue with existing custom certificates?",
    default: true,
  });

  if (useCustom) {
    console.log(chalk.green("✅ Using existing custom certificates."));
    process.exit(0);
  }
}

console.log(chalk.red("❌ No HTTPS certificates found.\n"));

// Check if mkcert is installed
let mkcertInstalled = false;
try {
  execSync("mkcert -version", { stdio: "ignore" });
  mkcertInstalled = true;
} catch (error) {
  mkcertInstalled = false;
}

const setupMethod = await select({
  message: "How would you like to set up HTTPS?",
  choices: [
    {
      name: "Install mkcert and generate trusted certificates (Recommended)",
      value: "mkcert",
      disabled: false,
    },
    {
      name: "Use HTTP instead (Skip HTTPS setup)",
      value: "http",
      disabled: false,
    },
    {
      name: "I have my own certificates",
      value: "custom",
      disabled: false,
    },
  ],
});

if (setupMethod === "http") {
  console.log(chalk.yellow("\n📝 Use these HTTP commands instead:"));
  console.log(chalk.cyan("   npm run serve:sdk:network           # HTTP on your network"));
  console.log(chalk.cyan("   npm run serve:sdk:qa:network        # QA HTTP on network"));
  console.log(chalk.cyan("   npm run serve:sdk:prod:network      # Prod HTTP on network"));
  console.log(chalk.gray("\n   These work immediately without certificates."));
  process.exit(0);
}

if (setupMethod === "custom") {
  console.log(chalk.yellow("\n📋 To use custom certificates:"));
  console.log(chalk.gray("   1. Create a cert/ directory"));
  console.log(chalk.gray("   2. Place your certificate files as:"));
  console.log(chalk.gray("      - cert/key.pem  (private key)"));
  console.log(chalk.gray("      - cert/cert.pem (certificate)"));
  console.log(chalk.gray("   3. Restart the HTTPS server"));
  process.exit(0);
}

// mkcert setup
console.log(chalk.blue("\n🔧 Setting up mkcert for trusted local certificates...\n"));

// Check if mkcert is installed
if (!mkcertInstalled) {
  console.log(chalk.yellow("📦 mkcert is not installed. Installing..."));

  const platform = process.platform;
  let installCommand = "";

  if (platform === "darwin") {
    // macOS
    try {
      execSync("brew --version", { stdio: "ignore" });
      installCommand = "brew install mkcert";
    } catch {
      console.log(chalk.red("❌ Homebrew not found. Please install Homebrew first:"));
      console.log(
        chalk.cyan('   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"')
      );
      process.exit(1);
    }
  } else if (platform === "linux") {
    installCommand =
      'curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64" && chmod +x mkcert-v*-linux-amd64 && sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert';
  } else {
    console.log(chalk.red("❌ Unsupported platform. Please install mkcert manually:"));
    console.log(chalk.cyan("   https://github.com/FiloSottile/mkcert#installation"));
    process.exit(1);
  }

  const shouldInstall = await confirm({
    message: `Install mkcert using: ${installCommand}?`,
    default: true,
  });

  if (!shouldInstall) {
    console.log(chalk.yellow("⏭️  Skipping installation. Please install mkcert manually."));
    process.exit(1);
  }

  try {
    console.log(chalk.blue("⏳ Installing mkcert..."));
    execSync(installCommand, { stdio: "inherit" });
    console.log(chalk.green("✅ mkcert installed successfully!"));
  } catch (error) {
    console.log(chalk.red("❌ Failed to install mkcert automatically."));
    console.log(chalk.yellow("   Please install manually: https://github.com/FiloSottile/mkcert#installation"));
    process.exit(1);
  }
}

// Get network IP
let networkIP = "192.168.1.100"; // default fallback
try {
  const networkInterfaces = execSync("ifconfig | grep \"inet \" | grep -v 127.0.0.1 | head -1 | awk '{print $2}'", {
    encoding: "utf8",
  }).trim();
  if (networkInterfaces) {
    networkIP = networkInterfaces;
  }
} catch {
  console.log(chalk.yellow("⚠️  Could not detect network IP automatically."));
}

const customIP = await input({
  message: "Enter your network IP address (or press Enter to use detected IP):",
  default: networkIP,
});

// Install mkcert CA
console.log(chalk.blue("\n🔐 Installing mkcert Certificate Authority..."));
try {
  execSync("mkcert -install", { stdio: "inherit" });
  console.log(chalk.green("✅ CA installed successfully!"));
} catch (error) {
  console.log(chalk.yellow("⚠️  CA installation may have failed. Continuing anyway..."));
}

// Create cert directory
const certDir = resolve(__dirname, "cert");
if (!existsSync(certDir)) {
  mkdirSync(certDir, { recursive: true });
  console.log(chalk.green("✅ Created cert/ directory"));
}

// Generate certificates
console.log(chalk.blue("\n📜 Generating certificates..."));
const certCommand = `mkcert -key-file cert/localhost+2-key.pem -cert-file cert/localhost+2.pem localhost 127.0.0.1 ::1 ${customIP}`;

try {
  execSync(certCommand, { stdio: "inherit", cwd: __dirname });
  console.log(chalk.green("\n✅ Certificates generated successfully!"));
  console.log(chalk.gray("   Files created:"));
  console.log(chalk.gray("   - cert/localhost+2-key.pem (private key)"));
  console.log(chalk.gray("   - cert/localhost+2.pem (certificate)"));
  console.log(chalk.gray(`   - Valid for: localhost, 127.0.0.1, ${customIP}`));
} catch (error) {
  console.log(chalk.red("❌ Failed to generate certificates."));
  console.log(chalk.yellow("   Please try manually:"));
  console.log(chalk.cyan(`   cd ${__dirname}`));
  console.log(chalk.cyan(`   ${certCommand}`));
  process.exit(1);
}

console.log(chalk.green.bold("\n🎉 HTTPS setup complete!"));
console.log(chalk.blue("\n📝 You can now use these HTTPS commands:"));
console.log(chalk.cyan("   npm run serve:sdk:https             # Development HTTPS"));
console.log(chalk.cyan("   npm run serve:sdk:qa:https          # QA HTTPS"));
console.log(chalk.cyan("   npm run serve:sdk:prod:https        # Production HTTPS"));

console.log(chalk.blue("\n🌐 Your server will be accessible at:"));
console.log(chalk.cyan("   https://localhost:3001"));
console.log(chalk.cyan(`   https://${customIP}:3001`));

console.log(chalk.gray("\n💡 Note: The certificates are trusted by your system,"));
console.log(chalk.gray("   so you won't see security warnings in your browser."));
