import { e2bClaudeBridge, CodeGenerationProgress } from './src/lib/e2b-claude-bridge.js';

async function testE2BClaudeIntegration() {
  console.log('🧪 Testing E2B + Claude Code Integration');
  console.log('='.repeat(60));

  try {
    // Test project: Simple landing page
    const testPrompt = "Crea una landing page moderna para una startup de delivery de comida con React y Tailwind CSS";
    
    console.log(`📝 Test Prompt: ${testPrompt}`);
    console.log('='.repeat(60));

    // Track progress
    const progressUpdates: CodeGenerationProgress[] = [];
    
    const result = await e2bClaudeBridge.generateWebApp(
      testPrompt,
      'nextjs', // Using Next.js for this test
      (progress: CodeGenerationProgress) => {
        progressUpdates.push(progress);
        console.log(`[${progress.stage.toUpperCase()}] ${progress.message}`);
        if (progress.progress) {
          console.log(`Progress: ${progress.progress}%`);
        }
        if (progress.details) {
          console.log(`Details: ${progress.details}`);
        }
        console.log('-'.repeat(40));
      }
    );

    console.log('='.repeat(60));
    console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`🌐 Preview URL: ${result.previewUrl}`);
    console.log(`📦 Project ID: ${result.projectId}`);
    console.log(`📊 Total Progress Updates: ${progressUpdates.length}`);
    
    // Show progress summary
    console.log('\n📈 Progress Summary:');
    progressUpdates.forEach((update, index) => {
      console.log(`  ${index + 1}. ${update.stage}: ${update.message} ${update.progress ? `(${update.progress}%)` : ''}`);
    });

    // Test project status
    console.log('\n🔍 Project Status:');
    const projectStatus = e2bClaudeBridge.getProjectStatus(result.projectId);
    if (projectStatus) {
      console.log(`  - Name: ${projectStatus.name}`);
      console.log(`  - Framework: ${projectStatus.framework}`);
      console.log(`  - Status: ${projectStatus.status}`);
      console.log(`  - Port: ${projectStatus.port}`);
      console.log(`  - Preview URL: ${projectStatus.previewUrl}`);
    }

    // Test active projects list
    console.log('\n📋 Active Projects:');
    const activeProjects = e2bClaudeBridge.getActiveProjects();
    console.log(`  Total active projects: ${activeProjects.length}`);
    activeProjects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.name} (${project.status})`);
    });

    console.log('\n✅ Integration test completed successfully!');
    console.log('🎯 The E2B + Claude Code bridge is working correctly');
    console.log('🌐 Preview URL can be used in iframe for live preview');

    return result;

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(60));
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    throw error;
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    try {
      await e2bClaudeBridge.cleanup();
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError);
    }
  }
}

// Simplified test for basic E2B functionality
async function testBasicE2BFunctionality() {
  console.log('\n🔧 Testing Basic E2B Functionality');
  console.log('='.repeat(60));

  try {
    const { E2BService } = await import('./src/lib/e2b-service.js');
    const e2bService = new E2BService();

    // Test sandbox creation
    console.log('1. Creating E2B sandbox...');
    await e2bService.createSandbox();
    console.log('✅ Sandbox created');

    // Test basic code execution
    console.log('2. Testing basic code execution...');
    const result = await e2bService.executeCode('print("Hello from E2B sandbox!")');
    console.log('✅ Code executed:', result);

    // Test project creation
    console.log('3. Testing web project creation...');
    const project = await e2bService.createWebProject('test-app', 'nextjs');
    console.log('✅ Project created:', project);

    // Cleanup
    console.log('4. Cleaning up...');
    await e2bService.closeSandbox();
    console.log('✅ Basic functionality test completed');

  } catch (error) {
    console.error('❌ Basic functionality test failed:', error);
    throw error;
  }
}

// Main test runner
async function runTests() {
  try {
    console.log('🚀 Starting E2B + Claude Integration Tests');
    console.log('='.repeat(60));
    
    // First test basic E2B functionality
    await testBasicE2BFunctionality();
    
    // Then test full integration
    await testE2BClaudeIntegration();
    
    console.log('\n' + '🎊'.repeat(20));
    console.log('🎉 ALL TESTS PASSED! 🎉');
    console.log('🎊'.repeat(20));
    console.log('\n✨ Your E2B + Claude Code integration is ready!');
    console.log('💡 You can now use the chat interface to generate applications');
    console.log('🌐 Generated apps will appear in the preview panel');
    
  } catch (error) {
    console.error('\n' + '💥'.repeat(20));
    console.error('💥 TESTS FAILED! 💥');
    console.error('💥'.repeat(20));
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly (only in Node.js environment)
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}