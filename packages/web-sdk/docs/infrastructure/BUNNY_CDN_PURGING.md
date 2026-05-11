# Bunny CDN Cache Purging

This document explains the Bunny CDN cache purging functionality integrated into the web-sdk deployment process.

## Overview

The Bunny CDN purge functionality automatically clears cached files from Bunny CDN after successful S3 uploads, ensuring that users receive the latest SDK files without waiting for cache expiration.

## Configuration

### Environment Variables

Add the following environment variable to your `.env` files:

```bash
# Bunny CDN Configuration
BUNNY_API_KEY="your-bunny-api-key"
```

The `MEDIA_BASE_URL` from your existing configuration is used to construct the full CDN URLs for purging.

### Required Environment Variables by File

- `.env.qa`: For QA environment deployments
- `.env.production`: For production environment deployments
- `.env.development`: For development environment (if needed)

## Usage

### Automatic Purging (Recommended)

Bunny CDN cache purging is automatically triggered after successful S3 uploads when using the deployment scripts:

```bash
# QA deployment with automatic Bunny CDN purging
npm run deploy:qa

# Production deployment with automatic Bunny CDN purging
npm run deploy:prod

# Manual S3 upload with automatic Bunny CDN purging
npm run publish:s3:qa
npm run publish:s3:prod
```

### Manual Purging

You can also purge Bunny CDN cache manually using the standalone script:

```bash
# Interactive path selection
npm run purge:bunny:qa
npm run purge:bunny:prod

# Specific paths via command line
npm run purge:bunny:qa sdk/2.0.0
npm run purge:bunny:prod sdk sdk/2.0.0
```

## How It Works

### URL Construction

The system constructs purge URLs based on:

1. **Base URL**: Uses `MEDIA_BASE_URL` from environment configuration
2. **Upload Paths**: Uses the same paths selected during S3 upload
3. **Wildcard Pattern**: Appends `/*` to purge all files under each path

Examples:

- Upload path: `sdk/2.0.0` → Purge URL: `https://media.qa.begenuin.com/sdk/2.0.0/*`
- Upload path: `sdk` → Purge URL: `https://media.qa.begenuin.com/sdk/*`

### Rate Limiting

To comply with Bunny CDN's rate limits:

- Requests are processed in batches of 10 URLs
- 200ms delay between batches
- Comprehensive error handling for failed requests

### Error Handling

- Non-critical errors: Bunny CDN purge failures don't stop the deployment process
- Detailed logging: Success/failure status for each URL
- Graceful degradation: Missing configuration skips purging with warnings

## Files Created/Modified

### New Files

1. **`scripts/bunnyPurge.ts`**: Core Bunny CDN purge functionality
2. **`scripts/purgeBunnyStandalone.ts`**: Standalone purge script
3. **`BUNNY_CDN_PURGING.md`**: This documentation file

### Modified Files

1. **`scripts/uploadToS3.ts`**: Integrated automatic Bunny CDN purging
2. **`package.json`**: Added new npm scripts for manual purging
3. **`.env.*.example`**: Added `BUNNY_API_KEY` configuration

## API Reference

### Bunny CDN API

The purge functionality uses the Bunny CDN Purge API:

```
POST https://api.bunny.net/purge?async=false&url={encoded_url}
Headers:
  AccessKey: {your-api-key}
```

### Backend Compatibility

The implementation mirrors the backend's `invalidateBunnyCDN` function for consistency:

- Batch processing (10 URLs per batch)
- 200ms delays between batches
- Comprehensive error logging
- Rate limit compliance

## Troubleshooting

### Common Issues

1. **Missing API Key**

   ```
   ❌ Missing required Bunny CDN configuration
   ```

   Solution: Add `BUNNY_API_KEY` to your `.env` file

2. **Rate Limit Errors**
   - The system automatically handles rate limits with batching
   - If issues persist, increase the delay between batches in `bunnyPurge.ts`

3. **Network Timeouts**
   - Individual URL failures don't stop the entire process
   - Check network connectivity and API key validity

### Debug Information

The scripts provide comprehensive logging:

- Configuration validation
- URL construction details
- Individual purge request results
- Overall success/failure statistics

### Verification

To verify successful purging:

1. Check the console output for success confirmations
2. Test SDK loading from CDN URLs to confirm cache refresh
3. Monitor Bunny CDN dashboard for purge statistics

## Environment-Specific Behavior

- **QA**: Purges from `media.qa.begenuin.com`
- **Production**: Purges from `media.begenuin.com`
- **Development**: Uses QA configuration by default

The system automatically detects the environment and constructs appropriate URLs for purging.
