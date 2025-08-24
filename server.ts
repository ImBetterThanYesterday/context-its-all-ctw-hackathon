// Backend server with E2B integration
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { Sandbox } from '@e2b/code-interpreter'
// Import Anthropic - will be loaded dynamically if needed
// import { Anthropic } from '@anthropic-ai/sdk'

const app = express()
const port = 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' })) // Increase payload limit for PDFs
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Initialize Anthropic client lazily
let anthropic: any = null
async function getAnthropic() {
  if (!anthropic) {
    const { Anthropic } = await import('@anthropic-ai/sdk')
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return anthropic
}

// Store active sandboxes in memory (in production, use a database)
const activeSandboxes = new Map<string, Sandbox>()

// Store sandbox metadata for cleanup
const sandboxMetadata = new Map<string, { createdAt: Date, lastActivity: Date }>()

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeSandboxes: activeSandboxes.size
  })
})

// Create sandbox endpoint
app.post('/api/e2b/sandbox', async (req, res) => {
  try {
    console.log('🚀 Creating new E2B sandbox...')
    
    const sandbox = await Sandbox.create()
    const sandboxId = sandbox.sandboxId
    
    // Store sandbox for later use
    activeSandboxes.set(sandboxId, sandbox)
    
    console.log(`✅ Sandbox created: ${sandboxId}`)
    
    res.json({
      success: true,
      sandboxId,
      message: 'Sandbox created successfully'
    })
    
  } catch (error) {
    console.error('❌ Failed to create sandbox:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create sandbox'
    })
  }
})

// Chat endpoint for regular AI responses
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }
    
    console.log(`💬 Processing chat message: "${message.substring(0, 50)}..."`)
    
    const anthropicClient = await getAnthropic()
    const claudeMessage = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200, // Reduced for shorter responses
      messages: [{
        role: 'user',
        content: `${context || 'Eres un asistente útil. Da respuestas muy cortas y concisas, máximo 2 líneas. Si el usuario quiere crear algo, responde "¡Perfecto! Voy a crear eso para ti ahora mismo." y nada más.'}\n\nUsuario: ${message}`
      }]
    })
    
    // Handle Claude 4 refusal responses
    if (claudeMessage.stop_reason === 'refusal') {
      console.log('⚠️ Claude refused to respond')
      return res.status(400).json({
        success: false,
        error: 'Content refused by Claude',
        message: 'Claude declined to respond to this request'
      })
    }

    const response = claudeMessage.content[0]
    if (response.type === 'text') {
      console.log(`✅ Chat response generated`)
      
      res.json({
        success: true,
        response: response.text,
        message: 'Chat response generated successfully'
      })
    } else {
      throw new Error('Invalid response from Claude API')
    }
    
  } catch (error) {
    console.error('❌ Chat response failed:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate chat response'
    })
  }
})

// Document analysis endpoint
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { fileContent, fileName, prompt } = req.body
    
    if (!fileContent || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'File content and prompt are required'
      })
    }
    
    console.log(`🔍 Analyzing document: ${fileName}`)
    
    const anthropicClient = await getAnthropic()
    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
    
    // Handle Claude 4 refusal responses
    if (message.stop_reason === 'refusal') {
      console.log('⚠️ Claude refused to analyze document')
      return res.status(400).json({
        success: false,
        error: 'Document analysis refused by Claude',
        message: 'Claude declined to analyze this document'
      })
    }

    const response = message.content[0]
    if (response.type === 'text') {
      console.log(`✅ Document analysis completed`)
      
      res.json({
        success: true,
        analysis: response.text,
        fileName,
        message: 'Document analyzed successfully'
      })
    } else {
      throw new Error('Invalid response from Claude API')
    }
    
  } catch (error) {
    console.error('❌ Document analysis failed:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to analyze document'
    })
  }
})

