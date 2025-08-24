// Smart Context Manager for intelligent context handling in AI conversations
import { ChatMessage, DocumentContext } from './chat-persistence';

export enum ContextType {
  CODE_GENERATION = 'code_generation',
  CONVERSATION = 'conversation', 
  DOCUMENT_ANALYSIS = 'document_analysis'
}

export enum RequestIntent {
  GENERATE_CODE = 'generate_code',
  MODIFY_EXISTING = 'modify_existing',
  CHAT = 'chat',
  ANALYZE_DOCUMENT = 'analyze_document'
}

export interface ContextConfig {
  maxDocumentTokens: number;
  maxChatTokens: number;
  maxTotalTokens: number;
  slidingWindowSize: number;
  includeDocuments: boolean;
  includeChatHistory: boolean;
  documentRelevanceThreshold: number; // hours
}

export interface SmartContext {
  type: ContextType;
  intent: RequestIntent;
  finalPrompt: string;
  tokenCount: number;
  documentsUsed: DocumentContext[];
  messagesUsed: ChatMessage[];
  confidence: number;
}

class SmartContextManager {
  private readonly defaultConfigs: Record<ContextType, ContextConfig> = {
    [ContextType.CODE_GENERATION]: {
      maxDocumentTokens: 80000, // Increased for better document integration
      maxChatTokens: 0, // No chat history for code generation (keeps it clean)
      maxTotalTokens: 100000, // Increased for comprehensive context
      slidingWindowSize: 0,
      includeDocuments: true,
      includeChatHistory: false,
      documentRelevanceThreshold: 24 // Extended to 24 hours - longer document retention
    },
    [ContextType.CONVERSATION]: {
      maxDocumentTokens: 30000, // Increased from 1000 - can reference more document content
      maxChatTokens: 40000, // Increased from 1500 - much longer conversation memory
      maxTotalTokens: 80000, // Increased from 3000 - comprehensive context
      slidingWindowSize: 20, // Increased from 5 - remember much more conversation
      includeDocuments: true,
      includeChatHistory: true,
      documentRelevanceThreshold: 48 // Extended from 24 to 48 hours - longer document memory
    },
    [ContextType.DOCUMENT_ANALYSIS]: {
      maxDocumentTokens: 70000, // Increased from 3000 - can handle very large documents
      maxChatTokens: 20000, // Increased from 500 - more conversation context for analysis
      maxTotalTokens: 100000, // Increased from 4000 - comprehensive document analysis
      slidingWindowSize: 10, // Increased from 2 - more relevant conversation history
      includeDocuments: true,
      includeChatHistory: true,
      documentRelevanceThreshold: 2 // Keep at 2 hours for document analysis freshness
    }
  };

  // Code generation keywords for detection
  private readonly codeGenerationKeywords = [
    'genera', 'crea', 'construye', 'haz', 'desarrolla', 'código', 'aplicación', 
    'app', 'website', 'web', 'sitio', 'landing', 'dashboard', 'ecommerce', 
    'tienda', 'pantalla', 'interfaz', 'componente', 'página', 'formulario',
    'build', 'create', 'develop', 'make', 'design', 'implement'
  ];

  // Modification keywords for existing code
  private readonly modificationKeywords = [
    'modifica', 'cambia', 'actualiza', 'mejora', 'agrega', 'añade', 'quita',
    'elimina', 'corrige', 'arregla', 'ajusta', 'edita', 'modify', 'change',
    'update', 'improve', 'add', 'remove', 'fix', 'edit', 'adjust'
  ];

  // Document reference keywords
  private readonly documentReferenceKeywords = [
    'pdf', 'documento', 'archivo', 'imagen', 'prd', 'wireframe', 'diseño',
    'especificación', 'requerimiento', 'este documento', 'el documento',
    'la imagen', 'el archivo', 'document', 'file', 'image', 'spec', 'requirement'
  ];

