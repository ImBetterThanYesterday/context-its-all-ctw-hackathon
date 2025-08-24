// Gemini API service for PDF and image processing
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiProcessDocumentRequest {
  file: File;
  prompt?: string;
}

export interface GeminiProcessDocumentResponse {
  success: boolean;
  extractedData?: any;
  error?: string;
  documentId?: string;
}

export interface ExtractedDocumentData {
  documentType: string;
  title?: string;
  summary: string;
  sections: DocumentSection[];
  requirements: string[];
  userFlows: UserFlow[];
  features: Feature[];
  technicalSpecs?: TechnicalSpec[];
}

export interface DocumentSection {
  title: string;
  content: string;
  type: 'introduction' | 'requirements' | 'features' | 'flow' | 'technical' | 'other';
}

export interface UserFlow {
  name: string;
  steps: string[];
  screens: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface Feature {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  components: string[];
}

export interface TechnicalSpec {
  category: string;
  requirements: string[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  
  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  private initializeClient(apiKey: string) {
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  private getExtractionPrompt(): string {
    return `
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
`;
  }

  async processDocument(
    file: File, 
    apiKey: string,
    customPrompt?: string
  ): Promise<GeminiProcessDocumentResponse> {
    try {
      console.log('🔍 Gemini: Processing document:', file.name, file.type);
      
      this.initializeClient(apiKey);
      
      if (!this.genAI) {
        throw new Error('Gemini client not initialized');
      }

      // Verificar que el archivo sea PDF o imagen
      const supportedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
      ];

      if (!supportedTypes.includes(file.type)) {
        throw new Error(`Tipo de archivo no soportado: ${file.type}. Soportados: PDF, JPG, PNG, GIF, WebP`);
      }

      // Convertir archivo a base64
      const base64Data = await this.fileToBase64(file);
      
      // Obtener el modelo Gemini 2.0 Flash
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp" 
      });

      // Preparar el contenido
      const prompt = customPrompt || this.getExtractionPrompt();
      
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      };

      console.log('🔍 Gemini: Sending request to API...');

      // Generar contenido
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      console.log('🔍 Gemini: Raw response:', text);

      // Intentar parsear el JSON
      let extractedData: ExtractedDocumentData;
      try {
        // Limpiar el texto para extraer solo el JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        extractedData = JSON.parse(jsonText);
        
        console.log('🔍 Gemini: Parsed data:', extractedData);
      } catch (parseError) {
        console.warn('🔍 Gemini: Failed to parse JSON, using raw text');
        // Si no se puede parsear como JSON, crear estructura básica
        extractedData = {
          documentType: 'other',
          title: file.name,
          summary: text.substring(0, 200) + '...',
          sections: [{
            title: 'Contenido extraído',
            content: text,
            type: 'other'
          }],
          requirements: [],
          userFlows: [],
          features: []
        };
      }

      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        extractedData,
        documentId
      };

    } catch (error) {
      console.error('🔍 Gemini: Error processing document:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido procesando documento'
      };
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:type/subtype;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Método helper para formatear datos extraídos para Claude
  static formatForClaude(extractedData: ExtractedDocumentData): string {
    const formatted = `
# Contexto del Documento Analizado

## Información General
- **Tipo de documento**: ${extractedData.documentType}
- **Título**: ${extractedData.title || 'Sin título'}
- **Resumen**: ${extractedData.summary}

## Secciones del Documento
${extractedData.sections.map(section => `
### ${section.title}
${section.content}
`).join('')}

## Requisitos Identificados
${extractedData.requirements.map(req => `- ${req}`).join('\n')}

## Flujos de Usuario
${extractedData.userFlows.map(flow => `
### ${flow.name} (Prioridad: ${flow.priority})
**Pasos**: ${flow.steps.join(' → ')}
**Pantallas**: ${flow.screens.join(', ')}
`).join('')}

## Funcionalidades
${extractedData.features.map(feature => `
### ${feature.name} (Prioridad: ${feature.priority})
**Descripción**: ${feature.description}
**Componentes**: ${feature.components.join(', ')}
`).join('')}

${extractedData.technicalSpecs ? `
## Especificaciones Técnicas
${extractedData.technicalSpecs.map(spec => `
### ${spec.category}
${spec.requirements.map(req => `- ${req}`).join('\n')}
`).join('')}
` : ''}

---
*Este contexto fue extraído automáticamente del documento usando Gemini AI. Úsalo como base para generar el código solicitado.*
`;

    return formatted;
  }
}

export default GeminiService;