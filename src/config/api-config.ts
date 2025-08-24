// API Configuration
// Centralized configuration for backend API URLs and settings

interface ApiConfig {
  baseUrl: string
  timeout: number
  endpoints: {
    health: string
    chat: string
    analyzeDocument: string
    e2b: {
      generate: string
      sandbox: string
      sandboxes: string
      modify: (sandboxId: string) => string
      delete: (sandboxId: string) => string
    }
    gemini: {
      processDocument: string
      chat: string
    }
    agent: {
      generate: string
    }
  }
}

// Environment-based configuration
const getBaseUrl = (): string => {
  // Check for environment variable first
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__
  }
  
  // Check for Vite environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // Default to localhost in development
  return 'http://localhost:3001'
}

export const apiConfig: ApiConfig = {
  baseUrl: getBaseUrl(),
  timeout: 30000, // 30 seconds
  endpoints: {
    health: '/health',
    chat: '/api/chat',
    analyzeDocument: '/api/analyze-document',
    e2b: {
      generate: '/api/e2b/generate',
      sandbox: '/api/e2b/sandbox',
      sandboxes: '/api/e2b/sandboxes',
      modify: (sandboxId: string) => `/api/e2b/modify/${sandboxId}`,
      delete: (sandboxId: string) => `/api/e2b/sandbox/${sandboxId}`
    },
    gemini: {
      processDocument: '/api/gemini/process-document',
      chat: '/api/gemini/chat'
    },
    agent: {
      generate: '/api/agent/generate'
    }
  }
}

// Helper function to build full URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${apiConfig.baseUrl}${endpoint}`
}

// Export the base URL for direct access
export const API_BASE_URL = apiConfig.baseUrl

// Helper to update base URL at runtime (useful for development/testing)
export const updateApiBaseUrl = (newBaseUrl: string): void => {
  (apiConfig as any).baseUrl = newBaseUrl
}

export default apiConfig
