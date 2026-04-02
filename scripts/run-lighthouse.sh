#!/bin/bash

set -e

cd "$(git rev-parse --show-toplevel)"

SERVER_PID=""
SERVE_LOG=$(mktemp)
BUILD_LOG=$(mktemp)

cleanup() {
  if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null || true
  fi
  rm -f "packages/web-sdk/dist/index-lighthouse.html"
  rm -f "$SERVE_LOG"
  rm -f "$BUILD_LOG"
}

trap cleanup EXIT

# Find a free port dynamically
PORT=$(node -e "
  const net = require('net');
  const s = net.createServer();
  s.listen(0, () => {
    console.log(s.address().port);
    s.close();
  });
")

# Silent build only prints output if it fails
echo "Building web-sdk..."
if ! pnpm --filter=@genuin/web-sdk build:prod > "$BUILD_LOG" 2>&1; then
  echo "❌ Build failed. Output:"
  cat "$BUILD_LOG"
  exit 1
fi
echo "✅ Build complete"

# Create HTML file
echo "📝 Creating temporary lighthouse test file..."
cat > "packages/web-sdk/dist/index-lighthouse.html" << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Genuin SDK - Performance Test</title>
  </head>
  <body>
    <div id="gen-sdk" style="width: 800px; height: 600px"></div>
    <script src="./gen_sdk.min.js"></script>
    <script>
      window.genuin.init({
        embed_id: '6825ce0625f52428cc669d06',
        api_key: '720cab8375fcc752e807c28bbd0f156aacb504ec7be0c634',
        useShadowDOM: true,
      })
    </script>
  </body>
</html>
EOF

echo "🚀 Starting HTTP server on port $PORT..."
npx serve -l $PORT packages/web-sdk/dist > "$SERVE_LOG" 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for server..."
if ! npx wait-on http://localhost:$PORT -t 15000 --interval 500; then
  echo "❌ Server never became ready. Logs:"
  cat "$SERVE_LOG"
  exit 1
fi

echo "📊 Running Lighthouse (Desktop)..."
npx lighthouse http://localhost:$PORT/index-lighthouse.html \
  --only-categories=performance,accessibility,best-practices,seo \
  --preset=desktop \
  --chrome-flags="--headless=new" \
  --quiet \
  --output=json \
  --output-path=./packages/web-sdk/dist/lighthouse-result-desktop.json

echo "📊 Running Lighthouse (Mobile)..."
npx lighthouse http://localhost:$PORT/index-lighthouse.html \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new" \
  --quiet \
  --output=json \
  --output-path=./packages/web-sdk/dist/lighthouse-result-mobile.json

node --no-warnings scripts/check-lighthouse.js

exit 0