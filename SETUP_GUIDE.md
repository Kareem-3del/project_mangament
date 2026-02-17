# Quick Setup Guide

Follow these steps to get your Project Management System up and running.

## Step 1: Install Node Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Supabase, Tailwind CSS, and UI components.

## Step 2: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project name**: project-management-system (or your choice)
   - **Database password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing plan**: Free tier works fine for development
5. Wait for project to finish setting up (~2 minutes)

## Step 3: Run Database Migrations

1. In your Supabase project dashboard, click "SQL Editor" in the sidebar
2. Click "New Query"
3. Copy and paste the content from `supabase/migrations/001_initial_schema.sql`
4. Click "Run" or press Cmd/Ctrl + Enter
5. Repeat for `002_rls_policies.sql` and `003_functions.sql` in order

**Important**: Run these files in order (001, 002, 003). Each file depends on the previous one.

### Verify Migrations

After running all migrations, verify in the "Table Editor":
- You should see tables: companies, users, projects, project_members, tickets, ticket_comments, ticket_attachments, time_entries, activity_logs
- In "Database" > "Policies", verify RLS is enabled and policies exist for each table

## Step 4: Get Supabase Credentials

1. In your Supabase project, go to "Settings" > "API"
2. You'll need two values:
   - **Project URL**: Under "Project URL" (looks like `https://xxxxx.supabase.co`)
   - **Anon/Public Key**: Under "Project API keys" > "anon public"
3. Keep this tab open for the next step

## Step 5: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and update with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. To get the service role key (needed for admin operations):
   - In Supabase Settings > API
   - Look for "service_role" under "Project API keys"
   - **⚠️ Keep this secret! Never commit to git or expose in frontend**

## Step 6: Set Up Storage (For File Attachments - Optional)

1. In Supabase dashboard, go to "Storage"
2. Click "Create a new bucket"
3. Name it: `ticket-attachments`
4. Set to "Public bucket" (or configure policies later)
5. Click "Create bucket"

### Configure Storage Policies

In SQL Editor, run:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-attachments');

-- Allow users to view attachments they have access to
CREATE POLICY "Users can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ticket-attachments');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ticket-attachments' AND auth.uid() = owner);
```

## Step 7: Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Step 8: Create Your First Account

1. Go to [http://localhost:3000](http://localhost:3000)
2. You'll be redirected to `/auth/login`
3. Click "create a new account"
4. Fill in the signup form:
   - **Full Name**: Your name
   - **Company Name**: Your company/organization
   - **Email**: Your email
   - **Password**: At least 6 characters
5. Click "Create account"
6. You'll be logged in and redirected to the dashboard

**Note**: The first user is automatically assigned the "admin" role.

## Step 9: Verify Everything Works

### Check User Profile
1. You should see your name in the header
2. Role should show as "admin"

### Check Database
1. In Supabase > Table Editor > companies
   - You should see your company
2. In Table Editor > users
   - You should see your user profile with role='admin'

### Test Basic Features
1. **Dashboard**: Should load without errors
2. **Projects**: Click "Projects" - should show empty state
3. **Time Tracking**: Click "Time Tracking" - should show check-in button

## Troubleshooting

### "Failed to connect to Supabase"
- Check that `.env.local` has correct values
- Verify Supabase URL starts with `https://`
- Restart the dev server after changing `.env.local`

### "Row Level Security policy violation"
- Verify you ran all three migration files in order
- Check in Supabase > Database > Policies that policies exist
- Try re-running `002_rls_policies.sql`

### "User profile not found"
- Check Supabase > Table Editor > users
- Your user ID should match your auth.users ID
- Try signing up again with a different email

### Migrations fail to run
- Make sure you're running them in order (001, 002, 003)
- Check SQL Editor for error messages
- If tables already exist, you might need to drop and recreate

### Cannot sign up or login
- Check browser console for errors
- Verify Supabase project is not paused
- Confirm Auth is enabled in Supabase > Authentication > Providers

## Next Steps

After setup is complete:

1. **Invite team members**: Create user accounts for your team
2. **Create a project**: Go to Projects > New Project
3. **Add tickets**: Create tasks for your project
4. **Track time**: Use the time tracking feature

## Development Tips

- Keep the Supabase dashboard open for monitoring database changes
- Check the Network tab in browser DevTools for API errors
- Use Supabase logs (Logs > API) to debug RLS issues
- Enable SQL auto-refresh in Supabase for real-time table updates

## Production Deployment

When ready to deploy:

1. Set up a production Supabase project
2. Run migrations on production database
3. Update environment variables in your hosting platform
4. Build the application: `npm run build`
5. Deploy to Vercel, Netlify, or your preferred platform

See `README.md` for more detailed information.
