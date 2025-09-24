#!/bin/bash
export DATABASE_URL="${1:-$DATABASE_URL}"

echo "🌱 Running location seed scripts in order..."

# Run seeds in the correct hierarchical order
echo "Seeding countries..."
pnpm tsx scripts/seed-countries.ts

echo "Seeding districts..."
pnpm tsx scripts/seed-districts.ts

echo "Seeding counties..."
pnpm tsx scripts/seed-counties.ts

echo "Seeding subcounties..."
pnpm tsx scripts/seed-subcounties.ts

echo "Seeding municipalities..."
pnpm tsx scripts/seed-municipalities.ts

echo "Seeding parishes..."
pnpm tsx scripts/seed-parishes.ts

echo "Seeding villages..."
pnpm tsx scripts/seed-villages.ts

echo "Seeding urban areas..."
pnpm tsx scripts/seed-urban-areas.ts

echo "✅ All seeding completed!"
