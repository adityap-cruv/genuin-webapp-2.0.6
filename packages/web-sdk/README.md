# Genuin Web SDK

## Environment Setup

This project uses different environment configurations for development, QA, and production. Follow these steps to set up your environment:

1. Copy the example environment files to create your local configurations:

```bash
cp .env.development.example .env.development
cp .env.qa.example .env.qa
cp .env.production.example .env.production
```

2. Update the environment files with your specific values:

- `.env.development`: Local development configuration
- `.env.qa`: QA environment configuration
- `.env.production`: Production environment configuration
- `.env.common`: Shared configuration across all environments (already included in repository)

3. Environment Variables:

Common Variables (`.env.common`, committed to repository):

- `ACCESS_TOKEN_KEY`: Key for storing access tokens
- `BRAND_ID_KEY`: Key for storing brand IDs
- `UNIQUE_USER_ID_KEY`: Key for storing unique user IDs
- `ENCRYPTION_IV`: Initialization vector for encryption
- `ENCRYPTION_KEY`: Key used for encryption
- `S3_UPLOAD_PATHS`: Comma-separated list of available S3 paths for publishing

Environment-specific Variables (need to be configured locally):

- `ENVIRONMENT`: Environment type ("prod", "qa")
- `DOMAIN`: Base domain for the environment
- `BASE_URL`: Base URL for the web application
- `API_BASE_URL`: Base URL for API calls
- `MEDIA_BASE_URL`: Base URL for media assets
- `RUDDERSTACK_URL`: RudderStack analytics URL
- `RUDDERSTACK_API_KEY`: RudderStack API key
- `ENCRYPTION_SALT`: Salt used for encryption
- `NEXT_PUBLIC_BCC_URL`: BCC (Brand Control Center) URL

AWS Configuration (for S3 publishing):

- `S3_BUCKET_NAME`: AWS S3 bucket name for the environment
- `S3_REGION`: AWS region where the bucket is located
- `AWS_ACCESS_KEY_ID`: AWS access key (leave empty if using AWS CLI configuration)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key (leave empty if using AWS CLI configuration)
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID for cache invalidation

4. Environment Validation:
   The project includes automatic environment validation that runs before builds and during development. If you see any validation errors:

- Check that you have the correct environment file for your target environment
- Ensure all required variables are properly set
- Contact your team lead if you need the correct values for any environment
- Run validation manually with: `npm run validate:env`

5. Building for different environments:

```bash
# Development build
npm run build

# QA build
npm run build:qa

# Production build
npm run build:prod
```

6. Publishing to S3:

If you have the necessary AWS permissions, you can publish the built files to S3 and invalidate CloudFront cache:

```bash
# Publish to QA environment
npm run publish:s3:qa

# Publish to Production environment
npm run publish:s3:prod
```

The publish process will:

- Prompt for confirmation before uploading
- Allow selection of target S3 paths
- Show upload progress for each file
- Automatically invalidate CloudFront cache after successful upload

AWS Credentials Setup:

1. Option 1 - AWS CLI Configuration (Recommended):

   - Configure your AWS credentials using `aws configure`
   - Leave `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` empty in environment files
   - The script will automatically use your AWS CLI credentials

2. Option 2 - Environment Variables:
   - Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in your environment files
   - Ensure the AWS user has necessary permissions:
     - `s3:PutObject` for the target buckets
     - `cloudfront:CreateInvalidation` for cache invalidation

Note: The environment-specific files (`.env.development`, `.env.qa`, `.env.production`) are not committed to the repository for security reasons. Only the example files and `.env.common` are included.

## Local Testing with Different Environments

You can test QA and Production environments locally using the following approaches:

### Method 1: Using Environment-specific Build Commands

```bash
# For QA Environment
npm run build:qa    # Builds with QA configuration
npm run dev:qa      # Runs development server with QA configuration

# For Production Environment
npm run build:prod  # Builds with Production configuration
npm run dev:prod    # Runs development server with Production configuration
```

### Method 2: Manual Environment Switching

1. First, ensure you have all environment files set up:

   ```bash
   .env.development  # Your local development settings
   .env.qa          # Your QA environment settings
   .env.production  # Your production environment settings
   .env.common      # Common settings (shared across environments)
   ```

2. To test a specific environment:

   ```bash
   # For QA testing
   cross-env NODE_ENV=qa npm run dev

   # For Production testing
   cross-env NODE_ENV=production npm run dev
   ```

### Environment Indicators

- The environment is displayed in the console when running the development server
- The SDK banner comment in the built files indicates the current environment:
  ```javascript
  /* Genuin Web SDK v1.2.8 - qa - Built on 2024-03-14T10:30:00.000Z */
  /* Genuin Web SDK v1.2.8 - production - Built on 2024-03-14T10:30:00.000Z */
  ```

### Important Notes

1. Version Management:

   - Development builds skip version management
   - QA and Production builds will prompt for version updates
   - Versioning is now managed through package.json using npm version management

2. Build Output:

   - Development: Generates unminified `dist/gen_sdk.js` with sourcemaps
   - QA/Production: Generates minified `dist/gen_sdk.min.js` without sourcemaps

3. Environment Variables:

   - Each environment uses its own `.env` file
   - Common variables are always loaded from `.env.common`
   - Environment-specific variables override common variables

4. S3 Publishing:
   - Each environment has its own S3 bucket and CloudFront distribution
   - Use `npm run publish:s3:qa` or `npm run publish:s3:prod` after building
   - AWS credentials can be configured in environment files or via AWS CLI

## Version Management

The SDK now uses npm version management instead of separate version files. The version is managed through the `package.json` file's version field and updated using standard npm versioning commands.

### Versioning Workflow

1. For development builds, versioning is disabled.
2. For QA and Production builds, you will be prompted to update the version during the build process.
3. To manually update the version, you can run:
   ```
   npm run version:bump
   ```

### Build Commands

- Development build: `npm run build`
- QA build: `npm run build:qa`
- Production build: `npm run build:prod`

The build process will:

1. Prompt for version update (for QA/Production builds)
2. Update the version in package.json
3. Build the SDK with the updated version
4. Upload to S3 if configured

### How Versioning Works

- The version is stored in a single location: the `version` field in `package.json`
- During the build process, Rollup reads this version and injects it directly into the built files.
- This makes the version accessible to your code via direct import from `package.json`.
- The version is also included in the banner comment of the built files.

This approach provides a single source of truth for versioning and follows standard npm practices.
