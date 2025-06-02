import { execSync } from "child_process";

function validateWorkspaceDependencies() {
  console.log("🔍 Validating workspace dependencies...");

  try {
    execSync("pnpm exec syncpack list-mismatches", { stdio: "inherit" });
    console.log("✅ All dependencies are synchronized");
  } catch (error) {
    console.error("❌ Dependency mismatches found");
    process.exit(1);
  }
}

validateWorkspaceDependencies();
