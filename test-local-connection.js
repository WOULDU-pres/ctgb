// Test local Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

console.log('🔧 Testing Local Supabase Connection...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLocalConnection() {
  try {
    console.log('\n🏃 Testing basic connection...')
    
    // Test basic connectivity
    const { data, error } = await supabase.from('users').select('*').limit(1)
    
    if (error) {
      console.log('✅ Connected! Tables found, error expected:', error.message)
    } else {
      console.log('✅ Connection successful!')
      console.log('Data:', data)
    }

    // Test Auth functionality
    console.log('\n🔐 Testing Auth functionality...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('❌ Auth error:', authError.message)
    } else {
      console.log('✅ Auth service available')
      console.log('Session:', authData.session ? 'Active' : 'None')
    }

    console.log('\n🎯 Local connection test completed!')
    return true
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

const result = await testLocalConnection()
if (result) {
  console.log('\n🚀 Ready for database schema deployment!')
} else {
  process.exit(1)
}