#!/bin/bash

# Script to apply VSLA monthly data table migration
# This creates the vsla_monthly_data table for tracking monthly aggregates

echo "🚀 Applying VSLA Monthly Data migration..."

# Source the database connection
source "$(dirname "$0")/db-connection.sh"

# Apply the migration
psql "$DATABASE_URL" -f "$(dirname "$0")/../migrations/add-vsla-monthly-data-table.sql"

if [ $? -eq 0 ]; then
  echo "✅ VSLA Monthly Data table created successfully!"
else
  echo "❌ Migration failed!"
  exit 1
fi
