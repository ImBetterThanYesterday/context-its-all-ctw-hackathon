// Test script for the new agent endpoint
import 'dotenv/config'

const API_BASE_URL = 'http://localhost:3001'

interface AgentGenerateResponse {
  success: boolean
  appUrl?: string
  sandboxId?: string
  projectName?: string
  framework?: string
  sourceType?: 'pdf' | 'prompt'
  sourceData?: {
    pdfUrl?: string | null
    prompt?: string | null
    documentAnalysis?: any
  }
  generatedAt?: string
  message?: string
  error?: string
}

async function testAgentEndpoint() {
  console.log('🧪 Testing Agent Endpoint...\n')

  // Test 1: Generate app from prompt
  console.log('📝 Test 1: Generate app from text prompt')
  try {
    const promptResponse = await fetch(`${API_BASE_URL}/api/agent/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Crear una landing page para una pizzería con menú, galería de fotos y formulario de contacto. Debe tener colores cálidos y un diseño moderno.',
        framework: 'html'
      })
    })

    if (!promptResponse.ok) {
      throw new Error(`HTTP error! status: ${promptResponse.status}`)
    }

    const promptResult: AgentGenerateResponse = await promptResponse.json()
    
    if (promptResult.success) {
      console.log('✅ Prompt test successful!')
      console.log(`   App URL: ${promptResult.appUrl}`)
      console.log(`   Sandbox ID: ${promptResult.sandboxId}`)
      console.log(`   Project Name: ${promptResult.projectName}`)
      console.log(`   Source Type: ${promptResult.sourceType}`)
      console.log(`   Generated At: ${promptResult.generatedAt}`)
    } else {
      console.log('❌ Prompt test failed:', promptResult.error)
    }
  } catch (error) {
    console.log('❌ Prompt test error:', error instanceof Error ? error.message : error)
  }

  console.log('\n---\n')

  // Test 2: Generate app from PDF URL (example PDF)
  console.log('📄 Test 2: Generate app from PDF URL')
  try {
    // Using a sample PDF URL (you can replace with an actual PDF URL)
    const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    
    const pdfResponse = await fetch(`${API_BASE_URL}/api/agent/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfUrl: pdfUrl,
        framework: 'html'
      })
    })

    if (!pdfResponse.ok) {
      throw new Error(`HTTP error! status: ${pdfResponse.status}`)
    }

    const pdfResult: AgentGenerateResponse = await pdfResponse.json()
    
    if (pdfResult.success) {
      console.log('✅ PDF test successful!')
      console.log(`   App URL: ${pdfResult.appUrl}`)
      console.log(`   Sandbox ID: ${pdfResult.sandboxId}`)
      console.log(`   Project Name: ${pdfResult.projectName}`)
      console.log(`   Source Type: ${pdfResult.sourceType}`)
      console.log(`   Document Analysis:`, JSON.stringify(pdfResult.sourceData?.documentAnalysis, null, 2))
      console.log(`   Generated At: ${pdfResult.generatedAt}`)
    } else {
      console.log('❌ PDF test failed:', pdfResult.error)
    }
  } catch (error) {
    console.log('❌ PDF test error:', error instanceof Error ? error.message : error)
  }

  console.log('\n---\n')

  // Test 3: Error case - no input provided
  console.log('⚠️ Test 3: Error case - no input provided')
  try {
    const errorResponse = await fetch(`${API_BASE_URL}/api/agent/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    })

    const errorResult: AgentGenerateResponse = await errorResponse.json()
    
    if (!errorResult.success && errorResult.error === 'Either pdfUrl or prompt is required') {
      console.log('✅ Error handling test successful!')
      console.log(`   Expected error: ${errorResult.error}`)
    } else {
      console.log('❌ Error handling test failed - unexpected response')
    }
  } catch (error) {
    console.log('❌ Error handling test error:', error instanceof Error ? error.message : error)
  }

  console.log('\n🏁 Agent endpoint testing completed!')
}

// Health check first
async function healthCheck() {
  try {
    console.log('🔍 Checking server health...')
    const response = await fetch(`${API_BASE_URL}/health`)
    const health = await response.json()
    
    if (health.status === 'ok') {
      console.log('✅ Server is healthy!')
      console.log(`   Active sandboxes: ${health.activeSandboxes}`)
      console.log(`   Timestamp: ${health.timestamp}\n`)
      return true
    } else {
      console.log('❌ Server health check failed')
      return false
    }
  } catch (error) {
    console.log('❌ Cannot connect to server. Make sure it\'s running on port 3001')
    console.log('   Run: npm run server')
    return false
  }
}

// Main execution
async function main() {
  console.log('🚀 Agent Endpoint Test Suite\n')
  
  const isHealthy = await healthCheck()
  if (!isHealthy) {
    process.exit(1)
  }
  
  await testAgentEndpoint()
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Run the tests
main().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})
