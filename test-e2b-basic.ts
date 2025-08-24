// Basic E2B test following documentation exactly
import 'dotenv/config'
import { Sandbox } from '@e2b/code-interpreter'

async function testBasicE2B() {
  console.log('🧪 Testing basic E2B sandbox creation...');
  
  try {
    console.log('📝 Environment check:');
    console.log('E2B_API_KEY exists:', !!process.env.E2B_API_KEY);
    console.log('API Key length:', process.env.E2B_API_KEY?.length || 0);
    console.log('API Key prefix:', process.env.E2B_API_KEY?.substring(0, 10) + '...' || 'None');
    
    // Step 1: Create sandbox (following docs exactly)
    console.log('\n🚀 Creating E2B sandbox...');
    const sbx = await Sandbox.create() // Default: sandbox is active for 5 minutes
    console.log('✅ Sandbox created successfully!');
    console.log('📦 Sandbox ID:', sbx.sandboxId);
    
    // Step 2: Execute Python inside sandbox (following docs exactly)  
    console.log('\n🐍 Executing Python code...');
    const execution = await sbx.runCode('print("hello world")') // Execute Python inside sandbox
    console.log('📝 Execution logs:', execution.logs);
    
    // Step 3: List files (following docs exactly)
    console.log('\n📁 Listing files...');
    const files = await sbx.files.list('/')
    console.log('📂 Files:', files);
    
    // Step 4: Test basic operations
    console.log('\n🧪 Testing file operations...');
    await sbx.files.write('/home/user/test.txt', 'Hello from E2B test!');
    const content = await sbx.files.read('/home/user/test.txt');
    console.log('📄 File content:', content);
    
    // Step 5: Get sandbox info
    console.log('\n📊 Sandbox info:');
    const info = await sbx.getInfo();
    console.log('ℹ️ Info:', info);
    
    console.log('\n✅ ALL TESTS PASSED! E2B is working correctly.');
    console.log('🎉 Check your E2B dashboard - sandbox should be visible now!');
    
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await sbx.kill();
    console.log('✅ Sandbox terminated');
    
  } catch (error) {
    console.error('\n❌ E2B test failed:');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', error);
    
    // Additional debugging
    if (error instanceof Error && error.message) {
      if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        console.error('\n🔑 AUTHENTICATION ERROR - Check your E2B API key');
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        console.error('\n🌐 NETWORK ERROR - Check your internet connection');
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        console.error('\n💰 QUOTA ERROR - Check your E2B account limits');
      }
    }
    
    throw error;
  }
}

// Run the test
testBasicE2B().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});