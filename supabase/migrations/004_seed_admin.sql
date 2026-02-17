-- Seed script to create default admin user and company
-- This script creates:
-- 1. A default company
-- 2. An admin user with credentials: admin@example.com / secret

-- Insert default company
INSERT INTO companies (id, name, description)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Default Company',
    'Initial company created during setup'
)
ON CONFLICT (id) DO NOTHING;

-- Note: The actual user creation in auth.users must be done through Supabase Auth API
-- This script only creates the profile record in the users table
-- The auth user must be created separately using the seed script below

-- Create a function to seed the admin user
CREATE OR REPLACE FUNCTION seed_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin user already exists in auth.users
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@example.com';

    -- If the admin user exists in auth, create their profile
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO users (id, company_id, email, full_name, role, is_active)
        VALUES (
            admin_user_id,
            'a0000000-0000-0000-0000-000000000001'::uuid,
            'admin@example.com',
            'System Administrator',
            'admin',
            true
        )
        ON CONFLICT (id) DO UPDATE
        SET
            company_id = EXCLUDED.company_id,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active;

        RAISE NOTICE 'Admin user profile created/updated successfully';
    ELSE
        RAISE NOTICE 'Admin user not found in auth.users. Please create it first using the Supabase dashboard or API';
    END IF;
END;
$$;

-- Execute the function
SELECT seed_admin_user();

-- Drop the function after use
DROP FUNCTION seed_admin_user();
