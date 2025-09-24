#!/bin/bash

DB_URL="${DATABASE_URL}"

echo "Running seed-districts script with database URL..."
DATABASE_URL="$DB_URL" pnpm tsx scripts/seed-districts.ts

echo "Done!"