  /**
   * Main method to build smart context based on request analysis
   */
  buildSmartContext(
    userPrompt: string,
    messages: ChatMessage[],
    documents: DocumentContext[],
    customConfig?: Partial<ContextConfig>
  ): SmartContext {
    console.log('🧠 SmartContextManager: Analyzing request...', { 
      prompt: userPrompt.substring(0, 100),
      messagesCount: messages.length,
      documentsCount: documents.length 
    });

    // Step 1: Detect intent and context type
    const intent = this.detectRequestIntent(userPrompt, messages, documents);
    const contextType = this.mapIntentToContextType(intent);
    
    console.log('🎯 Detected intent:', intent, 'context type:', contextType);

    // Step 2: Get configuration for this context type
    const config = { ...this.defaultConfigs[contextType], ...customConfig };

    // Step 3: Filter relevant documents
    const relevantDocuments = this.filterRelevantDocuments(
      documents, 
      userPrompt, 
      config.documentRelevanceThreshold
    );

    // Step 4: Filter relevant messages
    const relevantMessages = this.filterRelevantMessages(
      messages,
      userPrompt,
      contextType,
      config.slidingWindowSize
    );

    // Step 5: Build context with token management
    const finalPrompt = this.buildContextualPrompt(
      userPrompt,
      relevantMessages,
      relevantDocuments,
      contextType,
      config
    );

    // Step 6: Calculate confidence score
    const confidence = this.calculateConfidence(intent, userPrompt, relevantDocuments);

    const smartContext: SmartContext = {
      type: contextType,
      intent,
      finalPrompt,
      tokenCount: this.estimateTokenCount(finalPrompt),
      documentsUsed: relevantDocuments,
      messagesUsed: relevantMessages,
      confidence
    };

    console.log('✅ SmartContext built:', {
      type: smartContext.type,
      intent: smartContext.intent,
      tokenCount: smartContext.tokenCount,
      documentsUsed: smartContext.documentsUsed.length,
      messagesUsed: smartContext.messagesUsed.length,
      confidence: smartContext.confidence
    });

    return smartContext;
  }

  /**
   * Detect the user's intent based on the prompt and context
   */
  private detectRequestIntent(
    userPrompt: string, 
    messages: ChatMessage[], 
    documents: DocumentContext[]
  ): RequestIntent {
    const prompt = userPrompt.toLowerCase();

    // Check for document analysis intent
    if (this.documentReferenceKeywords.some(keyword => prompt.includes(keyword))) {
      if (documents.some(doc => this.isRecentDocument(doc, 0.5))) {
        return RequestIntent.ANALYZE_DOCUMENT;
      }
    }

    // Check for code modification intent
    if (this.modificationKeywords.some(keyword => prompt.includes(keyword))) {
      // Check if there's a recent code generation in history
      const hasRecentCodeGeneration = messages.some(msg => 
        msg.previewUrl && this.isRecentMessage(msg, 2)
      );
      
      if (hasRecentCodeGeneration) {
        return RequestIntent.MODIFY_EXISTING;
      }
    }

    // Check for code generation intent
    if (this.codeGenerationKeywords.some(keyword => prompt.includes(keyword))) {
      return RequestIntent.GENERATE_CODE;
    }

    // Default to chat
    return RequestIntent.CHAT;
  }

  /**
   * Map request intent to context type
   */
  private mapIntentToContextType(intent: RequestIntent): ContextType {
    switch (intent) {
      case RequestIntent.GENERATE_CODE:
      case RequestIntent.MODIFY_EXISTING:
        return ContextType.CODE_GENERATION;
      case RequestIntent.ANALYZE_DOCUMENT:
        return ContextType.DOCUMENT_ANALYSIS;
      case RequestIntent.CHAT:
      default:
        return ContextType.CONVERSATION;
    }
  }

  /**
   * Filter documents based on relevance and recency
   */
  private filterRelevantDocuments(
    documents: DocumentContext[],
    userPrompt: string,
    relevanceThresholdHours: number
  ): DocumentContext[] {
    const prompt = userPrompt.toLowerCase();
    
    return documents.filter(doc => {
      // Check recency
      if (!this.isRecentDocument(doc, relevanceThresholdHours)) {
        return false;
      }

      // Always include if document is explicitly mentioned
      if (this.documentReferenceKeywords.some(keyword => prompt.includes(keyword))) {
        return true;
      }

      // Include if document content seems relevant to the prompt
      if (doc.extractedData) {
        const docContent = JSON.stringify(doc.extractedData).toLowerCase();
        const promptWords = prompt.split(/\s+/).filter(word => word.length > 3);
        const relevanceScore = promptWords.filter(word => 
          docContent.includes(word)
        ).length / promptWords.length;
        
        return relevanceScore > 0.1; // 10% overlap threshold
      }

      return true; // Include by default if no specific filtering criteria
    });
  }

  /**
   * Filter messages based on context type and sliding window
   */
  private filterRelevantMessages(
    messages: ChatMessage[],
    userPrompt: string,
    contextType: ContextType,
    slidingWindowSize: number
  ): ChatMessage[] {
    // For code generation, don't include chat history
    if (contextType === ContextType.CODE_GENERATION) {
      return [];
    }

    // Get recent messages based on sliding window
    const recentMessages = messages.slice(-slidingWindowSize);
    
    // Filter out system messages and generation progress messages
    return recentMessages.filter(msg => {
      // Skip messages that are just generation status updates
      if (msg.isGenerating || msg.content.includes('Generando aplicación web')) {
        return false;
      }
      
      // With 128k context, we can include longer messages but still filter extremely long ones
      if (msg.content.length > 5000) { // Increased from 1000 to 5000
        return false;
      }

      return true;
    });
  }

