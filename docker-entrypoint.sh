#!/bin/sh
set -e

missing=""
for var in DATABASE_URL SESSION_SECRET ADMIN_EMAIL ADMIN_PASSWORD; do
  eval "val=\${$var:-}"
  [ -z "$val" ] && missing="$missing $var"
done
if [ -n "$missing" ]; then
  echo "ERROR: missing required environment variables:$missing" >&2
  echo "Set them in Coolify -> your app -> Environment Variables, then redeploy (see DEPLOY.md)." >&2
  exit 1
fi

echo "Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy

echo "Ensuring admin user exists..."
node_modules/.bin/tsx prisma/ensure-admin.ts

exec "$@"
