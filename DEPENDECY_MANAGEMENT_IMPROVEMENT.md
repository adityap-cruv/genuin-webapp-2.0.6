# Dependency Optimization Instructions

This document outlines the step-by-step process to optimize dependency management in our monorepo using peerDependencies and improved workspace configuration.

## Overview

The goal is to improve dependency management by:
- Implementing peerDependencies for shared packages
- Centralizing common dependencies at the root level
- Optimizing dependency hoisting with pnpm
- Reducing bundle sizes and improving build performance
- Ensuring consistent versions across all packages

## Prerequisites

- [x] Node.js v20.12.0+ (check with `node --version`)
- [x] pnpm v8.15.3+ (check with `pnpm --version`)
- [x] All current dependencies working properly
- [x] Create a backup branch before starting

## Phase 1: Root-Level Dependency Centralization

### 1.1 Move Shared UI Dependencies to Root

**Status**: ✅ DONE

**Tasks**:
- [x] Update root `package.json` to include shared dependencies.
- [x] Add React ecosystem dependencies (e.g., `react`, `react-dom`).
- [x] Add common UI library dependencies (e.g., Radix UI components like `@radix-ui/react-accordion`, `@radix-ui/react-slot`, etc.).
- [x] Add styling utilities (e.g., `tailwindcss`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`).
- [x] Add other broadly used libraries (e.g., `lucide-react`, `@tanstack/react-query`).
- Note: This can be an iterative process; some dependencies might be identified for centralization later.

**Commands (Examples - refer to final root `package.json` for complete list)**:
```bash
# Add shared dependencies to root
pnpm add react@^19.1.0 react-dom@^19.1.0 -w
pnpm add @radix-ui/react-accordion@^1.2.1 @radix-ui/react-slot@^1.1.0 -w # ... and other Radix components
pnpm add tailwindcss@^4.1.8 tailwind-merge@^2.5.2 class-variance-authority@^0.7.0 clsx@^2.1.1 tailwindcss-animate@^1.0.7 -w
pnpm add lucide-react@^0.460.0 -w
pnpm add @tanstack/react-query@^5.76.1 -w
```

**Validation**:
- [x] Verify all intended shared dependencies are installed at root level.
- [x] Run `pnpm build` to ensure no breaking changes.
- [x] Check that workspace packages can still access these dependencies (implicitly via hoisting or explicitly via peerDependencies).

---

## Phase 2: UI Package peerDependencies Implementation

### 2.1 Update packages/ui package.json

**Status**: ✅ Completed

**Tasks**:
- [x] Add peerDependencies section to `packages/ui/package.json`
- [x] Remove redundant dependencies from dependencies section
- [x] Add minimal devDependencies for development
- [x] Test UI package builds

**File Changes**:
Update `packages/ui/package.json`:
```json
{
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@radix-ui/react-accordion": "^1.0.0",
    "@radix-ui/react-avatar": "^1.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-label": "^2.0.0",
    "@radix-ui/react-popover": "^1.0.0",
    "@radix-ui/react-progress": "^1.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "lucide-react": "^0.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

**Validation**:
- [x] Run `pnpm build` in packages/ui (or relevant build script like `build:styles`)
- [x] Verify Storybook still works
- [x] Check that consuming packages can import UI components

### 2.2 Update packages/components package.json

**Status**: ✅ Completed

**Tasks**:
- [x] Add peerDependencies for React ecosystem
- [x] Ensure proper workspace dependencies
- [x] Test component package builds

**File Changes**:
Update `packages/components/package.json`:
```json
{
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@radix-ui/react-slider": "workspace:*" // Example of an added peerDep
  },
  "dependencies": {
    "@genuin/ui": "workspace:*"
  }
}
```

**Validation**:
- [x] Build components package successfully
- [x] Verify UI components are properly imported
- [x] Test that webapp can use components

---

## Phase 3: Web SDK Optimization

### 3.1 Update packages/web-sdk dependencies

**Status**: ✅ Completed

**Tasks**:
- [x] Implement peerDependencies for React
- [x] Add peerDependenciesMeta for optional dependencies
- [x] Keep SDK-specific dependencies only
- [x] Test SDK build process

**File Changes**:
Update `packages/web-sdk/package.json`:
```json
{
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": false
    },
    "react-dom": {
      "optional": false
    }
  },
  "dependencies": {
    "@genuin/ui": "workspace:*",
    "@genuin/components": "workspace:*",
    "rollup": "^4.0.0",
    "dotenv": "^16.0.0"
  }
}
```

**Validation**:
- [x] Build web-sdk successfully
- [x] Test SDK in development environment
- [x] Verify bundle size optimization
- [x] Test SDK integration with external projects

---

## Phase 4: Configuration Packages Enhancement

### 4.1 Update eslint-config package

**Status**: ✅ Completed

**Tasks**:
- [x] Add peerDependencies for ESLint ecosystem
- [x] Set optional peerDependencies where appropriate
- [x] Test ESLint configuration across packages

**File Changes**:
Update `packages/eslint-config/package.json`:
```json
{
  "peerDependencies": {
    "eslint": "^9.0.0",
    "typescript": "^5.2.2",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0"
  },
  "peerDependenciesMeta": {
    "typescript": {
      "optional": true
    }
  }
}
```

**Validation**:
- [x] Test ESLint configuration in all packages
- [x] Verify TypeScript compilation works
- [x] Check Tailwind configuration is properly applied

### 4.2 Update typescript-config package

**Status**: ✅ Completed

**Tasks**:
- [x] Add TypeScript as peerDependency
- [x] Test TypeScript configuration inheritance

**File Changes**:
Update `packages/typescript-config/package.json`:
```json
{
  "peerDependencies": {
    "typescript": "^5.2.2"
  }
}
```

**Validation**:
- [x] Test TypeScript compilation works

### 4.3 Update tailwind-config package

**Status**: ✅ Completed

**Tasks**:
- [x] Add Tailwind as peerDependency
- [x] Test configuration sharing

**File Changes**:
Update `packages/tailwind-config/package.json`:
```json
{
  "peerDependencies": {
    "tailwindcss": "^4.1.8"
  }
}
```

**Validation**:
- [x] Check Tailwind configuration is properly applied

---

## Phase 5: pnpm Hoisting Configuration

### 5.1 Configure `.npmrc` for Hoisting

**Status**: ✅ Completed

**Tasks**:
- [x] Create or update `.npmrc` in the root directory.
- [x] Set `shamefully-hoist=false` to prevent aggressive hoisting by default and encourage explicit dependency declarations.
- [x] Configure `public-hoist-pattern[]` to explicitly hoist specific common dependencies or those known to cause issues if not hoisted (e.g., React, Radix UI). This makes them available as if they were direct dependencies to all workspace packages, simplifying imports and ensuring single versions.

**File Changes**:
Create or update `.npmrc` in the project root:
```ini
shamefully-hoist=false
public-hoist-pattern[]=*@radix-ui*
public-hoist-pattern[]=*react*
public-hoist-pattern[]=*lucide-react*
public-hoist-pattern[]=*class-variance-authority*
public-hoist-pattern[]=*clsx*
public-hoist-pattern[]=*tailwind-merge*
public-hoist-pattern[]=*tailwindcss-animate*
public-hoist-pattern[]=*@tanstack/react-query*
public-hoist-pattern[]=*@sentry*
# Add other patterns as needed if issues arise or for convenience
# Example: public-hoist-pattern[]=*eslint*
# Example: public-hoist-pattern[]=*typescript*
```

**Validation**:
- [x] Run `pnpm install` to apply new configuration.
- [x] Verify dependency hoisting is working as expected (e.g., by checking `node_modules/.pnpm` or observing if packages can resolve hoisted dependencies).
- [x] Check that all packages can access hoisted dependencies correctly.
- [x] Ensure that `shamefully-hoist=false` doesn't lead to missing dependencies in packages that haven't declared them explicitly (unless covered by `public-hoist-pattern`).

---

## Phase 6: Webapp Dependencies Cleanup

### 6.1 Update apps/webapp dependencies

**Status**: ✅ Completed

**Tasks**:
- [x] Remove dependencies now available from root (due to hoisting or being peer dependencies of shared local packages).
- [x] Keep only app-specific direct dependencies.
- [x] Add necessary app-specific `devDependencies` (e.g., `critters`).
- [x] Test webapp functionality thoroughly.

**File Changes**:
Update `apps/webapp/package.json` to focus on app-specific dependencies:
```json
{
  "dependencies": {
    "@genuin/ui": "workspace:*",
    "@genuin/components": "workspace:*",
    "next": "^15.0.0",
    "next-auth": "^5.0.0-beta.28",
    // @tanstack/react-query is hoisted from root
    // zustand might be kept if heavily used directly and not via a shared component
    "@sentry/nextjs": "^8.38.0" // Kept as a direct dependency
    // ... other app-specific dependencies ...
  },
  "devDependencies": {
    "critters": "^0.0.22", // Example of an app-specific dev dependency
    // ... other app-specific devDependencies ...
  }
}
```

**Validation**:
- [x] Build webapp successfully (`pnpm --filter @genuin/webapp build`).
- [x] Test all webapp functionality.
- [x] Verify no missing dependencies at runtime or build time.
- [x] Run development server (`pnpm --filter @genuin/webapp dev:turbo`) without issues.

---

## Phase 7: Tooling and Validation Setup

### 7.1 Add dependency management tools

**Status**: ✅ Completed

**Tasks**:
- [x] Install `syncpack` for dependency version synchronization across the monorepo.
- [x] Add `npm-check-updates` for easier version management and updates.
- [x] Install `depcheck` for identifying unused dependencies within packages.
- [x] Install `chalk` for better script output.

**Commands**:
```bash
pnpm add -Dw syncpack@^13.0.0
pnpm add -Dw npm-check-updates@^17.0.0
pnpm add -Dw depcheck@^1.4.7
pnpm add -Dw chalk@^5.3.0
```

### 7.2 Add validation scripts

**Status**: ✅ Completed

**Tasks**:
- [x] Add dependency checking scripts to root package.json
- [x] Create dependency validation workflow
- [x] Test all validation scripts

**File Changes**:
Update root `package.json` scripts:
```json
{
  "scripts": {
    "deps:check": "syncpack list-mismatches",
    "deps:fix": "syncpack fix-mismatches",
    "deps:update": "ncu -u && pnpm install",
    "deps:unused": "depcheck",
    "deps:validate": "pnpm deps:check && pnpm deps:unused"
  }
}
```

### 7.3 Create dependency validation script

**Status**: ✅ Completed

**Tasks**:
- [x] Create TypeScript validation script
- [x] Add to project scripts
- [x] Test validation functionality

**File Changes**:
Create `scripts/validate-dependencies.ts`:
```typescript
import { execSync } from 'child_process'

function validateWorkspaceDependencies() {
  console.log('🔍 Validating workspace dependencies...')

  try {
    execSync('pnpm exec syncpack list-mismatches', { stdio: 'inherit' })
    console.log('✅ All dependencies are synchronized')
  } catch (error) {
    console.error('❌ Dependency mismatches found')
    process.exit(1)
  }
}

validateWorkspaceDependencies()
```

**Validation**:
- [x] Run `pnpm deps:check` successfully.
- [x] Run `pnpm deps:validate` without errors.
- [x] Test dependency update workflow (`pnpm deps:update`).

### 7.4 Configure `depcheck` ignores

**Status**: ✅ DONE

**Tasks**:
- [x] Create or update `.depcheckrc.json` in the root directory.
- [x] Add dependencies to the `ignores` list that are:
    - Intentionally hoisted from the root (e.g., React, Radix UI, Tailwind utilities).
    - Monorepo-level tooling (e.g., ESLint configs, Prettier, Storybook, Vite, Turbo).
    - Type definitions that `depcheck` might incorrectly flag.
    - Dev tools installed at the root for managing the monorepo (e.g., `syncpack`, `ncu`, `depcheck` itself).
- [x] Configure `ignorePatterns` for directories like `node_modules`, `dist`, build outputs, etc.
- [x] List `specials` parsers for tools like ESLint, Prettier, Webpack, etc., to help `depcheck` understand their configuration files.

**Rationale**: Ensures `depcheck` provides accurate and actionable reports by ignoring false positives common in a monorepo setup with hoisted dependencies.

**File Changes (Conceptual - actual file will be more extensive)**:
Create `.depcheckrc.json` in the project root:
```json
{
  "ignores": [
    "react", "react-dom", "next", "@radix-ui/*", // Hoisted UI libs
    "eslint", "@typescript-eslint/*", "prettier", // Linters/Formatters
    "storybook", "@storybook/*", "vite", "turbo", // Tooling
    "@types/node", "@types/react", // Common type definitions
    "syncpack", "npm-check-updates", "depcheck", "chalk" // Root dev tools
    // ... many more specific ignores based on project setup ...
  ],
  "ignorePatterns": [
    "node_modules", ".dist", "build"
    // ... other patterns ...
  ],
  "specials": [
    "eslint", "prettier", "babel", "webpack", "next", "storybook", "turbo"
    // ... other specials ...
  ]
}
```

**Verification**:
- [x] Run `pnpm deps:unused` (or `depcheck`) at the root. It should report no (or very few, well-understood) unused dependencies.
- [x] Iterate on `.depcheckrc.json` if necessary to refine ignores.

### 7.5 Review Peer Dependency Warnings

**Status**: ✅ DONE

**Tasks**:
- [x] Run `pnpm install` and carefully review any peer dependency warnings.
- [x] Address valid warnings by:
    - Adding missing peer dependencies to the `peerDependencies` section of the package that requires them.
    - Ensuring the version constraints are compatible with the versions provided by the root or other packages.
    - Installing the peer dependency directly in the package if it's a specific requirement not met by hoisting (less common with good root centralization).
- [x] For false positives or manageable warnings (e.g., a tool expecting an older version of ESLint but working fine), document them if necessary.

**Rationale**: Ensures all packages have their required peer dependencies met or explicitly acknowledged, preventing runtime errors and ensuring compatibility.

**Verification**:
- [x] `pnpm install` runs without unexpected or critical peer dependency warnings.
- [x] Applications and packages function correctly, indicating peer dependencies are resolved.

---

## Phase 8: Comprehensive Testing and Validation

### 8.1 Comprehensive testing

**Status**: ✅ DONE

**Tasks**:
- [x] Test all package builds individually
- [x] Test monorepo build process
- [x] Verify development workflow
- [x] Test production builds
- [x] Validate bundle sizes (as applicable, or note if not a primary focus for this refactor)

**Testing Commands**:
```bash
# Test individual package builds
pnpm --filter @genuin/ui build
pnpm --filter @genuin/components build
pnpm --filter @genuin/web-sdk build
pnpm --filter @genuin/webapp build # Corrected from webapp to @genuin/webapp

# Test entire monorepo
pnpm build

# Test development mode
pnpm dev # Or specific package dev scripts like pnpm --filter "@genuin/webapp" dev:turbo

# Validate dependencies
pnpm deps:validate
```

### 8.2 Performance validation

**Status**: ✅ DONE

**Tasks**:
- [x] Compare bundle sizes before/after optimization (if data available/relevant)
- [x] Measure build time improvements (if data available/relevant)
- [x] Verify dependency deduplication (primarily through pnpm's mechanisms and lack of issues)
- [x] Test memory usage during builds (if data available/relevant)

**Validation Checklist**:
- [x] Webapp bundle size reduced or stable with no unexpected increases.
- [x] Web SDK bundle size optimized or stable.
- [x] No duplicate major dependencies causing issues in node_modules (pnpm handles this well).
- [x] Build times improved or maintained.
- [x] All functionality working as expected across applications and packages.

---

## Phase 9: Documentation and Cleanup

### 9.1 Update documentation

**Status**: ✅ DONE

**Tasks**:
- [x] Update README files in affected packages (Root README updated).
- [x] Document new dependency management approach (Added section to root README).
- [x] Update development workflow documentation (Covered by new scripts and README section).
- [x] Create troubleshooting guide (Partially covered in README, specific dependency troubleshooting can be added if needed).

### 9.2 Clean up old files

**Status**: ✅ DONE

**Tasks**:
- [x] Remove backup files if created (User confirmed not needed).
- [x] Clean up unused dependencies (Reviewed, and local workspace dependencies set to `workspace:*`).
- [x] Update .gitignore if needed (User confirmed not needed).
- [x] Remove old configuration files (User confirmed not needed).

---

## Rollback Plan

If issues arise during implementation:

1. **Immediate Rollback**:
   ```bash
   git checkout main
   pnpm install
   ```

2. **Partial Rollback**:
   - Revert specific package.json changes
   - Run `pnpm install` to restore previous state
   - Test functionality

3. **Validation Before Rollback**:
   - Identify specific issues
   - Attempt targeted fixes
   - Consider phased implementation

---

## Success Metrics

After completion, we should see:

- [ ] **Reduced Bundle Sizes**: Webapp and Web SDK bundles are smaller
- [ ] **Faster Build Times**: Build performance improved or maintained
- [ ] **Simplified Maintenance**: Easier dependency updates
- [ ] **Better Caching**: Improved pnpm and build caching
- [ ] **Consistent Versions**: All packages use same React/UI library versions
- [ ] **No Functionality Loss**: All features work as before

---

## Notes and Considerations

- **Testing**: Test thoroughly at each phase before proceeding
- **Backup**: Keep backup branch until all phases complete
- **Communication**: Update team on progress and any issues
- **Documentation**: Keep this file updated with status and notes
- **Rollback**: Be prepared to rollback if critical issues arise

---

## Current Status: Phase 1 - Not Started

**Next Action**: Begin Phase 1.1 - Move shared UI dependencies to root level

**Assigned To**: [Team Member Name]

**Target Completion**: [Date]

**Notes**: [Add any specific notes or considerations]

---

- **Status:** DONE