// Frontend API service to communicate with backend
import { apiConfig, buildApiUrl } from '@/config/api-config'

export interface GenerateWebAppRequest {
  prompt: string
  framework: 'react' | 'nextjs' | 'vite'
}

export interface GenerateWebAppResponse {
  success: boolean
  sandboxId?: string
  projectName?: string
  framework?: string
  previewUrl?: string
  message?: string
  error?: string
}

export interface SandboxInfo {
  sandboxId: string
  status: string
}

export interface ApiError extends Error {
  status?: number
  details?: any
}

export interface GeminiProcessRequest {
  fileData: string
  fileName: string
  mimeType: string
  customPrompt?: string
}

export interface GeminiProcessResponse {
  success: boolean
  extractedData?: any
  documentId?: string
  fileName?: string
  message?: string
  error?: string
}

class ApiService {
  
  async healthCheck(): Promise<any> {
    const response = await fetch(buildApiUrl(apiConfig.endpoints.health))
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`)
    }
    return response.json()
  }

  async generateWebApp(
    request: GenerateWebAppRequest,
    onProgress?: (message: string) => void
  ): Promise<GenerateWebAppResponse> {
    try {
      onProgress?.('🚀 Enviando solicitud al servidor...')
      
      const response = await fetch(buildApiUrl(apiConfig.endpoints.e2b.generate), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const result = await response.json()

      if (!response.ok) {
        const error: ApiError = new Error(result.message || 'Failed to generate web app')
        error.status = response.status
        error.details = result
        throw error
      }

      return result
    } catch (error) {
      console.error('❌ API Error:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se pudo conectar con el servidor. Asegúrate de que el servidor backend esté ejecutándose en ${apiConfig.baseUrl}`)
      }
      
      throw error
    }
  }

  async createSandbox(): Promise<{ sandboxId: string }> {
    const response = await fetch(buildApiUrl(apiConfig.endpoints.e2b.sandbox), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create sandbox')
    }

    return result
  }

  async listSandboxes(): Promise<SandboxInfo[]> {
    const response = await fetch(buildApiUrl(apiConfig.endpoints.e2b.sandboxes))
    
    if (!response.ok) {
      throw new Error(`Failed to list sandboxes: ${response.status}`)
    }
    
    const result = await response.json()
    return result.sandboxes || []
  }

  async killSandbox(sandboxId: string): Promise<void> {
    const response = await fetch(buildApiUrl(apiConfig.endpoints.e2b.delete(sandboxId)), {
      method: 'DELETE',
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.message || 'Failed to kill sandbox')
    }
  }

  async modifySandbox(
    sandboxId: string,
    request: GenerateWebAppRequest,
    onProgress?: (message: string) => void
  ): Promise<GenerateWebAppResponse> {
    try {
      onProgress?.('🔄 Modificando sandbox existente...')
      
      const response = await fetch(buildApiUrl(apiConfig.endpoints.e2b.modify(sandboxId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const result = await response.json()

      if (!response.ok) {
        const error: ApiError = new Error(result.message || 'Failed to modify sandbox')
        error.status = response.status
        error.details = result
        throw error
      }

      onProgress?.('✅ Sandbox modificado exitosamente')
      return result
    } catch (error) {
      console.error('❌ Sandbox Modification API Error:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se pudo conectar con el servidor. Asegúrate de que el servidor backend esté ejecutándose en ${apiConfig.baseUrl}`)
      }
      
      throw error
    }
  }

  async processDocumentWithGemini(
    file: File,
    customPrompt?: string,
    onProgress?: (message: string) => void
  ): Promise<GeminiProcessResponse> {
    try {
      onProgress?.('📄 Preparando archivo para procesamiento...')
      
      // Convert file to base64
      const fileData = await this.fileToBase64(file)
      
      onProgress?.('🔍 Enviando archivo a Gemini para análisis...')
      
      const request: GeminiProcessRequest = {
        fileData,
        fileName: file.name,
        mimeType: file.type,
        customPrompt
      }

      const response = await fetch(buildApiUrl(apiConfig.endpoints.gemini.processDocument), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const result = await response.json()

      if (!response.ok) {
        const error: ApiError = new Error(result.message || 'Failed to process document with Gemini')
        error.status = response.status
        error.details = result
        throw error
      }

      onProgress?.('✅ Documento procesado exitosamente')
      return result
      
    } catch (error) {
      console.error('❌ Gemini API Error:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se pudo conectar con el servidor. Asegúrate de que el servidor backend esté ejecutándose en ${apiConfig.baseUrl}`)
      }
      
      throw error
    }
  }

  async chatWithGemini(
    message: string,
    context?: string,
    conversationHistory?: Array<{role: string, content: string}>
  ): Promise<{success: boolean, response: string, message: string}> {
    try {
      const request = {
        message,
        context,
        conversationHistory: conversationHistory || []
      }

      const response = await fetch(buildApiUrl(apiConfig.endpoints.gemini.chat), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const result = await response.json()

      if (!response.ok) {
        const error: ApiError = new Error(result.message || 'Failed to chat with Gemini')
        error.status = response.status
        error.details = result
        throw error
      }

      return result
      
    } catch (error) {
      console.error('❌ Gemini Chat API Error:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se pudo conectar con el servidor. Asegúrate de que el servidor backend esté ejecutándose en ${apiConfig.baseUrl}`)
      }
      
      throw error
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove the "data:type/subtype;base64," prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Simulate streaming-like updates for better UX
  async generateWebAppWithProgress(
    request: GenerateWebAppRequest,
    onProgress: (stage: string, message: string, progress?: number) => void
  ): Promise<GenerateWebAppResponse> {
    
    // Simulate progress updates
    onProgress('initializing', 'Conectando con el servidor...', 0)
    await this.delay(500)
    
    onProgress('creating_sandbox', 'Creando sandbox E2B en la nube...', 10)
    await this.delay(1000)
    
    onProgress('generating_code', 'Generando código con Claude...', 30)
    await this.delay(500)
    
    try {
      // Make the actual API call
      const result = await this.generateWebApp(request, (msg) => {
        onProgress('generating_code', msg, 60)
      })
      
      onProgress('starting_server', 'Iniciando servidor de desarrollo...', 80)
      await this.delay(1000)
      
      if (result.success) {
        onProgress('ready', '¡Aplicación lista!', 100)
        return result
      } else {
        onProgress('error', result.error || 'Error desconocido', 0)
        throw new Error(result.error || 'Generation failed')
      }
      
    } catch (error) {
      onProgress('error', error instanceof Error ? error.message : 'Error desconocido', 0)
      throw error
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const apiService = new ApiService()

// Legacy interfaces for backward compatibility
export interface CodeGenerationProgress {
  stage: 'initializing' | 'creating_sandbox' | 'generating_code' | 'starting_server' | 'ready' | 'error'
  message: string
  details?: string
  progress?: number
  previewUrl?: string
  projectId?: string
}

export type ProgressCallback = (progress: CodeGenerationProgress) => void

// Legacy bridge class for backward compatibility with existing chat interface
export class E2BClaudeBridge {
  async generateWebApp(
    prompt: string,
    framework: 'react' | 'nextjs' | 'vite' = 'nextjs',
    onProgress?: ProgressCallback
  ): Promise<{ previewUrl: string; projectId: string }> {
    
    const result = await apiService.generateWebAppWithProgress(
      { prompt, framework },
      (stage, message, progress) => {
        onProgress?.({
          stage: stage as any,
          message,
          progress,
          details: stage === 'error' ? message : undefined
        })
      }
    )
    
    if (!result.success || !result.previewUrl || !result.sandboxId) {
      throw new Error(result.error || 'Failed to generate web app')
    }
    
    return {
      previewUrl: result.previewUrl,
      projectId: result.sandboxId
    }
  }

  getProjectStatus(projectId: string) {
    // This would need to be implemented to call the backend
    return undefined
  }

  getActiveProjects() {
    // This would need to be implemented to call the backend
    return []
  }

  async stopProject(projectId: string): Promise<void> {
    await apiService.killSandbox(projectId)
  }

  async cleanup(): Promise<void> {
    // Clean up any resources if needed
  }
}

// Export singleton instance for backward compatibility
export const e2bClaudeBridge = new E2BClaudeBridge()