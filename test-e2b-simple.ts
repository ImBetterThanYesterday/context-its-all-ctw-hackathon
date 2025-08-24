// Simple E2B API key test - Run this with: npx tsx test-e2b-simple.ts

async function testE2BApiKey() {
  console.log('🧪 Testing E2B API Key...');
  
  // Test 1: Check if environment variable is available
  const apiKey = process.env.E2B_API_KEY || process.env.VITE_E2B_API_KEY;
  console.log('API Key found:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key prefix:', apiKey?.substring(0, 10) + '...' || 'None');
  
  if (!apiKey) {
    console.error('❌ No API key found in environment variables');
    return;
  }
  
  // Test 2: Try to import E2B SDK
  try {
    const { Sandbox } = await import('@e2b/code-interpreter');
    console.log('✅ E2B SDK imported successfully');
    
    // Test 3: Try to create a sandbox
    console.log('🚀 Attempting to create sandbox...');
    const sandbox = await Sandbox.create({ apiKey });
    console.log('✅ Sandbox created successfully!');
    console.log('Sandbox ID:', sandbox.id);
    
    // Test 4: Basic sandbox operation
    console.log('🧪 Testing basic sandbox operation...');
    const result = await sandbox.runCode('print("Hello from E2B!")');
    console.log('Code execution result:', result);
    
    // Cleanup
    console.log('🧹 Cleaning up...');
    await sandbox.kill();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ E2B test failed:');
    console.error('Error:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
  }
}

// Run the test
testE2BApiKey().catch(console.error);