#!/bin/bash

# Cleanup non-East African countries from the database
# This script removes countries that are not in East Africa or Ethiopia

echo "🧹 Starting cleanup of non-East African countries..."

# Run the cleanup script using the npm script
pnpm db:cleanup-countries

echo "✅ Cleanup completed!"