#!/bin/bash
# Apply Next.js 15 codemods to the project

echo "Running Next.js 15 codemods to complete the upgrade..."

# 1. Transform App Router Route Segment Config runtime value from experimental-edge to edge
echo "1. Running app-dir-runtime-config-experimental-edge codemod..."
npx @next/codemod@latest app-dir-runtime-config-experimental-edge ./apps/webapp

# 2. Migrate to async Dynamic APIs (cookies, headers, draftMode)
echo "2. Running next-async-request-api codemod to update async APIs..."
npx @next/codemod@latest next-async-request-api ./apps/webapp

# 3. Replace geo and ip properties of NextRequest with @vercel/functions
echo "3. Running next-request-geo-ip codemod..."
npx @next/codemod@latest next-request-geo-ip ./apps/webapp

# Any additional codemods from Next.js 14 that might still be relevant
echo "4. Running built-in-next-font codemod to ensure proper font imports..."
npx @next/codemod@latest built-in-next-font ./apps/webapp

# Final step - running the general upgrade codemod
echo "5. Running general upgrade codemod..."
npx @next/codemod@latest upgrade ./apps/webapp

echo "Codemods completed! Please review the changes and run tests."
