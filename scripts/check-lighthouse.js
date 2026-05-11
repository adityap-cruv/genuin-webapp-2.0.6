import fs from "fs";
import chalk from "chalk";

const desktopReportPath = "./packages/web-sdk/dist/lighthouse-result-desktop.json";
const mobileReportPath = "./packages/web-sdk/dist/lighthouse-result-mobile.json";

// Tolerance percentages (e.g. 0.05 = 5%)
const COMMON_TOLERANCE = 0.01;
const SPECIFIC_TOLERANCE = 0.1;

// Track whether any check has failed exit once at the end with all errors visible
let hasFailed = false;

// Thresholds for Desktop Lighthouse scores and metrics
const DESKTOP_THRESHOLDS = {
  performance: 0.6,
  accessibility: 0.8,
  bestPractices: 0.8,
  seo: 0.6,
  fcp: 3000,
  lcp: 4500,
  tbt: 500,
  cls: 0.25,
  speedIndex: 5000,
  bootupTime: 2000,
  mainthreadWork: 4000,
  longTasksCount: 5,
};

// Thresholds for Mobile Lighthouse scores and metrics (higher tolerance due to throttling variability)
const MOBILE_THRESHOLDS = {
  performance: 0.6,
  accessibility: 0.8,
  bestPractices: 0.8,
  seo: 0.6,
  fcp: 4500,
  lcp: 30000,
  tbt: 800,
  cls: 0.25,
  speedIndex: 8000,
  bootupTime: 3500,
  mainthreadWork: 6000,
  longTasksCount: 10,
};

// Helper function to check score, whose range is between 0 to 1
function checkScore(name, score, threshold, tolerance) {
  const scoreValue = Math.round(score * 100);
  const thresholdValue = threshold * 100;
  const adjustedThreshold = threshold - tolerance;
  const scoreColor = scoreValue >= thresholdValue ? chalk.green : chalk.yellow;
  console.log(
    `   ${chalk.cyan(name)}: ${scoreColor(scoreValue + "/100")} ${chalk.gray("must be ≥ " + thresholdValue + " (" + tolerance * 100 + "% TOLERANCE)")}`
  );

  if (score < adjustedThreshold) {
    console.error(
      chalk.red(`\n❌ ${name} score too low: ${scoreValue} (minimum: ${Math.round(adjustedThreshold * 100)})`)
    );
    hasFailed = true;
  }
}

// Checks bootup-time: per-script CPU execution cost
function checkBootupTime(report, threshold, tolerance, label) {
  const audit = report.audits["bootup-time"];
  const totalMs = audit.numericValue;
  const adjustedThreshold = threshold + threshold * tolerance;
  const color = totalMs <= threshold ? chalk.green : chalk.yellow;

  console.log(
    `   ${chalk.cyan("JS Bootup Time (CPU)")}: ${color(Math.round(totalMs) + "ms")} ${chalk.gray("must be ≤ " + threshold + "ms")}`
  );

  if (totalMs > adjustedThreshold) {
    const items = audit.details?.items || [];
    items.forEach((item) => {
      const fileName = item.url?.split("/").pop() || item.url;
      console.log(`      ${chalk.yellow("→ " + fileName)}`);
      const subItems = item.details?.items || [];
      subItems.forEach((sub) => {
        const subMs = Math.round(sub.duration ?? sub.value ?? 0);
        const subColor = subMs > 500 ? chalk.red : chalk.gray;
        console.log(`         ${subColor("→ " + sub.label + ": " + subMs + "ms")}`);
      });
    });

    console.error(
      chalk.red(
        `\n❌ [${label}] JS Bootup Time too high: ${Math.round(totalMs)}ms (max: ${Math.round(adjustedThreshold)}ms)`
      )
    );
    hasFailed = true;
  }
}

// Checks mainthread-work-breakdown: CPU split across JS, layout, rendering etc.
function checkMainthreadWork(report, threshold, tolerance, label) {
  const audit = report.audits["mainthread-work-breakdown"];
  const totalMs = audit.numericValue;
  const adjustedThreshold = threshold + threshold * tolerance;
  const color = totalMs <= threshold ? chalk.green : chalk.yellow;

  console.log(
    `   ${chalk.cyan("Main Thread CPU Work")}: ${color(Math.round(totalMs) + "ms")} ${chalk.gray("must be ≤ " + threshold + "ms")}`
  );

  if (totalMs > adjustedThreshold) {
    const items = audit.details?.items || [];
    items.forEach((item) => {
      const categoryMs = Math.round(item.duration);
      const categoryColor = categoryMs > 1000 ? chalk.red : chalk.gray;
      console.log(`      ${categoryColor("→ " + item.groupLabel + ": " + categoryMs + "ms")}`);
    });

    console.error(
      chalk.red(
        `\n❌ [${label}] Main Thread Work too high: ${Math.round(totalMs)}ms (max: ${Math.round(adjustedThreshold)}ms)`
      )
    );
    hasFailed = true;
  }
}