  /**
   * Build the final contextual prompt with token management
   */
  private buildContextualPrompt(
    userPrompt: string,
    messages: ChatMessage[],
    documents: DocumentContext[],
    contextType: ContextType,
    config: ContextConfig
  ): string {
    let context = '';
    let currentTokens = 0;

    // Add document context first (highest priority for code generation)
    if (config.includeDocuments && documents.length > 0) {
      const documentContext = this.buildDocumentContext(documents);
      const documentTokens = this.estimateTokenCount(documentContext);
      
      if (documentTokens <= config.maxDocumentTokens) {
        context += documentContext;
        currentTokens += documentTokens;
      } else {
        // Trim document context if too long
        const trimmedContext = this.trimToTokenLimit(documentContext, config.maxDocumentTokens);
        context += trimmedContext;
        currentTokens += config.maxDocumentTokens;
      }
    }

    // Add chat history if allowed and within limits
    if (config.includeChatHistory && messages.length > 0) {
      const availableTokens = Math.min(
        config.maxChatTokens,
        config.maxTotalTokens - currentTokens - this.estimateTokenCount(userPrompt)
      );

      if (availableTokens > 100) { // Only add if significant space available
        const chatContext = this.buildChatContext(messages);
        const trimmedChatContext = this.trimToTokenLimit(chatContext, availableTokens);
        
        if (trimmedChatContext.trim()) {
          context += '\n\n' + trimmedChatContext;
          currentTokens += this.estimateTokenCount(trimmedChatContext);
        }
      }
    }

    // Add context-specific instructions
    const instructions = this.getContextInstructions(contextType);
    
    // Build final prompt
    let finalPrompt = '';
    
    if (context.trim()) {
      finalPrompt += context + '\n\n' + instructions + '\n\n';
    } else {
      finalPrompt += instructions + '\n\n';
    }
    
    finalPrompt += `# Solicitud del Usuario\n${userPrompt}`;

    return finalPrompt;
  }

  /**
   * Build document context section
   */
  private buildDocumentContext(documents: DocumentContext[]): string {
    if (documents.length === 0) return '';

    let context = '# Contexto de Documentos Analizados\n\n';
    
    documents.forEach(doc => {
      if (doc.processed && doc.extractedData) {
        context += `## ${doc.fileName}\n`;
        context += this.formatDocumentForContext(doc.extractedData);
        context += '\n---\n\n';
      }
    });

    return context;
  }

  /**
   * Build chat context section
   */
  private buildChatContext(messages: ChatMessage[]): string {
    if (messages.length === 0) return '';

    let context = '# Contexto de Conversación Reciente\n\n';
    
    messages.forEach(msg => {
      const role = msg.role === 'user' ? 'Usuario' : 'Asistente';
      // Limit individual message length
      const content = msg.content.length > 200 
        ? msg.content.substring(0, 200) + '...'
        : msg.content;
      context += `**${role}**: ${content}\n\n`;
    });

    return context;
  }

  /**
   * Format document data for context
   */
  private formatDocumentForContext(extractedData: any): string {
    if (!extractedData) return '';

    let formatted = '';

    if (extractedData.title) {
      formatted += `**Título**: ${extractedData.title}\n\n`;
    }

    if (extractedData.summary) {
      formatted += `**Resumen**: ${extractedData.summary}\n\n`;
    }

    if (extractedData.requirements && extractedData.requirements.length > 0) {
      formatted += `**Requisitos Clave**:\n`;
      // Include more requirements for better context
      extractedData.requirements.slice(0, 10).forEach((req: string) => {
        formatted += `- ${req}\n`;
      });
      formatted += '\n';
    }

    if (extractedData.features && extractedData.features.length > 0) {
      formatted += `**Funcionalidades Principales**:\n`;
      // Include more features with full descriptions
      extractedData.features.slice(0, 8).forEach((feature: any) => {
        formatted += `- **${feature.name}**: ${feature.description}\n`;
        if (feature.components && feature.components.length > 0) {
          formatted += `  - Componentes: ${feature.components.join(', ')}\n`;
        }
      });
      formatted += '\n';
    }

    if (extractedData.userFlows && extractedData.userFlows.length > 0) {
      formatted += `**Flujos de Usuario**:\n`;
      // Include more flows with complete steps
      extractedData.userFlows.slice(0, 5).forEach((flow: any) => {
        formatted += `- **${flow.name}** (Prioridad: ${flow.priority || 'media'}):\n`;
        formatted += `  - Pasos: ${flow.steps.join(' → ')}\n`;
        if (flow.screens && flow.screens.length > 0) {
          formatted += `  - Pantallas: ${flow.screens.join(', ')}\n`;
        }
      });
      formatted += '\n';
    }

    if (extractedData.technicalSpecs && extractedData.technicalSpecs.length > 0) {
      formatted += `**Especificaciones Técnicas**:\n`;
      extractedData.technicalSpecs.forEach((spec: any) => {
        formatted += `- **${spec.category}**:\n`;
        spec.requirements.forEach((req: string) => {
          formatted += `  - ${req}\n`;
        });
      });
      formatted += '\n';
    }

    return formatted;
  }

