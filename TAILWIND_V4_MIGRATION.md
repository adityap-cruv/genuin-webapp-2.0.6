# Tailwind CSS v4 Migration Guide

This document outlines the steps taken to migrate the Genuin webapp from Tailwind CSS v3 to v4.

## Changes Made

1. **Updated Dependencies**
   - Updated Tailwind CSS to v4
   - Added `@tailwindcss/postcss` as a separate dependency (this replaces the direct PostCSS integration in Tailwind v3)
   - Updated related packages like `tailwindcss-animate` and `tailwind-merge`

2. **Configuration Changes**
   - Modified `tailwind.config.ts` to be compatible with v4:
     - Updated `darkMode` syntax to use `['class', '[data-mode="dark"]']` instead of just `['class']`
     - Properly imported `defaultTheme` from `tailwindcss/defaultTheme`
   - Updated PostCSS configuration to use `@tailwindcss/postcss` instead of `tailwindcss`

3. **Theme Value Resolution**
   - Fixed a theme resolution error in `globals.css` where direct theme values needed to be hardcoded

## Additional Changes Needed for Other Packages

1. **Update UI Package Configuration**:
   The UI package's PostCSS configuration in `packages/ui/postcss.config.mjs` already uses `@tailwindcss/postcss`, which is the correct format for Tailwind v4.

2. **Components Package**:
   Make sure the components package's PostCSS configuration is updated to use `@tailwindcss/postcss` if it directly depends on Tailwind.

## Breaking Changes to Watch For

1. **Color Opacity**: In v4, color opacity syntax has changed from `text-primary/50` to `text-primary/[0.5]`
2. **Arbitrary Properties**: The syntax for arbitrary properties has changed slightly
3. **CSS Variables**: Some CSS variable usage patterns may need to be updated
4. **PostCSS Plugin**: The PostCSS plugin is now a separate package

## Testing Recommendations

After completing the migration:

1. Test all UI components for proper styling
2. Check color opacity and gradient implementations
3. Verify responsive behavior
4. Ensure proper functioning of dark mode
5. Test any custom utility classes defined in the project

## References

- [Official Tailwind CSS v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