// Gemini document processing endpoint
app.post('/api/gemini/process-document', async (req, res) => {
  try {
    const { fileData, fileName, mimeType, customPrompt } = req.body
    
    if (!fileData || !fileName || !mimeType) {
      return res.status(400).json({
        success: false,
        error: 'File data, name, and MIME type are required'
      })
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY not configured'
      })
    }
    
    console.log(`🔍 Processing document with Gemini: ${fileName} (${mimeType})`)
    
    // Import Google Generative AI
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp" 
    })

    // Prepare extraction prompt
    const extractionPrompt = customPrompt || `
Analiza este documento PDF y extrae información estructurada en formato JSON. 

El documento puede ser un PRD (Product Requirements Document), especificación técnica, wireframes, o documentos de diseño.

Estructura el JSON de la siguiente manera:
{
  "documentType": "PRD" | "wireframes" | "technical_spec" | "design_doc" | "other",
  "title": "título del documento",
  "summary": "resumen ejecutivo en 2-3 oraciones",
  "sections": [
    {
      "title": "nombre de la sección",
      "content": "contenido principal",
      "type": "introduction" | "requirements" | "features" | "flow" | "technical" | "other"
    }
  ],
  "requirements": [
    "lista de requisitos funcionales y no funcionales identificados"
  ],
  "userFlows": [
    {
      "name": "nombre del flujo",
      "steps": ["paso 1", "paso 2", "..."],
      "screens": ["pantalla 1", "pantalla 2", "..."],
      "priority": "high" | "medium" | "low"
    }
  ],
  "features": [
    {
      "name": "nombre de la funcionalidad",
      "description": "descripción detallada",
      "priority": "high" | "medium" | "low",
      "components": ["componente UI 1", "componente UI 2", "..."]
    }
  ],
  "technicalSpecs": [
    {
      "category": "frontend" | "backend" | "database" | "integration" | "other",
      "requirements": ["especificación técnica 1", "..."]
    }
  ]
}

IMPORTANTE:
- Si hay imágenes, wireframes o diagramas, describe su contenido en detalle
- Identifica todos los componentes UI mencionados o mostrados
- Extrae flujos de usuario paso a paso
- Prioriza features según importancia mencionada o inferida
- Si el documento está en español, mantén el contenido en español
- Si hay información incompleta, indica "información no disponible"

Responde ÚNICAMENTE con el JSON válido, sin texto adicional.
`

    // Prepare the content with file data
    const imagePart = {
      inlineData: {
        data: fileData,
        mimeType: mimeType,
      },
    }

    console.log('🔍 Sending request to Gemini API...')

    // Generate content
    const result = await model.generateContent([extractionPrompt, imagePart])
    const response = await result.response
    const text = response.text()

    console.log('🔍 Gemini raw response received')

    // Try to parse JSON
    let extractedData
    try {
      // Clean the text to extract only JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : text
      extractedData = JSON.parse(jsonText)
      
      console.log('✅ Document processed successfully with Gemini')
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON, using raw text')
      // If JSON parsing fails, create basic structure
      extractedData = {
        documentType: 'other',
        title: fileName,
        summary: text.substring(0, 200) + '...',
        sections: [{
          title: 'Contenido extraído',
          content: text,
          type: 'other'
        }],
        requirements: [],
        userFlows: [],
        features: []
      }
    }

    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    res.json({
      success: true,
      extractedData,
      documentId,
      fileName,
      message: 'Document processed successfully with Gemini'
    })
    
  } catch (error) {
    console.error('❌ Gemini document processing failed:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to process document with Gemini'
    })
  }
})

