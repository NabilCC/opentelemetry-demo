#!/bin/sh
set -e

echo "Waiting for Redis..."
until redis-cli -h redis -p 6379 ping | grep -q PONG; do
  sleep 1
done

echo "Connected. Seeding users..."

redis-cli -h redis -p 6379 <<'EOF'
SET user:1 '{"id":"1","email":"alice@test.com","name":"Alice"}'
SET user:2 '{"id":"2","email":"bob@test.com","name":"Bob"}'
SET user:3 '{"id":"3","email":"charlie@test.com","name":"Charlie"}'
SET user:4 '{"id":"4","email":"david@test.com","name":"David"}'
SET user:5 '{"id":"5","email":"emma@test.com","name":"Emma"}'
EOF

echo "Seed complete"
