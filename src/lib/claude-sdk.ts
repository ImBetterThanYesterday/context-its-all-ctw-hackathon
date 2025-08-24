// Frontend-only Claude SDK wrapper that calls backend API

export async function buildWithClaude(prompt: string): Promise<void> {
  try {
    console.log(`🚀 Starting Claude Code generation for: "${prompt}"`);
    console.log("=".repeat(50));
    
    const response = await fetch('http://localhost:3001/api/e2b/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        framework: 'vite'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📄 Generation result:', result);
    
    console.log("=".repeat(50));
    console.log('🎉 Build completed!');
    
    return result;
  } catch (error) {
    console.error('❌ Error building with Claude:', error);
    throw error;
  }
}

export { buildWithClaude as default };