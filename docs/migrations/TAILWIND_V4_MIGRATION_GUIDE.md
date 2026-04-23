# Tailwind CSS v4 Migration Guide for Genuin Webapp

## Current Status

We've encountered some challenges with the initial migration to Tailwind CSS v4. The direct approach of changing all imports and configurations at once has resulted in styling issues.

## Recommended Step-by-Step Approach

### Phase 1: Prepare the Environment (Current Phase)
1. Install Tailwind CSS v4 and related packages
   ```bash
   pnpm --filter @genuin/webapp add -D tailwindcss@latest postcss@latest autoprefixer@latest
   ```

2. Install the new PostCSS plugin for Tailwind v4
   ```bash
   pnpm --filter @genuin/webapp add -D @tailwindcss/postcss
   ```

3. Use a hybrid PostCSS configuration that supports both v3 and v4 styles
   ```javascript
   module.exports = {
     plugins: {
       'tailwindcss': {}, // For v3 compatibility
       '@tailwindcss/postcss': {}, // For v4 support
       autoprefixer: {},
     },
   }
   ```

4. Keep the original Tailwind directives in your CSS
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### Phase 2: Update Theme Configuration
1. Update the Tailwind configuration to use v4 syntax but maintain v3 compatibility
2. Identify any deprecated utilities and prepare them for migration
3. Test each change incrementally to ensure styling remains consistent

### Phase 3: Migrate CSS Custom Properties
1. Replace direct color references with CSS variables where applicable
2. Update any custom utilities that might be affected by v4 changes
3. Test across multiple pages to ensure consistent styling

### Phase 4: Full Migration
1. Complete the transition to the v4 import syntax
   ```css
   @import "tailwindcss";
   ```
2. Remove v3 compatibility settings from the PostCSS config
3. Update any custom utilities to use the `@utility` directive instead of `@layer`
4. Fix any renamed utilities like `shadow-sm` to `shadow-xs`, etc.

### Phase 5: Optimize and Cleanup
1. Review all UI components for styling issues
2. Clean up any redundant CSS
3. Take advantage of v4 features like improved color systems

## Breaking Changes to Address

### Theme Function Changes
- In v4, `theme()` function syntax changes
  - Old: `theme('colors.red.500')`
  - New: `var(--color-red-500)` or `theme(--color-red-500)`

### Utility Renames
- `shadow-sm` → `shadow-xs`
- `shadow` → `shadow-sm`
- `rounded-sm` → `rounded-xs`
- `rounded` → `rounded-sm`
- `outline-none` → `outline-hidden`
- `ring` → `ring-3`

### Color Opacity Syntax
- Old: `bg-primary/50`
- New: `bg-primary/[0.5]`

## Testing Guidelines

1. Always run the development server after each change
2. Test various pages to ensure styling consistency
3. Prioritize testing complex UI components
4. Compare with screenshots of the previous version

## References

- [Official Tailwind CSS v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
