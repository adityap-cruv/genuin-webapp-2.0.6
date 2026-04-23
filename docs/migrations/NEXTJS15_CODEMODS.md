# Using Next.js 15 Codemods

Next.js provides official codemods to help with upgrading to new versions. These automated code transformations can save time and reduce errors when migrating to Next.js 15.

## Benefits of Using Codemods

1. **Consistency**: Codemods apply changes uniformly across your codebase
2. **Efficiency**: They automate repetitive tasks that would be time-consuming to do manually
3. **Reliability**: Official Next.js codemods are maintained by the Next.js team and follow best practices
4. **Comprehensive**: They can catch edge cases that might be missed during manual updates

## Recommended Codemods for Next.js 15 Upgrade

We've created a script (`apps/webapp/scripts/run-nextjs15-codemods.sh`) that runs the following codemods:

### 1. `app-dir-runtime-config-experimental-edge`

Transforms any route segment config with `runtime = 'experimental-edge'` to use `runtime = 'edge'` instead.

### 2. `next-async-request-api`

Updates dynamic APIs that are now asynchronous:

- `cookies()`
- `headers()`
- `draftMode()`
- `params` and `searchParams` in page components and route handlers

### 3. `next-request-geo-ip`

Replaces deprecated `geo` and `ip` properties on `NextRequest` with appropriate functions from `@vercel/functions`.

### 4. Built-in Font Codemod

Ensures all font imports use the built-in Next.js font system.

### 5. General Upgrade Codemod

Applies additional transformations recommended for Next.js 15.

## How These Complement Our Manual Changes

While we've already manually updated many components to handle async params and cookies, the codemods:

1. **Catch missed cases**: May identify components or files we missed
2. **Apply best practices**: Use the officially recommended patterns
3. **Add helpful type annotations**: Add appropriate TypeScript types for async APIs
4. **Handle edge cases**: Update code in complex scenarios

## Running the Codemods

To run all recommended codemods:

```bash
cd /Users/kunalshah/genuin/genuin-webapp-standalone
./apps/webapp/scripts/run-nextjs15-codemods.sh
```

After running the codemods, review the changes to ensure they're correct. The codemods will add comments like `// @next/codemod` in places where they couldn't automatically update the code and manual intervention is required.

## Post-Codemod Tasks

1. Review and test the changes made by codemods
2. Address any comments added by codemods that require manual intervention
3. Run the application tests to verify everything works as expected
4. Update any documentation to reflect changes made by codemods

## References

- [Next.js Codemods Documentation](https://nextjs.org/docs/app/guides/upgrading/codemods)
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15)
