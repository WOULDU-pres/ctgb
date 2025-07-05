// Test Supabase connection
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n🏃 Testing basic connection...')
    
    // Test 1: Basic connectivity
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.log('⚠️  Tables not found (expected - we need to deploy schema)')
      console.log('Error:', error.message)
    } else {
      console.log('✅ Connection successful!')
      console.log('Data:', data)
    }

    // Test 2: Auth functionality
    console.log('\n🔐 Testing Auth functionality...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('❌ Auth error:', authError.message)
    } else {
      console.log('✅ Auth service available')
      console.log('Session:', authData.session ? 'Active' : 'None')
    }

    console.log('\n🎯 Connection test completed!')
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    process.exit(1)
  }
}

testConnection()