// Gemini chat endpoint for natural conversations
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, context, conversationHistory = [] } = req.body
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY not configured'
      })
    }
    
    console.log(`💬 Processing Gemini chat: "${message.substring(0, 50)}..."`)
    
    // Import Google Generative AI
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Get the model - using latest Gemini model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp" 
    })

    // Build conversation context
    let fullPrompt = `Eres un asistente inteligente de Rappi Creator, una plataforma para crear aplicaciones web a partir de documentos PRD.

INSTRUCCIONES IMPORTANTES:
- Responde de manera natural, útil y conversacional
- Si el usuario quiere CREAR, GENERAR, CONSTRUIR algo (app, página, sitio web, etc.), responde: "¡Perfecto! Voy a crear eso para ti ahora mismo." y nada más
- Para preguntas normales, responde de manera informativa y útil
- Mantén las respuestas concisas pero completas
- Usa un tono amigable y profesional

CONTEXTO ADICIONAL:
${context || 'Usuario interactuando con Rappi Creator'}

HISTORIAL DE CONVERSACIÓN:
${conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

USUARIO: ${message}`

    console.log('🔍 Sending request to Gemini for chat...')

    // Generate chat response
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    console.log('✅ Gemini chat response generated')

    res.json({
      success: true,
      response: text,
      message: 'Chat response generated successfully with Gemini'
    })
    
  } catch (error) {
    console.error('❌ Gemini chat failed:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate chat response with Gemini'
    })
  }
})

// Generate web app endpoint with optimized E2B integration
app.post('/api/e2b/generate', async (req, res) => {
  let sandbox: Sandbox | null = null
  
  try {
    const { prompt, framework = 'nextjs' } = req.body
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      })
    }
    
    console.log(`🤖 Generating ${framework} app for: "${prompt}"`)
    
    // Step 1: Create optimized sandbox with 5-minute timeout (E2B standard)
    sandbox = await Sandbox.create({ 
      timeoutMs: 5 * 60 * 1000 // 5 minutes (E2B recommended)
    })
    const sandboxId = sandbox.sandboxId
    activeSandboxes.set(sandboxId, sandbox)
    
    // Track sandbox metadata for cleanup
    sandboxMetadata.set(sandboxId, {
      createdAt: new Date(),
      lastActivity: new Date()
    })
    
    console.log(`📦 Optimized sandbox created: ${sandboxId}`)
    
    // Step 2: Generate HTML directly with Claude (simplified approach)
    console.log(`🧠 Generating HTML with Claude 4 Sonnet...`)
    const generatedHTML = await generateCodeWithClaude(prompt, framework)
    
    // Step 3: Create simple project structure (ONLY directory, no config files)
    const projectName = generateProjectName(prompt)
    const projectPath = `/home/user/${projectName}`
    
    console.log(`📁 Creating simple project: ${projectName}`)
    
    // Create project directory (no subdirs needed)
    await sandbox.commands.run(`mkdir -p ${projectName}`, {
      workdir: '/home/user',
      timeoutMs: 30000
    })
    
    console.log(`✅ Project directory created`)
    
    // Step 4: Write ONLY the generated HTML file
    await sandbox.files.write(`${projectPath}/index.html`, generatedHTML)
    
    console.log(`📝 HTML file created`)
    
    // Step 5: Use E2B static file serving with HTTP server (but no processing)
    console.log(`🚀 Starting basic HTTP server for static files...`)
    
    // Use E2B's getHost method to get the correct URL
    const port = 3000
    
    // Start simple HTTP server for static files (E2B built-in)
    const serverCommand = `cd ${projectPath} && python3 -m http.server ${port} --bind 0.0.0.0`
    
    const devServerProcess = sandbox.commands.run(serverCommand, {
      workdir: '/home/user',
      background: true,
      timeoutMs: 0, // No timeout - server runs indefinitely
      onStdout: (data) => {
        console.log(`🖥️ Server: ${data.trim()}`)
      },
      onStderr: (data) => {
        console.log(`🖥️ Server error: ${data.trim()}`)
      }
    })
    
    // Wait for server to be fully ready
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    const previewUrl = `https://${sandbox.getHost(port)}`
    
    console.log(`✅ Application ready at: ${previewUrl}`)
    
    res.json({
      success: true,
      sandboxId,
      projectName,
      framework,
      previewUrl,
      message: 'Web application generated successfully',
      generationTime: Date.now(),
      optimized: true
    })
    
  } catch (error) {
    console.error('❌ Generation failed:', error)
    
    // Enhanced error reporting
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    // Cleanup sandbox on error
    if (sandbox) {
      try {
        console.log('🧹 Cleaning up failed sandbox...')
        await sandbox.kill()
        activeSandboxes.delete(sandbox.sandboxId)
        sandboxMetadata.delete(sandbox.sandboxId)
        console.log('✅ Sandbox cleanup completed')
      } catch (cleanupError) {
        console.error('⚠️ Sandbox cleanup failed:', cleanupError)
      }
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      message: 'Failed to generate web application',
      timestamp: new Date().toISOString(),
      cleanup: 'completed'
    })
  }
})

