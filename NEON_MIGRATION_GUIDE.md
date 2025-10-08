# Migration Guide: Supabase to Neon

## Steps to Switch to Neon

### 1. Create a Neon Project

1. Go to https://console.neon.tech
2. Sign in or create an account
3. Click "Create Project"
4. Choose a region (preferably close to your users)
5. Give it a name (e.g., "impact-tracker")

### 2. Get Your Connection Strings

After creating the project, Neon will provide you with connection strings:

- **Pooled Connection** (recommended for serverless):

  ```
  postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require&pgbouncer=true
  ```

- **Direct Connection** (for migrations):
  ```
  postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require
  ```

### 3. Update Your Environment Variables

Update your `.env.local` file:

````bash
# Neon Database URLs

**Important Notes:**

- `DATABASE_URL` should use the **pooled connection** (with `pgbouncer=true`)
  for application queries
- `DIRECT_URL` should use the **direct connection** (without pgbouncer) for
  running migrations
- Both URLs should have `sslmode=require`

### 4. Run Database Migrations

After updating your environment variables:

```bash
# Push the schema to Neon
pnpm db:push

# Or generate and run migrations
pnpm db:generate
pnpm db:migrate
````

### 5. Migrate Your Data (Optional)

If you need to migrate existing data from Supabase to Neon:

#### Option A: Using pg_dump/pg_restore

```bash
# Export from Supabase

# Import to Neon (use DIRECT_URL)
psql "postgresql://[your-neon-direct-url]" < backup.sql
```

#### Option B: Using Neon's Data Import Tool

1. Go to your Neon project dashboard
2. Navigate to "Import" section
3. Follow the guided import process

### 6. Test the Connection

```bash
# Test the database connection
pnpm test:db

# Or create a test script
node -e "require('./src/lib/db').testDbConnection()"
```

### 7. Update Any CI/CD Pipelines

If you use GitHub Actions, Vercel, or other deployment platforms, update the
environment variables there as well.

## Key Differences: Supabase vs Neon

| Feature            | Supabase             | Neon                           |
| ------------------ | -------------------- | ------------------------------ |
| Connection Pooling | PgBouncer (built-in) | PgBouncer (optional)           |
| Max Pool Size      | 1-3 for free tier    | 10+ for free tier              |
| SSL Mode           | `ssl: true`          | `sslmode=require`              |
| Branching          | Not available        | Available (database branching) |
| Serverless         | Yes                  | Yes (better cold start)        |
| Auto-suspend       | Limited              | Aggressive (free tier)         |

## Neon-Specific Features You Can Use

### 1. Database Branching

Create development branches from your production database:

```bash
# Create a branch via Neon CLI
neonctl branches create --name dev
```

### 2. Point-in-Time Recovery

Neon offers better PITR capabilities for paid plans.

### 3. Autoscaling

Neon can automatically scale compute resources based on load.

## Configuration Changes Made

### Updated: `src/lib/db/config.ts`

- Changed SSL option from `ssl: true` to `ssl: "require"`
- Increased max connections from 1 to 10 (better for Neon)
- Adjusted idle_timeout from 0.5s to 20s (Neon's recommended setting)
- Updated comment from "Supabase" to "Neon"

### Kept Unchanged: `drizzle.config.ts`

- Already configured to work with Neon
- Uses `DIRECT_URL` fallback for migrations
- SSL is properly configured

## Troubleshooting

### Connection Timeouts

If you experience timeouts:

1. Ensure you're using the pooled connection URL for queries
2. Use the direct connection URL only for migrations
3. Check if your Neon project is suspended (free tier auto-suspends)

### SSL Errors

Make sure your connection string includes `sslmode=require`:

```

```

### Migration Errors

Always use `DIRECT_URL` (non-pooled) for migrations:

```bash
DIRECT_URL="postgresql://..." pnpm db:push
```

## Rollback Plan

If you need to rollback to Supabase:

1. Update `.env.local` with old Supabase URLs
2. Revert `src/lib/db/config.ts`:
   ```typescript
   const connectionOptions = {
     ssl: true,
     max: 1,
     connect_timeout: 10,
     idle_timeout: 0.5,
     max_lifetime: 60 * 30,
   };
   ```
3. Restart your development server

## Next Steps

1. ✅ Create Neon project
2. ✅ Update environment variables
3. ✅ Run migrations
4. ✅ Test connection
5. ⬜ Migrate data (if needed)
6. ⬜ Update production environment variables
7. ⬜ Deploy and verify

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon + Next.js Guide](https://neon.tech/docs/guides/nextjs)
- [Drizzle + Neon Guide](https://neon.tech/docs/guides/drizzle)
