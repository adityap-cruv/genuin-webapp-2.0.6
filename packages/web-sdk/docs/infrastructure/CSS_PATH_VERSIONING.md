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

2. **CSS Path Selection Prompt** (new)

   ````
   === CSS Path Configuration ===
   Select CSS path for this deployment:
   1. /sdk/assets/ (default)
   2. /sdk/v1/assets/
   3. /sdk/multi/assets/
   4. /sdk/multi-v2/assets/
   5. /sdk/v2/assets/
   6. /sdk/2.0.0/assets/

   Select path (1-6):
   ```### Examples
   ````

**Example 1: Default Path**

- Selection: `1` (/sdk/assets/)
- Result: CSS loads from `https://media.begenuin.com/sdk/assets/web-sdk.css`

**Example 2: Version 2.0.0**

- Selection: `6` (/sdk/2.0.0/assets/)
- Result: CSS loads from `https://media.begenuin.com/sdk/2.0.0/assets/web-sdk.css`

**Example 3: Multi-v2 Version**

- Selection: `4` (/sdk/multi-v2/assets/)
- Result: CSS loads from `https://media.begenuin.com/sdk/multi-v2/assets/web-sdk.css`

## Technical Implementation

### Environment Configuration

- Available paths are defined in `.env.common` as `S3_UPLOAD_PATHS`
- Current paths: `/sdk,/sdk/v1,/sdk/multi,/sdk/multi-v2,/sdk/v2,/sdk/2.0.0`
- The deployment script reads these paths and presents them as selectable options

### Environment Variable

- The CSS path version is stored in `SDK_VERSION_PATH` environment variable
- This variable is set during the deployment process and used during build

### Build Process

1. `npmVersionManager.ts` reads available paths from `S3_UPLOAD_PATHS`
2. Presents numbered selection menu to user
3. If a versioned path is selected, sets `SDK_VERSION_PATH` environment variable
4. Creates temporary `.env.deploy.tmp` file with the variable
5. Vite build process reads the environment variable
6. `loader.js` placeholders are replaced with actual values:
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
├── assets/                    # Default path (option 1)
│   └── web-sdk.css
├── v1/                        # Version 1 (option 2)
│   └── assets/
│       └── web-sdk.css
├── multi/                     # Multi version (option 3)
│   └── assets/
│       └── web-sdk.css
├── multi-v2/                  # Multi v2 (option 4)
│   └── assets/
│       └── web-sdk.css
├── v2/                        # Version 2 (option 5)
│   └── assets/
│       └── web-sdk.css
└── 2.0.0/                     # Specific version (option 6)
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