// Modify existing sandbox endpoint
app.post('/api/e2b/modify/:sandboxId', async (req, res) => {
  try {
    const { sandboxId } = req.params
    const { prompt, framework = 'nextjs' } = req.body
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      })
    }

    console.log(`🔄 Modifying existing sandbox: ${sandboxId} with prompt: "${prompt}"`)
    
    // Get existing sandbox
    const sandbox = activeSandboxes.get(sandboxId)
    
    if (!sandbox) {
      return res.status(404).json({
        success: false,
        error: 'Sandbox not found or expired'
      })
    }

    // Update sandbox metadata
    const metadata = sandboxMetadata.get(sandboxId)
    if (metadata) {
      metadata.lastActivity = new Date()
      sandboxMetadata.set(sandboxId, metadata)
    }

    // Generate new HTML with Claude
    console.log(`🧠 Generating updated HTML with Claude 4 Sonnet...`)
    const generatedHTML = await generateCodeWithClaude(prompt, framework)
    
    // Update the existing project
    const projectName = `project-${Date.now().toString().slice(-4)}`
    const projectPath = `/home/user/${projectName}`
    
    console.log(`📁 Updating project in sandbox: ${projectName}`)
    
    // Create new project directory
    await sandbox.commands.run(`mkdir -p ${projectName}`, {
      workdir: '/home/user',
      timeoutMs: 30000
    })
    
    // Write updated HTML file
    await sandbox.files.write(`${projectPath}/index.html`, generatedHTML)
    
    console.log(`📝 Updated HTML file written`)
    
    // Kill any existing server processes
    try {
      await sandbox.commands.run(`pkill -f "python3.*http.server"`, {
        workdir: '/home/user',
        timeoutMs: 10000
      })
      console.log('🔄 Killed existing server processes')
    } catch (error) {
      console.log('ℹ️ No existing server processes to kill')
    }
    
    // Start new HTTP server
    console.log(`🚀 Starting updated HTTP server...`)
    const port = 3000
    const serverCommand = `cd ${projectPath} && python3 -m http.server ${port} --bind 0.0.0.0`
    
    const devServerProcess = sandbox.commands.run(serverCommand, {
      workdir: '/home/user',
      background: true,
      timeoutMs: 0,
      onStdout: (data) => {
        console.log(`🖥️ Updated Server: ${data.trim()}`)
      },
      onStderr: (data) => {
        console.log(`🖥️ Updated Server error: ${data.trim()}`)
      }
    })
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const previewUrl = `https://${sandbox.getHost(port)}`
    
    console.log(`✅ Sandbox modified successfully: ${previewUrl}`)
    
    res.json({
      success: true,
      sandboxId,
      projectName,
      framework,
      previewUrl,
      message: 'Sandbox modified successfully',
      generationTime: Date.now(),
      modified: true
    })
    
  } catch (error) {
    console.error('❌ Sandbox modification failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      message: 'Failed to modify sandbox',
      timestamp: new Date().toISOString()
    })
  }
})

// List active sandboxes
app.get('/api/e2b/sandboxes', (req, res) => {
  const sandboxes = Array.from(activeSandboxes.keys()).map(id => ({
    sandboxId: id,
    status: 'active'
  }))
  
  res.json({
    success: true,
    sandboxes,
    count: sandboxes.length
  })
})

