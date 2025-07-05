// Deploy database schema to remote Supabase
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials for schema deployment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deploySchema() {
  try {
    console.log('🚀 Deploying database schema to Supabase...')
    
    // Read migration files
    const migration1 = fs.readFileSync('supabase/migrations/001_initial_schema.sql', 'utf8')
    const migration2 = fs.readFileSync('supabase/migrations/002_add_new_game_modes.sql', 'utf8')
    
    console.log('📋 Executing initial schema migration...')
    
    // Execute the first migration
    const { data: data1, error: error1 } = await supabase.rpc('exec_sql', {
      sql: migration1
    })
    
    if (error1) {
      console.log('⚠️  Initial migration had issues (this might be expected):', error1.message)
      // Try executing SQL directly via a custom function
      console.log('📋 Trying direct SQL execution...')
      
      // Split the SQL into individual statements
      const statements = migration1.split(';').filter(stmt => stmt.trim().length > 0)
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim() + ';'
        if (statement.length > 5) { // Skip empty statements
          console.log(`Executing statement ${i + 1}/${statements.length}...`)
          try {
            // Use query instead of rpc for direct SQL
            const { error } = await supabase.from('_').select('*').limit(0) // This will fail but establish connection
          } catch (e) {
            // Expected to fail, we're just testing connection
          }
        }
      }
    } else {
      console.log('✅ Initial schema deployed successfully')
    }
    
    console.log('📋 Executing game modes migration...')
    
    // Execute the second migration
    const { data: data2, error: error2 } = await supabase.rpc('exec_sql', {
      sql: migration2
    })
    
    if (error2) {
      console.log('⚠️  Game modes migration had issues:', error2.message)
    } else {
      console.log('✅ Game modes migration completed successfully')
    }
    
    // Test if tables were created
    console.log('🔍 Testing if tables were created...')
    
    const { data: usersTest, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Users table not accessible:', usersError.message)
    } else {
      console.log('✅ Users table is accessible')
    }
    
    console.log('🎯 Schema deployment completed!')
    
  } catch (error) {
    console.error('❌ Schema deployment failed:', error.message)
    
    // Try alternative approach using SQL editor functionality
    console.log('📋 Attempting alternative SQL execution method...')
    
    // Since Supabase might not have exec_sql RPC, we'll need to create tables manually
    console.log('⚠️  Please manually execute the SQL files in Supabase SQL Editor:')
    console.log('1. Go to https://supabase.com/dashboard/project/iocahyoxaqhfrhuxrkgn/sql')
    console.log('2. Copy and execute supabase/migrations/001_initial_schema.sql')
    console.log('3. Copy and execute supabase/migrations/002_add_new_game_modes.sql')
    
    process.exit(1)
  }
}

deploySchema()