# Optimizing Package Imports in Next.js 15

This document outlines how to optimize package imports in Next.js 15 using the `optimizePackageImports` configuration.

## What is Package Import Optimization?

Next.js 15 includes a feature that automatically transforms imports from specific libraries into more efficient, granular imports. This reduces the amount of JavaScript sent to the client by only including the components you're actually using.

## Current Configuration

We've already enabled this optimization for several UI libraries in our project:

```javascript
// next.config.js
experimental: {
  optimizePackageImports: [
    '@radix-ui/react-accordion',
    '@radix-ui/react-avatar',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-label',
    '@radix-ui/react-popover',
    '@radix-ui/react-progress',
    '@radix-ui/react-select',
    '@radix-ui/react-tabs',
    'lucide-react',
  ],
}
```

## How It Works

Without optimization:

```typescript
import { Button, Card, Input } from 'ui-library';
// ^ This might import the entire library even if you're only using a few components
```

With optimization:

```typescript
// Automatically transformed at build time to:
import { Button } from 'ui-library/button';
import { Card } from 'ui-library/card';
import { Input } from 'ui-library/input';
```

## Recommended Additional Libraries for Optimization

Consider adding these libraries to our `optimizePackageImports` configuration:

1. Common UI component libraries:

   - `@mui/material`
   - `@mui/icons-material`
   - `@heroicons/react`
   - `@headlessui/react`
   - `framer-motion`
   - `react-icons`

2. Data/state management libraries with component imports:

   - `react-table`
   - `react-hook-form`
   - `swr`

3. Date/time libraries:
   - `date-fns`
   - `dayjs`

## Implementation Strategy

1. **Analyze Bundle Size**: Use tools like `@next/bundle-analyzer` to identify large imports
2. **Prioritize Heavy Libraries**: Focus on libraries that contribute the most to bundle size
3. **Test Compatibility**: Verify that the library works with this optimization
4. **Measure Impact**: Compare bundle size before and after optimization

## Example Enhanced Configuration

```javascript
// next.config.js
experimental: {
  optimizePackageImports: [
    // UI Component Libraries
    '@radix-ui/react-accordion',
    '@radix-ui/react-avatar',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-label',
    '@radix-ui/react-popover',
    '@radix-ui/react-progress',
    '@radix-ui/react-select',
    '@radix-ui/react-tabs',
    'lucide-react',
    '@headlessui/react',

    // Icon Libraries
    'react-icons/ai',
    'react-icons/bi',
    'react-icons/fi',
    'react-icons/hi',
    'react-icons/md',

    // Date/Time Utilities
    'date-fns',

    // Other Libraries
    'react-hook-form',
  ],
}
```

## Measuring the Impact

To measure the impact of package import optimization, enable the bundle analyzer:

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Your existing config
});
```

Then run your build with analysis enabled:

```bash
ANALYZE=true pnpm build
```

This will generate visualizations of your bundle size that you can use to verify improvements.

## Verifying Compatibility

Some libraries might not be compatible with this optimization. To verify:

1. Add the library to the `optimizePackageImports` array
2. Run your application in development mode
3. Test all functionality that uses components from that library
4. Check the browser console for any import-related errors

If you encounter issues, remove the library from the optimization list.

## Resources

- [Next.js Documentation: optimizePackageImports](https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports)
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