// Kill sandbox endpoint
app.delete('/api/e2b/sandbox/:sandboxId', async (req, res) => {
  try {
    const { sandboxId } = req.params
    const sandbox = activeSandboxes.get(sandboxId)
    
    if (!sandbox) {
      return res.status(404).json({
        success: false,
        error: 'Sandbox not found'
      })
    }
    
    await sandbox.kill()
    activeSandboxes.delete(sandboxId)
    
    console.log(`🗑️ Sandbox killed: ${sandboxId}`)
    
    res.json({
      success: true,
      message: 'Sandbox terminated successfully'
    })
    
  } catch (error) {
    console.error('❌ Failed to kill sandbox:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Helper functions
function generateProjectName(prompt: string): string {
  const words = prompt.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 3)
  
  const name = words.length > 0 ? words.join('-') : 'my-app'
  return `${name}-${Date.now().toString().slice(-4)}`
}

async function generateCodeWithClaude(prompt: string, framework: string) {
  const anthropicClient = await getAnthropic()
  const message = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `# Rappi App Generator - Sistema Completo de Diseño

Eres un experto desarrollador web especializado en crear aplicaciones móviles para **Rappi**, la plataforma de entregas todo-en-uno. Tu misión: "Hacer la vida urbana más fácil, rápida y conveniente".

## SOLICITUD DEL USUARIO
"${prompt}"

## 🧬 IDENTIDAD DE MARCA RAPPI
- **Slogan**: "Si tienes Rappi, tienes todo."
- **Tono**: juvenil, tecnológica, eficiente, humana, energética
- **Promesa**: Entrega inmediata, experiencia fluida y atención cercana
- **Target**: millennials, gen Z, profesionales urbanos

## 🎨 SISTEMA DE COLORES OFICIAL

### Colores Principales
- **Rappi Orange**: #FF441F (backgrounds hero, buttons CTA, iconos destacados)
- **Blanco**: #FFFFFF
- **Gris Claro**: #F7F7F7
- **Gris Medio**: #BDBDBD
- **Gris Oscuro**: #424242

### Colores de Acento
- **Success Green**: #00C853
- **Alert Red**: #D32F2F
- **Info Blue**: #2196F3
- **Highlight Yellow**: #FFEB3B

### Fondos por Categoría
- **Super**: #B6F075
- **Restaurantes**: #FF7043
- **Farmacia**: #B3E5FC
- **Tecnología**: #D1C4E9
- **Licores**: #FFF9C4
- **Turbo**: #C8E6C9

### Gradientes de Botones
- **Principal**: linear-gradient(#FF5E3A, #FF2A68)

## 🔠 TIPOGRAFÍA ROBOTO

### Jerarquía Visual
- **H1**: 36px, peso 700, line-height 44px
- **H2**: 28px, peso 600
- **H3**: 20px, peso 500
- **Body**: 16px, peso 400
- **Caption**: 12px, peso 300
- **CTA Text**: Mayúsculas, peso 600+, centrado

## 🧩 SISTEMA DE DISEÑO

### Layout
- **Sistema de espaciado**: 8pt grid
- **Card padding**: 16px
- **Section gap**: 24-32px
- **Max width**: 1280px

### Bordes
- **Botones**: 999px (pill)
- **Cards**: 16px
- **Inputs**: 12px

### Sombras
- **Light**: 0px 1px 4px rgba(0,0,0,0.1)
- **Medium**: 0px 4px 8px rgba(0,0,0,0.15)

### Botones Especificados
1. **Primary**: background #FF441F, text #FFFFFF, shape pill, hover-lighten, tap-scale
2. **Secondary**: outline #FF441F, text #FF441F
3. **Blue Promo**: background #007BFF, text #FFFFFF, fontWeight 600

### Inputs
- **Estilo**: ghost with icon
- **Border**: soft gray
- **Focus**: highlight orange glow

## 📲 EXPERIENCIA DE USUARIO

### Flujo de Entrada
1. **Ubicación primero**: "¿Dónde quieres recibir tu compra?"
2. **Luego categorías**

### Microcopies Oficiales
- **Input placeholder**: "¿Dónde quieres recibir tu compra?"
- **Login prompt**: "Iniciar sesión para ver tus direcciones recientes"
- **CTA default**: "¡Pide ya!"
- **Promo**: "Descubre las promociones que tenemos para ti"

### Navegación
- **Tipo**: Bottom Navigation en móvil
- **Secciones**: Inicio, Ofertas, Favoritos, Cuenta
- **Colores**: #FF441F activo, gris inactivo

### Interacciones
- **Efecto toque**: elevación + sombreado
- **Cambios estado**: cambio de color y animación suave
- **Feedback**: notificaciones suaves, microinteracciones

## 🖼️ LENGUAJE VISUAL

### Iconografía
- **Estilo**: Flat vector, 3D-styled emojis, filled, rounded corners
- **Tamaños**: 24px o 32px
- **Colores**: primary orange, category-specific backgrounds

### Lenguaje
- **Voz**: casual, positiva, directa
- **Ejemplos**: "¡Tu pedido va en camino! 🚴‍♂️", "¡Listo para disfrutar! 🍔"
- **Emojis**: compatibles Android/iOS, expresivos pero no saturados

## 💡 EMOCIONES ESPERADAS
- **Principales**: comodidad, agilidad, diversión, confianza, solución rápida
- **Pantalla inicio**: "¡Todo lo que necesitas en un solo lugar!"
- **Espera repartidor**: "Tu pedido está en camino 🛵"
- **Búsqueda**: "Estamos encontrando lo mejor para ti 👀"
- **Promociones**: "¡Aprovecha antes de que se acabe!"

## 🔐 ACCESIBILIDAD
- **Contraste texto**: AA WCAG mínimo
- **Botones mínimo**: 48px tap target
- **Navegación teclado**: soportada
- **Alt text**: obligatorio
- **Aria roles**: implementados

## INSTRUCCIONES CRÍTICAS DE EJECUCIÓN

**RESPONDE ÚNICAMENTE CON CÓDIGO HTML COMPLETO Y FUNCIONAL**
- NO incluyas explicaciones, comentarios adicionales o texto fuera del código HTML
- NO uses JSX, React, Vue o cualquier framework
- El código debe ser un archivo HTML completo y funcional

## ELEMENTOS OBLIGATORIOS DE LA INTERFAZ

1. **Header Rappi** con:
   - Logo "Rappi" en #FF441F
   - "¿Dónde quieres recibir tu compra?" con icono ubicación
   - Icono cuenta/perfil
   - Fondo blanco con shadow light

2. **Barra de búsqueda**:
   - Border radius 12px, ghost style with icon
   - Placeholder contextual
   - Focus con orange glow

3. **Categorías horizontales**:
   - Scroll horizontal, iconos 32px
   - Fondos por categoría especificados
   - Nombres en Roboto 12px/300

4. **Cards de productos**:
   - Border radius 16px, padding 16px
   - Shadow medium
   - Precios en format COP
   - Ratings con estrellas
   - Tiempo entrega

5. **Botones**:
   - Pill shape (999px)
   - Primary: #FF441F con gradient opcional
   - CTAs en mayúsculas, peso 600+
   - Efectos hover y tap

6. **Bottom Navigation**:
   - Inicio, Ofertas, Favoritos, Cuenta
   - Iconos 24px
   - Activo: #FF441F, inactivo: #BDBDBD

## RESTRICCIONES
- Mobile-first (375px base)
- Sistema 8pt spacing
- Font family: Roboto, sans-serif
- Colores EXACTOS especificados
- Microcopies oficiales de Rappi
- NO crear blogs o landing pages
- SÍ crear mockups funcionales de app móvil

## FORMATO DE RESPUESTA
*IMPORTANTE: Responde ÚNICAMENTE con el código HTML completo, sin texto adicional.*

Crea una interfaz móvil auténtica de Rappi que refleje perfectamente la identidad de marca, sistema de colores, tipografía y UX patterns oficiales.`
    }]
  })
  
  // Handle Claude 4 refusal responses
  if (message.stop_reason === 'refusal') {
    console.log('⚠️ Claude refused to generate code')
    return generateFallbackCode(prompt, framework)
  }

  const response = message.content[0]
  if (response.type === 'text') {
    // Claude now returns HTML directly, not JSON
    return response.text.trim()
  }
  
  return generateFallbackCode(prompt, framework)
}

