// Test the complete API integration
import { apiService } from './src/lib/api-service.js'

async function testApiIntegration() {
  console.log('🧪 Testing complete API integration...')
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health check...')
    const health = await apiService.healthCheck()
    console.log('✅ Health check passed:', health)
    
    // Test 2: Create a simple sandbox (quick test)
    console.log('\n2. Testing sandbox creation...')
    const sandbox = await apiService.createSandbox()
    console.log('✅ Sandbox created:', sandbox.sandboxId)
    
    // Test 3: List sandboxes
    console.log('\n3. Testing sandbox listing...')
    const sandboxes = await apiService.listSandboxes()
    console.log('✅ Active sandboxes:', sandboxes.length)
    
    // Test 4: Generate a simple app (this is the full test)
    console.log('\n4. Testing web app generation...')
    console.log('⚠️  This will take a few minutes...')
    
    const result = await apiService.generateWebAppWithProgress(
      {
        prompt: 'Crea una landing page simple con un botón',
        framework: 'react'
      },
      (stage, message, progress) => {
        console.log(`   [${stage.toUpperCase()}] ${message} ${progress ? `(${progress}%)` : ''}`)
      }
    )
    
    console.log('\n✅ FULL INTEGRATION TEST PASSED!')
    console.log('📦 Sandbox ID:', result.sandboxId)
    console.log('🌐 Preview URL:', result.previewUrl)
    console.log('🎯 Framework:', result.framework)
    
    console.log('\n🎉 Check your E2B dashboard - you should see the active sandbox!')
    console.log('🌐 Visit the preview URL to see the generated application!')
    
  } catch (error) {
    console.error('\n❌ Integration test failed:')
    console.error('Error:', error instanceof Error ? error.message : String(error))
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        console.error('\n💡 Make sure the backend server is running:')
        console.error('   npm run server')
      } else if (error.message.includes('E2B_API_KEY')) {
        console.error('\n💡 Check your E2B API key in .env file')
      } else if (error.message.includes('ANTHROPIC_API_KEY')) {
        console.error('\n💡 Check your Anthropic API key in .env file')
      }
    }
    
    throw error
  }
}

// Run the test
testApiIntegration().catch(error => {
  console.error('❌ Test script failed:', error)
  process.exit(1)
})