#!/bin/sh
set -e

TRACING_MODULE="./dist/src/tracing.js"

npx prisma migrate deploy

if [ -f "$TRACING_MODULE" ]; then
  echo "Found $TRACING_MODULE — configuring application tracing."
  exec node --require "$TRACING_MODULE" dist/src/main.js
else
  echo "$TRACING_MODULE not found — will not use application tracing"
  exec node dist/src/main.js
fi