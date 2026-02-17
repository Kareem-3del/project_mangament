# Run Database Migrations

Follow these steps to set up your database:

## Step 1: Go to Supabase SQL Editor

Visit: https://supabase.com/dashboard/project/ygrpotvnyyofvyevdjab/sql/new

## Step 2: Run Migrations in Order

### Migration 1: Initial Schema
1. Click "New query" in SQL Editor
2. Copy the entire content from `supabase/migrations/001_initial_schema.sql`
3. Paste and click "Run"
4. Wait for "Success. No rows returned" message

### Migration 2: RLS Policies
1. Click "New query" again
2. Copy the entire content from `supabase/migrations/002_rls_policies.sql`
3. Paste and click "Run"
4. Wait for success message

### Migration 3: Functions & Triggers
1. Click "New query" again
2. Copy the entire content from `supabase/migrations/003_functions.sql`
3. Paste and click "Run"
4. Wait for success message

## Step 3: Verify Setup

Go to "Table Editor" in Supabase dashboard. You should see these tables:
- companies
- users
- projects
- project_members
- tickets
- ticket_comments
- ticket_attachments
- time_entries
- activity_logs

## Step 4: Check RLS is Enabled

Go to "Database" > "Policies" - you should see multiple policies for each table.

## Step 5: Run the App!

```bash
pnpm dev
```

Then visit http://localhost:3000 and sign up!
