#!/usr/bin/env node
/**
 * Next.js 15 & React 19 Upgrade Progress Tracker
 *
 * This script provides a quick summary of the upgrade progress
 * and identifies areas that still need attention.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// ANSI colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
}

console.log(`${colors.cyan}====================================${colors.reset}`)
console.log(`${colors.cyan}Next.js 15 & React 19 Upgrade Status${colors.reset}`)
console.log(`${colors.cyan}====================================${colors.reset}`)
console.log('')

// Check Next.js and React versions
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  const nextVersion = packageJson.dependencies?.next || 'not found'
  const reactVersion = packageJson.dependencies?.react || 'not found'
  const reactDomVersion = packageJson.dependencies?.['react-dom'] || 'not found'

  console.log(`${colors.blue}Installed Versions:${colors.reset}`)
  console.log(`- Next.js: ${nextVersion.startsWith('15') ? colors.green : colors.red}${nextVersion}${colors.reset}`)
  console.log(`- React: ${reactVersion.startsWith('19') ? colors.green : colors.red}${reactVersion}${colors.reset}`)
  console.log(
    `- React DOM: ${reactDomVersion.startsWith('19') ? colors.green : colors.red}${reactDomVersion}${colors.reset}`
  )
  console.log('')
} catch (error) {
  console.error(`${colors.red}Error checking package versions: ${error.message}${colors.reset}`)
}

// Check Node.js version
try {
  const nvmrcPath = path.join(__dirname, '..', '.nvmrc')
  if (fs.existsSync(nvmrcPath)) {
    const requiredNodeVersion = fs.readFileSync(nvmrcPath, 'utf8').trim()
    const currentNodeVersion = process.version

    console.log(`${colors.blue}Node.js Version:${colors.reset}`)
    console.log(`- Required: ${requiredNodeVersion}`)
    console.log(
      `- Current: ${currentNodeVersion === requiredNodeVersion ? colors.green : colors.yellow}${currentNodeVersion}${colors.reset}`
    )
    console.log('')
  }
} catch (error) {
  console.error(`${colors.red}Error checking Node.js version: ${error.message}${colors.reset}`)
}

// Check for React.FC components
try {
  console.log(`${colors.blue}React.FC Components:${colors.reset}`)
  const reactFcCount = execSync('grep -r "React\\.FC" --include="*.tsx" ./src | wc -l', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  }).trim()

  console.log(
    `- Found: ${parseInt(reactFcCount) > 0 ? colors.yellow : colors.green}${reactFcCount} components${colors.reset}`
  )
  if (parseInt(reactFcCount) > 0) {
    console.log(`  Use: ${colors.cyan}./scripts/react-fc-migration.sh --interactive${colors.reset} to fix them`)
  }
  console.log('')
} catch (error) {
  console.error(`${colors.red}Error checking React.FC components: ${error.message}${colors.reset}`)
}

// Check for incorrect useRef usage
try {
  console.log(`${colors.blue}Uninitialized useRef:${colors.reset}`)
  const useRefCount = execSync('grep -r "useRef()" --include="*.tsx" ./src | grep -v "useRef<" | wc -l', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  }).trim()

  console.log(
    `- Found: ${parseInt(useRefCount) > 0 ? colors.yellow : colors.green}${useRefCount} instances${colors.reset}`
  )
  if (parseInt(useRefCount) > 0) {
    console.log(`  Replace with properly typed refs: ${colors.cyan}useRef<HTMLElement>(null)${colors.reset}`)
  }
  console.log('')
} catch (error) {
  console.error(`${colors.red}Error checking useRef usage: ${error.message}${colors.reset}`)
}

// Check for async API usage
try {
  console.log(`${colors.blue}Async Request API:${colors.reset}`)
  const codemodAppliedFiles = execSync('grep -r "@next/codemod" --include="*.tsx" ./src | wc -l', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  }).trim()

  console.log(
    `- Files with codemod comments: ${parseInt(codemodAppliedFiles) > 0 ? colors.yellow : colors.green}${codemodAppliedFiles}${colors.reset}`
  )
  if (parseInt(codemodAppliedFiles) > 0) {
    console.log(`  Review files with "${colors.cyan}@next/codemod${colors.reset}" comments`)
  }
  console.log('')
} catch (error) {
  console.error(`${colors.red}Error checking async API usage: ${error.message}${colors.reset}`)
}

// Next steps
console.log(`${colors.blue}Next Steps:${colors.reset}`)
console.log(
  `1. Run ${colors.cyan}./apps/webapp/scripts/turbopack-test.sh${colors.reset} to evaluate Turbopack performance`
)
console.log(
  `2. Review ${colors.cyan}SERVER_COMPONENTS_AND_PPR.md${colors.reset} and ${colors.cyan}REACT_COMPILER.md${colors.reset} for additional optimizations`
)
console.log(`3. Complete outstanding tasks in ${colors.cyan}UPGRADE_STATUS.md${colors.reset}`)
console.log(`4. Follow the testing checklist in ${colors.cyan}UPGRADE_TESTING_CHECKLIST.md${colors.reset}`)
console.log('')

console.log(`${colors.cyan}====================================${colors.reset}`)
