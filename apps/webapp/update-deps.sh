#!/bin/bash
# Script to update dependencies for Next.js 15 and React 19

echo "🔄 Updating dependencies for Next.js 15 and React 19..."

# Update package.json directly with specific versions
echo "Updating package.json with specific versions..."

# Create a backup of package.json
cp package.json package.json.bak

# Use jq to update dependencies if it's available
if command -v jq &> /dev/null; then
  echo "Using jq to update package.json..."
  jq '.dependencies."next" = "^15.0.0" |
      .dependencies."react" = "^19.0.0" |
      .dependencies."react-dom" = "^19.0.0" |
      .dependencies."next-auth" = "^5.0.0-beta.28" |
      .dependencies."@tanstack/react-query" = "^5.0.0" |
      .dependencies."@tanstack/react-query-devtools" = "^5.0.0" |
      .dependencies."react-hook-form" = "^7.56.3"' package.json.bak > package.json
else
  echo "jq not found. Please install the dependencies manually."
  echo "Required updates:"
  echo "next: ^15.0.0"
  echo "react: ^19.0.0"
  echo "react-dom: ^19.0.0"
  echo "next-auth: ^5.0.0-beta.28"
  echo "@tanstack/react-query: ^5.0.0"
  echo "@tanstack/react-query-devtools: ^5.0.0"
  echo "react-hook-form: ^7.56.3"
  # Restore the backup
  mv package.json.bak package.json
  exit 1
fi

# Install dependencies
echo "Installing updated dependencies..."
pnpm install

# Update ESLint and other dev dependencies
pnpm up @next/eslint-plugin-next@latest eslint-config-next@latest @types/react@latest @types/react-dom@latest

# Make sure we have the latest types for Node.js and Next.js
pnpm add -D @types/node@latest

# Update other React ecosystem packages that need to be compatible
pnpm up @radix-ui/react-*
pnpm up embla-carousel-react input-otp
pnpm up framer-motion classnames clsx immer zustand

echo "✅ Dependencies updated! Please check for any peer dependency warnings."
echo "⚠️ Remember to update your code for breaking changes in React 19 and Next.js 15."
echo "📖 See UPGRADE_GUIDE.md for detailed instructions."
