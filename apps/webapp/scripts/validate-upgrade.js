#!/usr/bin/env node
/**
 * This script validates the Next.js 15 and React 19 upgrade
 * by checking for common issues and configuration problems.
 */

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { execSync } = require('child_process')

// Configuration
const rootDir = path.resolve(__dirname, '..')
const src = path.join(rootDir, 'src')

console.log(chalk.blue('===== Next.js 15 & React 19 Upgrade Validator ====='))

// Check Node.js version
const nodeVersion = process.version
console.log(`Node.js version: ${nodeVersion}`)
if (!nodeVersion.startsWith('v20.')) {
  console.error(chalk.red('❌ Node.js version should be 20.x. Please upgrade.'))
} else {
  console.log(chalk.green('✅ Node.js version is compatible'))
}

// Check Next.js version
try {
  const packageJson = require(path.join(rootDir, 'package.json'))
  const nextVersion = packageJson.dependencies.next
  console.log(`Next.js version: ${nextVersion}`)

  if (!nextVersion.includes('15')) {
    console.error(chalk.red('❌ Next.js version should be 15.x'))
  } else {
    console.log(chalk.green('✅ Next.js version is 15.x'))
  }

  // Check React version
  const reactVersion = packageJson.dependencies.react
  console.log(`React version: ${reactVersion}`)

  if (!reactVersion.includes('19')) {
    console.error(chalk.red('❌ React version should be 19.x'))
  } else {
    console.log(chalk.green('✅ React version is 19.x'))
  }
} catch (e) {
  console.error(chalk.red('❌ Error reading package.json'))
}

// Check for React.FC usage
console.log('\nChecking for React.FC usage...')
try {
  const result = execSync('grep -r "React\\.FC" --include="*.tsx" src', { encoding: 'utf8' })
  const lines = result.split('\n').filter(Boolean)
  if (lines.length > 0) {
    console.error(chalk.red(`❌ Found ${lines.length} instances of React.FC:`))
    lines.slice(0, 5).forEach((line) => console.log(`  ${line}`))
    if (lines.length > 5) {
      console.log(`  ... and ${lines.length - 5} more`)
    }
    console.log('\nRun migration script to fix:')
    console.log('  ./scripts/react-fc-migration.sh')
  }
} catch (e) {
  if (e.status !== 1) {
    console.error(chalk.red(`❌ Error checking for React.FC: ${e.message}`))
  } else {
    console.log(chalk.green('✅ No React.FC usage found'))
  }
}

// Check for uninitialized useRef calls
console.log('\nChecking for uninitialized useRef calls...')
try {
  const result = execSync('grep -r "useRef()" --include="*.tsx" src', { encoding: 'utf8' })
  const lines = result.split('\n').filter(Boolean)
  if (lines.length > 0) {
    console.error(chalk.red(`❌ Found ${lines.length} instances of uninitialized useRef:`))
    lines.slice(0, 5).forEach((line) => console.log(`  ${line}`))
    if (lines.length > 5) {
      console.log(`  ... and ${lines.length - 5} more`)
    }
  }
} catch (e) {
  if (e.status !== 1) {
    console.error(chalk.red(`❌ Error checking for uninitialized useRef: ${e.message}`))
  } else {
    console.log(chalk.green('✅ No uninitialized useRef calls found'))
  }
}

// Check for instrumentation.ts
console.log('\nChecking instrumentation configuration...')
try {
  const instrExists = fs.existsSync(path.join(src, 'instrumentation.ts'))
  if (instrExists) {
    console.log(chalk.green('✅ instrumentation.ts exists'))

    const instrContents = fs.readFileSync(path.join(src, 'instrumentation.ts'), 'utf8')
    const hasSentry = instrContents.includes('Sentry')
    const isDisabled = instrContents.includes('Temporarily disabled')

    if (hasSentry && !isDisabled) {
      console.log(chalk.green('✅ Sentry is properly configured in instrumentation.ts'))
    } else if (isDisabled) {
      console.error(chalk.red('❌ Sentry is disabled in instrumentation.ts'))
    } else {
      console.error(chalk.yellow('⚠️ Sentry may not be properly configured in instrumentation.ts'))
    }
  } else {
    console.error(chalk.red('❌ instrumentation.ts is missing'))
  }
} catch (e) {
  console.error(chalk.red(`❌ Error checking instrumentation: ${e.message}`))
}

console.log('\n' + chalk.blue('===== Validation Complete =====') + '\n')