  /**
   * Get context-specific instructions
   */
  private getContextInstructions(contextType: ContextType): string {
    switch (contextType) {
      case ContextType.CODE_GENERATION:
        return `# Rappi App Generator - Sistema Completo de Diseño

Eres un experto desarrollador web especializado en crear aplicaciones móviles para **Rappi**, la plataforma de entregas todo-en-uno. Tu misión: "Hacer la vida urbana más fácil, rápida y conveniente".

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

Crea una interfaz móvil auténtica de Rappi que refleje perfectamente la identidad de marca, sistema de colores, tipografía y UX patterns oficiales.`;

      case ContextType.CONVERSATION:
        return `# Instrucciones para Conversación
Responde como un asistente útil de Rappi Creator.
Considera el contexto de documentos y conversación reciente si es relevante.
Da respuestas concisas y útiles.`;

      case ContextType.DOCUMENT_ANALYSIS:
        return `# Instrucciones para Análisis de Documentos
Analiza el documento proporcionado y responde basándote en su contenido específico.
Proporciona insights útiles y responde preguntas específicas sobre el documento.`;

      default:
        return `# Instrucciones
Responde de manera útil y precisa basándote en el contexto proporcionado.`;
    }
  }

  /**
   * Check if document is recent based on threshold
   */
  private isRecentDocument(doc: DocumentContext, thresholdHours: number): boolean {
    const now = new Date();
    const docTime = new Date(doc.timestamp);
    const hoursDiff = (now.getTime() - docTime.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= thresholdHours;
  }

  /**
   * Check if message is recent based on threshold
   */
  private isRecentMessage(msg: ChatMessage, thresholdHours: number): boolean {
    const now = new Date();
    const msgTime = new Date(msg.timestamp);
    const hoursDiff = (now.getTime() - msgTime.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= thresholdHours;
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokenCount(text: string): number {
    // Rough approximation: 1 token ≈ 0.75 words
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 0.75);
  }

  /**
   * Trim text to token limit
   */
  private trimToTokenLimit(text: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokenCount(text);
    if (estimatedTokens <= maxTokens) {
      return text;
    }

    // With 128k context, we can be more generous with truncation
    const ratio = maxTokens / estimatedTokens;
    const targetLength = Math.floor(text.length * ratio * 0.95); // 95% to be safer with larger context
    
    // Try to find a good break point (end of paragraph or section)
    const textToTrim = text.substring(0, targetLength);
    const lastParagraphBreak = textToTrim.lastIndexOf('\n\n');
    const lastSectionBreak = textToTrim.lastIndexOf('---');
    
    // Use the best break point we can find, otherwise just truncate
    let finalLength = targetLength;
    if (lastSectionBreak > targetLength * 0.8) {
      finalLength = lastSectionBreak;
    } else if (lastParagraphBreak > targetLength * 0.8) {
      finalLength = lastParagraphBreak;
    }
    
    return text.substring(0, finalLength) + '\n\n[Contexto parcial - contenido completo disponible para consulta...]';
  }

  /**
   * Calculate confidence score for the context analysis
   */
  private calculateConfidence(
    intent: RequestIntent, 
    userPrompt: string, 
    documents: DocumentContext[]
  ): number {
    let confidence = 0.5; // Base confidence

    const prompt = userPrompt.toLowerCase();

    // Increase confidence based on keyword matches
    if (intent === RequestIntent.GENERATE_CODE) {
      const matches = this.codeGenerationKeywords.filter(keyword => prompt.includes(keyword));
      confidence += matches.length * 0.1;
    }

    // Increase confidence if relevant documents are available
    if (documents.length > 0) {
      confidence += 0.2;
      
      // Extra confidence if documents are very recent
      const recentDocs = documents.filter(doc => this.isRecentDocument(doc, 1));
      if (recentDocs.length > 0) {
        confidence += 0.1;
      }
    }

    // Cap confidence at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Debug method to analyze context decisions
   */
  debugContext(context: SmartContext): void {
    console.log('🔍 SmartContext Debug:', {
      type: context.type,
      intent: context.intent,
      confidence: context.confidence,
      tokenCount: context.tokenCount,
      documentsUsed: context.documentsUsed.map(d => d.fileName),
      messagesUsed: context.messagesUsed.length,
      promptPreview: context.finalPrompt.substring(0, 200) + '...'
    });
  }
}

// Singleton instance
const smartContextManager = new SmartContextManager();

export default smartContextManager;