function generateFallbackCode(prompt: string, framework: string) {
  // Return 1995-style HTML fallback that Babel CANNOT transform
  return '<!DOCTYPE html><html><head><title>App</title><style>body{margin:0;font-family:Arial;background:#667eea;padding:20px}div{background:white;padding:20px;text-align:center;border-radius:10px;max-width:400px;margin:0 auto}button{background:#007bff;color:white;border:none;padding:10px;cursor:pointer}</style></head><body><div><h1>App Generated</h1><p>Request: ' + prompt + '</p><button onclick="alert(' + "'" + 'Working!' + "'" + ')">Test</button></div><script>var message=' + "'" + 'Hello from 1995!' + "'" + ';console.log(message);</script></body></html>'
}


async function waitForServer(sandbox: Sandbox, port: number, maxAttempts: number = 60): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await sandbox.commands.run(`curl -f http://localhost:${port} || echo "not ready"`, {
        timeoutMs: 10000 // 10 seconds timeout for each curl attempt
      })
      if (!result.stdout.includes('not ready')) {
        console.log(`✅ Server is ready after ${attempt + 1} attempts`)
        return // Server is ready
      }
      console.log(`⏳ Waiting for server... attempt ${attempt + 1}/${maxAttempts}`)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds between attempts
    } catch (error) {
      console.log(`⏳ Server not ready yet... attempt ${attempt + 1}/${maxAttempts}`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  throw new Error('Development server failed to start within timeout')
}

async function waitForServerOptimized(sandbox: Sandbox, port: number, maxAttempts: number = 30): Promise<void> {
  console.log(`🔍 Waiting for server on port ${port}...`)
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Multiple check strategies for better reliability
      const checks = [
        `curl -s -o /dev/null -w "%{http_code}" http://localhost:${port}`,
        `nc -z localhost ${port} && echo "port_open" || echo "port_closed"`
      ]
      
      for (const checkCommand of checks) {
        const result = await sandbox.commands.run(checkCommand, {
          timeoutMs: 5000, // 5 seconds per check
          onStdout: (data) => {
            if (data.includes('200') || data.includes('port_open')) {
              console.log(`✅ Server responding on port ${port}`)
            }
          }
        })
        
        // Check if server is responding
        if (result.stdout.includes('200') || result.stdout.includes('port_open')) {
          console.log(`✅ Server is ready after ${attempt + 1} attempts`)
          
          // Double-check with a quick HTTP request
          try {
            const finalCheck = await sandbox.commands.run(`curl -s http://localhost:${port}`, {
              timeoutMs: 3000
            })
            if (finalCheck.stdout.trim()) {
              console.log(`🎉 Server confirmed working with content`)
              return
            }
          } catch {
            // Continue if final check fails
          }
        }
      }
      
      console.log(`⏳ Server not ready yet... attempt ${attempt + 1}/${maxAttempts}`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second between attempts
      
    } catch (error) {
      console.log(`⏳ Server check failed... attempt ${attempt + 1}/${maxAttempts}`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  // If we get here, give one final chance
  console.log(`⚠️ Server might be ready but not responding to health checks`)
  console.log(`🚀 Proceeding with server URL generation...`)
}

// DISABLED: Automatic cleanup function - sandboxes will NOT auto-close
// This ensures generated apps stay available for manual testing
async function cleanupOldSandboxes() {
  console.log('🔒 Sandbox auto-cleanup DISABLED - keeping all sandboxes alive')
  console.log(`📊 Active sandboxes: ${activeSandboxes.size}`)
}

// DISABLED: No automatic cleanup - sandboxes stay alive until manually killed
// setInterval(cleanupOldSandboxes, 5 * 60 * 1000)

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
  console.log(`📋 Available endpoints:`)
  console.log(`   GET  /health`)
  console.log(`   POST /api/chat`)
  console.log(`   POST /api/analyze-document`)
  console.log(`   POST /api/e2b/sandbox`)
  console.log(`   POST /api/e2b/generate`)
  console.log(`   GET  /api/e2b/sandboxes`)
  console.log(`   DELETE /api/e2b/sandbox/:sandboxId`)
})

export default app