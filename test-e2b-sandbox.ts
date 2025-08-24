import { E2BService } from './src/lib/e2b-service.js';

async function testE2BSandbox() {
  const e2bService = new E2BService();

  try {
    // Test 1: Create sandbox
    console.log('='.repeat(50));
    console.log('🧪 Test 1: Creating E2B Sandbox');
    console.log('='.repeat(50));
    await e2bService.createSandbox();
    
    // Test 2: Basic code execution
    console.log('\n' + '='.repeat(50));
    console.log('🧪 Test 2: Basic Code Execution');
    console.log('='.repeat(50));
    const basicCode = `
print("Hello from E2B Sandbox!")
print("Python version:", __import__('sys').version)
result = 2 + 2
print(f"2 + 2 = {result}")
`;
    const basicResult = await e2bService.executeCode(basicCode);
    console.log('Basic execution result:', basicResult);

    // Test 3: Data analysis code execution
    console.log('\n' + '='.repeat(50));
    console.log('🧪 Test 3: Data Analysis Code Execution');
    console.log('='.repeat(50));
    const dataCode = `
import pandas as pd
import numpy as np

# Create sample data
data = {
    'numbers': [1, 2, 3, 4, 5],
    'squares': [x**2 for x in [1, 2, 3, 4, 5]]
}
df = pd.DataFrame(data)
print("Sample DataFrame:")
print(df)
print(f"Sum of numbers: {df['numbers'].sum()}")
print(f"Mean of squares: {df['squares'].mean()}")
`;
    const dataResult = await e2bService.executeCode(dataCode);
    console.log('Data analysis execution result:', dataResult);

    // Test 4: File operations
    console.log('\n' + '='.repeat(50));
    console.log('🧪 Test 4: File Operations');
    console.log('='.repeat(50));
    await e2bService.createFile('/home/user/test.txt', 'Hello from E2B file system!');
    await e2bService.listFiles('/home/user');
    
    // Read the file we just created
    const readFileCode = `
with open('/home/user/test.txt', 'r') as f:
    content = f.read()
    print("File content:", content)
`;
    await e2bService.executeCode(readFileCode);

    // Test 5: Sandbox info
    console.log('\n' + '='.repeat(50));
    console.log('🧪 Test 5: Sandbox Information');
    console.log('='.repeat(50));
    const sandboxInfo = e2bService.getSandboxInfo();
    console.log('Sandbox Info:', sandboxInfo);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All tests completed successfully!');
    console.log('✅ E2B Sandbox is working correctly');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('❌ Test failed:', error);
    console.error('='.repeat(50));
  } finally {
    // Clean up
    console.log('\n🧹 Cleaning up...');
    await e2bService.closeSandbox();
  }
}

// Run the test
testE2BSandbox().catch(console.error);