# Upgrading to Next.js 15 and React 19

This guide outlines the steps taken to upgrade the Genuin webapp from Next.js 14.0.1 and React 18.2.0 to Next.js 15 and React 19.

## Key Changes

### 1. Node.js Version Requirements

- **Minimum Node.js version**: 20.12.0
- Node version is enforced via:
  - `.nvmrc` files
  - `package.json` engines field
  - `check-node-version.js` script

### 2. Core Dependencies Updated

```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "next-auth": "^5.0.0-beta.28",
  "@tanstack/react-query": "^5.74.4"
}
```

### 3. React 19 Component Changes

1. **React.FC Deprecated**:

   - Converted React.FC components to function declarations
   - Created migration script: `scripts/react-fc-migration.sh`

2. **useRef Initialization Required**:
   - All useRef calls updated with proper typing and null initialization
   - Example: `const myRef = useRef<HTMLDivElement>(null)`

### 4. Next.js 15 Configuration

```json
{
  "@tanstack/react-query": "^5.0.0",
  "@tanstack/react-query-devtools": "^5.0.0"
}
```

### 3. React Hook Form Updated

```json
{
  "react-hook-form": "^7.60.0"
}
```

### 4. Development Dependencies Updated

```json
{
  "@next/eslint-plugin-next": "^15.0.0",
  "eslint-config-next": "^15.0.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0"
}
```

### 5. Node Engine Requirements

Updated to support Next.js 15:

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### 6. TypeScript Configuration

Updated `tsconfig.json` for React 19:

```json
{
  "compilerOptions": {
    "target": "es2022",
    "verbatimModuleSyntax": true
    // other settings...
  }
}
```

### 7. React Type Definitions

Updated custom React type definitions in `types/react.d.ts`:

```typescript
declare module 'react' {
  // ReactNode definition for React 19
  export type ReactNode = React.ReactElement | string | number | boolean | null | undefined | Iterable<ReactNode>

  // FC type is deprecated in React 19, providing an alternative
  export type FC<P = {}> = React.FunctionComponent<P>
  export type FunctionComponent<P = {}> = (props: P) => React.ReactNode
}
```

### 8. Next-Auth Configuration

Updated Next-Auth configuration for v5:

- Modified `auth.config.ts` to use the new callbacks structure
- Updated `auth.ts` to use the new provider API
- Updated `types/next-auth.d.ts` for Next-Auth 5 type definitions

### 9. Next.js Middleware

Updated middleware structure for Next.js 15 in `middleware.ts`:

```typescript
export { auth }

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 10. React.FC Removal

Refactored components to remove the deprecated `React.FC` type:

```typescript
// Before
const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  // ...
}

// After
const Component = ({ prop1, prop2 }: Props) => {
  // ...
}
```

### 11. React Query Provider

Updated the React Query Provider for React 19's concurrent rendering:

```typescript
export const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          staleTime: 60 * 1000,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 12. Root Layout

Created an updated App Router layout with React 19 compatibility:

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
```

### 13. SwiperCore.use Replacement

Replaced deprecated `SwiperCore.use([Pagination])` with direct imports in Swiper components.

## Known Issues

1. Some compiler errors related to import paths need to be resolved
2. React 19 hook imports need to be updated in some files
3. Next.js 15 Image component has updated props that need to be addressed

## Next Steps

1. Run the application and address any runtime issues
2. Update deprecated APIs that weren't caught by static analysis
3. Test all critical user flows thoroughly
4. Update remaining components to utilize React 19 features like the `use` hook

## After Upgrading

### Testing

Use the `UPGRADE_TESTING_CHECKLIST.md` file to systematically test all aspects of the application after upgrading. Pay special attention to:

1. Authentication flows
2. Media playback
3. Server-side rendering
4. Form submissions
5. Client-side navigation

### Optimization Opportunities

Once the upgrade is complete and stable, consider taking advantage of these new features:

1. **Use React 19's new `use` hook** to simplify data fetching patterns
2. **Leverage improved Server Components** for better performance
3. **Take advantage of automatic batching** for state updates
4. **Implement enhanced error boundaries** for better error handling
5. **Use Next.js 15's improved image optimization** features

### Rollback Plan

If critical issues are encountered, use `rollback.sh` to revert to the previous versions and manually undo code changes.

## Resources

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/upgrading)
- [React 19 Release Notes](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023)
- [Next-Auth v5 Documentation](https://next-auth.js.org/getting-started/introduction)
- [TanStack Query v5 Migration Guide](https://tanstack.com/query/v5/docs/react/guides/migrating-to-v5)
- [React 19 `use` Hook Documentation](https://react.dev/reference/react/use)
