#!/bin/bash
# Script to rollback from Next.js 15 and React 19 to Next.js 14.0.1 and React 18.2.0

echo "🔄 Rolling back to Next.js 14.0.1 and React 18.2.0..."

# Update core dependencies to previous versions
pnpm add next@14.0.1 react@18.2.0 react-dom@18.2.0 next-auth@5.0.0-beta.15

# Rollback React Query
pnpm add @tanstack/react-query@4.33.0 @tanstack/react-query-devtools@4.35.3

# Rollback React Hook Form
pnpm add react-hook-form@7.56.1

# Rollback ESLint and other dev dependencies
pnpm add -D @next/eslint-plugin-next@14.0.3 eslint-config-next@13.4.19 @types/react@18.2.21 @types/react-dom@18.2.7

# Rollback UI and state management libraries to compatible versions
pnpm add framer-motion@10.16.4 zustand@4.5.4 embla-carousel-react@8.0.0-rc22

echo "✅ Dependencies rolled back to previous versions!"
echo "⚠️ You may need to revert code changes manually."
