# Next.js 15 & React 19 Deployment Guide

This guide outlines the process for safely deploying the upgraded Genuin webapp with Next.js 15 and React 19.

## Pre-Deployment Checklist

Before deploying to any environment, ensure:

- [ ] All tests in the `UPGRADE_TESTING_CHECKLIST.md` have been completed
- [ ] React.FC components have been migrated to function declarations
- [ ] All useRef initializations have been updated for React 19 compatibility
- [ ] Sentry integration has been properly configured for Next.js 15
- [ ] Node.js 20.12.0+ is installed on all deployment targets

## Deployment Strategy

### 1. Staging Environment

Deploy to the staging environment first:

```bash
# Deploy to staging
npm run build
npm run start
```

Monitor for:

- Performance metrics
- Error rates
- Client-side exceptions
- Server-side exceptions

### 2. Canary Release (Optional)

If possible, perform a canary release to a subset of users:

```bash
# Example canary deployment with feature flags
CANARY=true npm run deploy
```

### 3. Production Deployment

Once staging and canary releases are confirmed stable:

```bash
# Production deployment
npm run build
npm run start
```

## Rollback Procedure

If issues are detected post-deployment:

1. Identify if the issue is related to Next.js 15, React 19, or a specific component
2. Prepare a hotfix if the issue is isolated and can be quickly resolved
3. If a hotfix is not feasible, roll back to the previous stable version

```bash
# Rollback command
git checkout [previous-stable-tag]
npm run build
npm run start
```

## Post-Deployment Monitoring

Watch these metrics closely for 24-48 hours after deployment:

- Client-side errors in Sentry
- Server-side errors in Sentry
- Performance metrics (Time to First Byte, Largest Contentful Paint)
- Memory usage patterns
- API response times
- User engagement metrics

## Known Issues and Workarounds

### React 19 Type Issues

- **Issue**: `React.FC` components may error with React 19 types
- **Workaround**: Convert to function declarations (use `scripts/react-fc-migration.sh`)

### Next.js 15 Instrumentation

- **Issue**: OpenTelemetry warnings with Sentry
- **Workaround**: Temporarily disabled in `instrumentation.ts`, to be re-enabled after addressing warnings

### useRef Null Initialization

- **Issue**: In React 19, useRef requires explicit null initialization
- **Workaround**: Update all useRef calls to include proper typing and null initialization
