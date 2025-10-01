# CSS Path Versioning for Web SDK

## Overview

The Web SDK now supports versioned CSS paths to allow different SDK versions to load CSS assets from version-specific directories.

## How It Works

### Default Behavior
- **Default CSS Path**: `/sdk/assets/web-sdk.css`
- When no version is specified, the CSS loads from the standard path

### Versioned Behavior
- **Versioned CSS Path**: `/sdk/{version}/assets/web-sdk.css`
- When a version is specified, the CSS loads from a version-specific subdirectory

## Usage

### During Deployment

When running deploy commands, you'll be prompted:

```bash
# For QA deployment
npm run deploy:qa

# For Production deployment
npm run deploy:prod
```

The deployment process includes these prompts:

1. **Version Bump Prompt** (existing)
   ```
   Do you want to bump the version? (y/n):
   ```

2. **CSS Path Version Prompt** (new)
   ```
   === CSS Path Configuration ===
   Configure CSS path for this deployment:
   • Leave empty for default path: /sdk/assets/
   • Enter version for versioned path: /sdk/{version}/assets/
   • Example: entering "2.0.0" will use /sdk/2.0.0/assets/

   Enter CSS path version (or press Enter to skip):
   ```

### Examples

**Example 1: Default Path**
- Input: (press Enter to skip)
- Result: CSS loads from `https://media.begenuin.com/sdk/assets/web-sdk.css`

**Example 2: Versioned Path**
- Input: `2.0.0`
- Result: CSS loads from `https://media.begenuin.com/sdk/2.0.0/assets/web-sdk.css`

**Example 3: Custom Version**
- Input: `v2.1.0-beta`
- Result: CSS loads from `https://media.begenuin.com/sdk/v2.1.0-beta/assets/web-sdk.css`

## Technical Implementation

### Environment Variable
- The CSS path version is stored in `SDK_VERSION_PATH` environment variable
- This variable is set during the deployment process and used during build

### Build Process
1. `npmVersionManager.ts` prompts for CSS path version
2. If provided, sets `SDK_VERSION_PATH` environment variable
3. Creates temporary `.env.deploy.tmp` file with the variable
4. Vite build process reads the environment variable
5. `loader.js` placeholders are replaced with actual values:
   - `__MEDIA_BASE_URL__` → environment-specific media URL
   - `__SDK_VERSION_PATH__` → version path (or empty for default)

### File Processing
- **Source**: `src/loader.js` with placeholders
- **Output**: `dist/gen_sdk.js` or `dist/gen_sdk.min.js` with resolved URLs
- **CSS URL Pattern**: `{MEDIA_BASE_URL}/sdk{VERSION_PATH}/assets/web-sdk.css`

## Deployment Strategy

### Recommended Workflow
1. Deploy CSS assets to versioned S3 paths first
2. Run deployment with matching version path
3. Verify CSS loads correctly from the versioned path

### S3 Structure
```
s3://bucket/sdk/
├── assets/                    # Default path
│   └── web-sdk.css
├── 2.0.0/                     # Versioned path
│   └── assets/
│       └── web-sdk.css
└── v2.1.0-beta/               # Custom versioned path
    └── assets/
        └── web-sdk.css
```

## Benefits

1. **Parallel Deployments**: Multiple SDK versions can coexist
2. **Rollback Safety**: Previous versions continue to work
3. **Testing**: Beta versions can use separate CSS assets
4. **Cache Control**: Version-specific paths enable better caching strategies
5. **Backward Compatibility**: Default behavior unchanged

## Migration

Existing deployments are unaffected:
- No changes required for current implementations
- Default behavior remains the same
- Version paths are opt-in during deployment