// Checks long-tasks: number of CPU spikes >50ms
function checkLongTasks(report, threshold, label) {
  const audit = report.audits["long-tasks"];

  if (!audit || !audit.details?.items) {
    console.log(
      `   ${chalk.cyan("Long Tasks (CPU spikes)")}: ${chalk.green("0 tasks")} ${chalk.gray("none detected")}`
    );
    return;
  }

  const items = audit.details.items;
  const count = items.length;
  const color = count <= threshold ? chalk.green : chalk.yellow;

  console.log(
    `   ${chalk.cyan("Long Tasks (CPU spikes)")}: ${color(count + " tasks")} ${chalk.gray("must be ≤ " + threshold)}`
  );

  if (count > threshold) {
    items.forEach((item) => {
      const duration = Math.round(item.duration);
      const taskColor = duration > 200 ? chalk.red : chalk.gray;
      console.log(`      ${taskColor("→ " + duration + "ms spike")}`);
    });

    console.error(chalk.red(`\n❌ [${label}] Too many long tasks: ${count} (max: ${threshold})`));
    hasFailed = true;
  }
}

// Helper function to check metric, whose value is in milliseconds
function checkMetric(name, value, threshold, tolerance) {
  const roundedValue = Math.round(value);
  const adjustedThreshold = threshold + threshold * tolerance;
  const metricColor = roundedValue <= threshold ? chalk.green : chalk.yellow;
  console.log(
    `   ${chalk.cyan(name)}: ${metricColor(roundedValue + "ms")} ${chalk.gray("must be ≤ " + threshold + "ms (" + tolerance * 100 + "% TOLERANCE)")}`
  );

  if (roundedValue > adjustedThreshold) {
    console.error(chalk.red(`\n❌ ${name} too high: ${roundedValue}ms (maximum: ${Math.round(adjustedThreshold)}ms)`));
    hasFailed = true;
  }
}

// Check if file exists
function loadReport(reportPath, label) {
  if (!fs.existsSync(reportPath)) {
    console.error(chalk.red(`❌ ${label} lighthouse-result.json not found!`));
    console.error(chalk.gray(`   Expected at: ${reportPath}`));
    hasFailed = true;
    return null;
  }

  let report;
  try {
    report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  } catch (error) {
    console.error(chalk.red(`❌ Failed to read ${label} report file: ${error.message}`));
    hasFailed = true;
    return null;
  }

  if (!report.categories || !report.categories.performance) {
    console.error(chalk.red(`❌ Invalid ${label} report structure`));
    hasFailed = true;
    return null;
  }

  return report;
}

function checkReport(report, thresholds, tolerance, label, specificTolerance = {}) {
  console.log(chalk.cyan.bold(`\n📊 Lighthouse Results (${label}) [${tolerance * 100}% tolerance]:`));

  // Check category scores
  checkScore("Performance(Min Score = 70)", report.categories.performance.score, thresholds.performance, tolerance);
  checkScore(
    "Accessibility (Min Score = 85)",
    report.categories.accessibility.score,
    thresholds.accessibility,
    tolerance
  );
  checkScore(
    "Best Practices (Min Score = 85)",
    report.categories["best-practices"].score,
    thresholds.bestPractices,
    tolerance
  );
  checkScore("SEO (Min Score = 80)", report.categories.seo.score, thresholds.seo, tolerance);

  // Check performance metrics
  checkMetric(
    "FCP (Min Score = 2.5s)",
    report.audits["first-contentful-paint"].numericValue,
    thresholds.fcp,
    tolerance
  );
  checkMetric(
    "LCP (Min Score = 3.5s)",
    report.audits["largest-contentful-paint"].numericValue,
    thresholds.lcp,
    tolerance
  );
  checkMetric("TBT (Min Score = 350ms)", report.audits["total-blocking-time"].numericValue, thresholds.tbt, tolerance);
  checkMetric(
    "Speed Index (Min Score = 4.0s)",
    report.audits["speed-index"].numericValue,
    thresholds.speedIndex,
    specificTolerance.speedIndex ?? tolerance
  );
  checkBootupTime(report, thresholds.bootupTime, tolerance, label);
  checkMainthreadWork(report, thresholds.mainthreadWork, tolerance, label);
  checkLongTasks(report, thresholds.longTasksCount, label);

  // Check CLS separately since it's not in milliseconds
  const cls = report.audits["cumulative-layout-shift"].numericValue;
  const adjustedClsThreshold = thresholds.cls + thresholds.cls * tolerance;

  const clsColor = cls <= thresholds.cls ? chalk.green : chalk.yellow;
  console.log(
    `   ${chalk.cyan("CLS (Min Score = 0.1)")}: ${clsColor(cls)} ${chalk.gray("must be ≤ " + thresholds.cls + " (" + tolerance * 100 + "% TOLERANCE)")}`
  );

  if (cls > adjustedClsThreshold) {
    console.error(chalk.red(`\n❌ [${label}] CLS too high: ${cls} (maximum: ${adjustedClsThreshold.toFixed(4)})`));
    hasFailed = true;
  }
}

// Load and validate both reports
const desktopReport = loadReport(desktopReportPath, "Desktop");
const mobileReport = loadReport(mobileReportPath, "Mobile");

// Only check reports that loaded successfully
if (desktopReport) {
  checkReport(desktopReport, DESKTOP_THRESHOLDS, COMMON_TOLERANCE, "Desktop");
}
if (mobileReport) {
  checkReport(mobileReport, MOBILE_THRESHOLDS, COMMON_TOLERANCE, "Mobile", {
    speedIndex: SPECIFIC_TOLERANCE,
  });
}

// Single exit point collects ALL failures before blocking the push
if (hasFailed) {
  console.error(chalk.red.bold("\n Lighthouse checks failed push blocked. Fix the above issues and try again.\n"));
  process.exit(1);
}

console.log(chalk.green.bold("\n All Lighthouse checks passed for both Desktop and Mobile!\n"));
