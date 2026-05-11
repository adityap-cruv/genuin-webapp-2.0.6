# Chunk Loading Analysis Report

**Date**: $(date)
**Analysis Method**: Browser Network Performance API + Build Analysis

## Current State

### Initial Load (on `genuin.init()`)

**✅ Good:**

- `gen_sdk.js`: 2.4KB (compressed) - Loader script
- `genuin-sdk-As40FX1O.js`: 782 bytes (compressed) - Main SDK entry point

**❌ Issues:**

- `index-BRA4cOEx.js`: 138KB compressed (~606KB uncompressed) - **TOO LARGE**
  - Loads immediately on init
  - Contains core SDK code + dependencies

### Immediate Vendor Chunk Loading (~30ms after init)

All vendor chunks load immediately after the index chunk:

- `vendor-animation-carousel`: 48KB compressed
- `vendor-radix`: 52KB compressed
- `vendor-react-query`: 47KB compressed
- `vendor-animation-motion`: 50KB compressed
- `vendor-analytics`: 60KB compressed
- `vendor-forms-validation`: 18KB compressed
- `vendor-utils`: 70KB compressed

**Total initial load**: ~138KB + ~345KB = **~483KB compressed** (~1.5MB+ uncompressed)

### Deferred Loading (after ~2.8 seconds)

The following chunks load when embed actually renders:

- `index-HJqWj5-y.js`: 192KB compressed (~981KB uncompressed) - Feed component
- `standard-wall-BBTFSZuT.js`: 123KB compressed (~920KB uncompressed) - Standard wall
- `select-C3jogA4C.js`: 90KB compressed (~373KB uncompressed)
- `vendor-forms-inputs`: 125KB compressed (~593KB uncompressed)
- `embed-BuMVlxhF.js`: 27KB compressed
- Other smaller chunks

## Performance Metrics

From browser performance API:

- **SDK Load Duration**: 218ms
- **Init Duration**: 2,698ms (2.7 seconds)
- **Embed Render Duration**: 120ms
- **Time to Interactive**: 2,916ms

## Root Cause Analysis

### Problem 1: Large Index Chunk

The `index-BRA4cOEx.js` chunk (606KB uncompressed) is too large because:

1. Core SDK code imports from `@genuin/components` which pulls in dependencies
2. `core/api.ts` imports `parseUserData` from react-query (now fixed - made lazy)
3. `core/context.tsx` imports React (now fixed - SDKProvider removed from exports)

### Problem 2: Immediate Provider Loading

Even though providers are lazy-loaded in `loadProviders()`, they load immediately because:

- `genuin.init()` → `initializeAllEmbeds()` → `loadNewEmbed()` → `loadProviders()`
- This happens synchronously during init, so all chunks load right away

### Problem 3: Chunk Size Issues

Some chunks are still too large:

- `index-HJqWj5-y.js`: 981KB uncompressed (should be <500KB)
- `standard-wall-BBTFSZuT.js`: 920KB uncompressed (should be <500KB)
- `vendor-forms-inputs`: 593KB uncompressed (should be <500KB)

## Optimizations Applied

### ✅ Completed

1. **Lazy Load React Providers**: Providers now load dynamically via `loadProviders()`
2. **Lazy Load parseUserData**: API service now dynamically imports react-query parser
3. **Remove SDKProvider Export**: Removed from index.ts to avoid pulling in React
4. **Chunk Splitting**: Vendor chunks split into smaller pieces:
   - `vendor-forms-core`, `vendor-forms-validation`, `vendor-forms-inputs`
   - `vendor-animation-motion`, `vendor-animation-carousel`, `vendor-animation-player`
   - `vendor-analytics` separated from `vendor-external`
5. **Selective Exports**: Replaced `export *` with named exports in index.ts
6. **Lazy CSS Loading**: CSS loads asynchronously after initial load

### ⚠️ Remaining Issues

1. **Index Chunk Still Too Large**: 606KB uncompressed
   - Need to identify what's pulling in dependencies
   - May need to further split core SDK code

2. **Immediate Loading**: All chunks load on init because embeds initialize immediately
   - This is expected behavior (embeds should load on init)
   - But we can optimize by:
     - Further reducing index chunk size
     - Ensuring only essential code loads on init

3. **Large Component Chunks**: Feed and Standard Wall chunks are still very large
   - May need further code splitting within these components

## Recommendations

### Short Term

1. **Analyze index chunk composition**: Use `rollup-plugin-visualizer` to see what's in `index-BRA4cOEx.js`
2. **Further split large chunks**: Break down `index-HJqWj5-y.js` and `standard-wall-BBTFSZuT.js`
3. **Optimize vendor-forms-inputs**: 593KB is still too large, consider splitting further

### Long Term

1. **Consider intersection observer**: Load embeds only when they're about to enter viewport
2. **Progressive enhancement**: Load skeleton first, then load full embed asynchronously
3. **Tree shaking**: Ensure unused code is eliminated from bundles

## Next Steps

1. Run `rollup-plugin-visualizer` to analyze chunk composition
2. Identify what's causing index chunk to be 606KB
3. Further optimize chunk splitting strategy
4. Measure improvements after optimizations
