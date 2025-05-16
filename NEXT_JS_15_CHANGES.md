# Next.js 15 Upgrade Changes

This document summarizes the changes made to upgrade from Next.js 14 to Next.js 15.

## Async Request APIs

Updated the following components to handle async params and searchParams:

1. `/apps/webapp/src/app/(site)/brand/[nickname]/page.tsx`
2. `/apps/webapp/src/app/(site)/(platform-discovery)/@desktop/group/[slug]/page.tsx`
3. `/apps/webapp/src/app/(site)/profile/[nickname]/page.tsx`
4. `/apps/webapp/src/app/(site)/(platform-discovery)/@desktop/community/[slug]/page.tsx`
5. `/apps/webapp/src/app/(site)/(platform-discovery)/@desktop/question/[id]/page.tsx`
6. `/apps/webapp/src/app/(site)/(platform-discovery)/@mobile/group/[slug]/page.tsx`
7. `/apps/webapp/src/app/(site)/(platform-discovery)/@mobile/question/[id]/page.tsx`
8. `/apps/webapp/src/app/(site)/(platform-discovery)/@mobile/community/[slug]/page.tsx`

All components were updated to:

- Change params from `{ params: { slug: string } }` to `{ params: Promise<{ slug: string }> }`
- Use `const resolvedParams = await params` to resolve the promise
- Update all references to `params.xyz` to `resolvedParams.xyz`

## Fetch Caching

Next.js 15 no longer caches fetch requests by default. Updated the fetch requests in:

1. `/apps/webapp/src/lib/api/config.ts` - Added `{ cache: 'no-store' }` to all fetch requests

## Route Handlers

Updated route handler caching configuration:

1. `/apps/webapp/src/app/(api)/api/auth/[...nextauth]/route.ts` - Added `export const dynamic = 'force-dynamic'`

## Client-side Router Cache

Next.js 15 changes how page segments are reused from the client-side router cache. Updated:

1. `/apps/webapp/next.config.js` - Added `staleTimes` configuration to experimental options:
   ```javascript
   staleTimes: {
     dynamic: 30,  // 30 seconds for dynamic segments
     static: 180,  // 180 seconds for static segments
   }
   ```

## React 19 Features

- Confirmed that proper React 19 TypeScript definitions are used throughout the project
- Proper handling of component types with full TypeScript typing
- Use of proper typing for refs with specific HTML element types

## Other Changes

- Ensured Sentry integration is compatible with Next.js 15
- Removed instrumentationHook configuration (no longer needed in Next.js 15)
- Updated OpenTelemetry support with proper Next.js 15 integration

To verify that the upgrade is complete, make sure to test the application thoroughly, especially focusing on:

1. Page navigation
2. Data fetching
3. API routes
4. Server components
5. Client components
6. Search functionality and parameter handling

## Next.js 15 Performance Optimizations

Next.js 15 introduces several performance optimizations that we've prepared for integration:

### 1. Turbopack Integration

Next.js 15 includes improved Turbopack integration for development, offering faster refresh rates and compilation times compared to Webpack.

#### Testing Turbopack

We've added a script to test and evaluate Turbopack performance:

```bash
# From the webapp directory
./scripts/turbopack-test.sh
```

#### Turbopack Benefits

- Faster development server startup
- Improved Hot Module Replacement (HMR)
- Better incremental compilation
- Optimized for Next.js App Router

See the `TURBOPACK_INTEGRATION.md` document for more details on Turbopack integration, performance metrics, and compatibility.

### 2. React Server Components & Partial Prerendering

Next.js 15 enhances React Server Components and introduces Partial Prerendering (PPR):

- Improved server component architecture
- Better caching and streaming
- Partial Prerendering for optimal static/dynamic content delivery

Configuration has been prepared in next.config.js:

```javascript
experimental: {
  // Enable PPR when ready to implement
  // ppr: true,
}
```

See `SERVER_COMPONENTS_AND_PPR.md` for implementation details and optimization strategies.

### 3. React Compiler

Next.js 15 includes support for the React Compiler (formerly Rust Compiler):

- Automatic component optimization
- Reduced need for manual memoization
- Improved rendering performance

Configuration has been prepared in next.config.js:

```javascript
experimental: {
  // Enable React Compiler for production
  // reactCompiler: process.env.NODE_ENV === 'production',
}
```

See `REACT_COMPILER.md` for implementation details and usage guidelines.

Refer to the official [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15) for additional details.
