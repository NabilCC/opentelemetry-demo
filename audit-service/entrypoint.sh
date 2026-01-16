#!/bin/sh
set -euo pipefail

TRACING_MODULE="./dist/src/tracing.js"

npx prisma migrate deploy

if [ -f "$TRACING_MODULE" ]; then
  echo "✅ Found $TRACING_MODULE — enabling tracing"
  exec node --require "./$TRACING_MODULE" dist/src/main.js
else
  exec "$@"
fi