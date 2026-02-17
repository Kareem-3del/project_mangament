/**
 * Seed Script: Create Admin User
 *
 * This script creates an admin user with the following credentials:
 * Email: admin@example.com
 * Password: secret
 *
 * Usage:
 * 1. Make sure your .env.local file has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * 2. Run: npx tsx scripts/seed-admin.ts
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease add these to your .env.local file')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASSWORD = 'secret'
const COMPANY_ID = 'a0000000-0000-0000-0000-000000000001'

async function seedAdmin() {
  console.log('🌱 Starting admin user seeding process...\n')

  try {
    // Step 1: Create default company
    console.log('📦 Creating default company...')
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .upsert({
        id: COMPANY_ID,
        name: 'Default Company',
        description: 'Initial company created during setup'
      })
      .select()

    if (companyError && companyError.code !== '23505') { // Ignore duplicate key errors
      throw new Error(`Failed to create company: ${companyError.message}`)
    }
    console.log('✅ Company created/verified\n')

    // Step 2: Check if admin user already exists
    console.log('🔍 Checking if admin user already exists...')
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', ADMIN_EMAIL)

    if (checkError) {
      throw new Error(`Failed to check existing users: ${checkError.message}`)
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log('⚠️  Admin user already exists:')
      console.log(`   Email: ${existingUsers[0].email}`)
      console.log(`   Role: ${existingUsers[0].role}`)
      console.log('\n✨ Seeding complete (user already exists)')
      return
    }

    // Step 3: Create auth user
    console.log('👤 Creating admin user in Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'System Administrator'
      }
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('No user returned from auth creation')
    }

    console.log(`✅ Auth user created with ID: ${authData.user.id}\n`)

    // Step 4: Create user profile
    console.log('📝 Creating user profile...')
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        company_id: COMPANY_ID,
        email: ADMIN_EMAIL,
        full_name: 'System Administrator',
        role: 'admin',
        is_active: true
      })

    if (profileError) {
      throw new Error(`Failed to create user profile: ${profileError.message}`)
    }

    console.log('✅ User profile created\n')

    // Success!
    console.log('🎉 Admin user seeded successfully!')
    console.log('\n📋 Login Credentials:')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log('\n⚠️  Remember to change the password after first login!')

  } catch (error) {
    console.error('\n❌ Error during seeding:')
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run the seed function
seedAdmin()
  .then(() => {
    console.log('\n✅ Seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  })
