# Database Seeding Guide

This guide explains how to seed your database with an initial admin user.

## Default Admin Credentials

After seeding, you can login with:
- **Email**: `admin@example.com`
- **Password**: `secret`

⚠️ **Important**: Change the password immediately after first login!

## Prerequisites

1. Make sure your Supabase project is set up
2. Ensure your `.env.local` file contains:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. Run migrations first (if not already done):
   ```bash
   # Apply migrations to your Supabase project
   supabase db push
   ```

## How to Seed

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Run the Seed Script

```bash
pnpm run seed:admin
```

The script will:
1. ✅ Create a default company
2. ✅ Create an admin user in Supabase Auth
3. ✅ Create the user profile with admin role
4. ✅ Display the login credentials

### Expected Output

```
🌱 Starting admin user seeding process...

📦 Creating default company...
✅ Company created/verified

🔍 Checking if admin user already exists...
👤 Creating admin user in Supabase Auth...
✅ Auth user created with ID: xxx-xxx-xxx

📝 Creating user profile...
✅ User profile created

🎉 Admin user seeded successfully!

📋 Login Credentials:
   Email: admin@example.com
   Password: secret

⚠️  Remember to change the password after first login!
```

## Troubleshooting

### "Missing required environment variables"
Make sure your `.env.local` file exists and contains all required variables from `.env.local.example`.

### "Admin user already exists"
The admin user has already been created. You can login with the credentials above.

### "Failed to create auth user"
- Check that your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify your Supabase project is active
- Check the Supabase dashboard for any error messages

## Manual Seeding via SQL

If you prefer to use the SQL migration instead:

1. Make sure the admin user exists in Supabase Auth (create via dashboard)
2. Run the migration:
   ```bash
   supabase db push
   ```
3. The `004_seed_admin.sql` migration will create the user profile

## Customizing the Admin User

To change the default admin credentials, edit `scripts/seed-admin.ts`:

```typescript
const ADMIN_EMAIL = 'your-email@example.com'
const ADMIN_PASSWORD = 'your-secure-password'
```

## Security Notes

- The service role key has full database access - keep it secure!
- Never commit `.env.local` to version control
- Change the default password immediately after first login
- Consider using a password manager for production credentials
