
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X, Bot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api-service';
import { buildApiUrl, apiConfig } from '@/config/api-config';

interface DocumentAnalysisProps {
  onAnalysisComplete: (screens: any[]) => void;
}

const DocumentAnalysis = ({ onAnalysisComplete }: DocumentAnalysisProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Support PDF, images, and text files
      const supportedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const isSupported = supportedTypes.includes(file.type) || file.name.endsWith('.txt');
      
      if (isSupported) {
        setUploadedFile(file);
        toast.success(`Archivo ${file.name} cargado exitosamente`);
      } else {
        toast.error('Por favor selecciona un archivo PDF, imagen (JPG, PNG, GIF, WebP) o texto');
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setAnalysisResult('');
    setExtractedData(null);
    toast.info('Archivo removido');
  };

  const processFileWithGemini = async (file: File) => {
    try {
      const customPrompt = `Analiza este documento PRD y extrae información estructurada para generar una aplicación web.

Especializa el análisis en:
- Identificar el tipo de aplicación web que se debe crear
- Extraer requerimientos funcionales específicos
- Detectar componentes UI necesarios
- Identificar flujos de usuario principales
- Encontrar especificaciones técnicas relevantes

Estructura el JSON con información detallada para facilitar la generación de código web.`;

      const result = await apiService.processDocumentWithGemini(
        file,
        customPrompt,
        (message) => {
          console.log('📄 Procesamiento:', message);
          toast.info(message);
        }
      );

      if (result.success && result.extractedData) {
        return result.extractedData;
      } else {
        throw new Error('No se pudo extraer información del documento');
      }
    } catch (error) {
      console.error('❌ Error procesando archivo con Gemini:', error);
      throw error;
    }
  };

  const analyzeDocument = async () => {
    if (!uploadedFile) {
      toast.error('Por favor sube un archivo primero');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('🔍 Iniciando análisis del archivo:', uploadedFile.name);
      
      // Step 1: Process file with Gemini
      const geminiData = await processFileWithGemini(uploadedFile);
      setExtractedData(geminiData);
      
      console.log('✅ Datos extraídos con Gemini:', geminiData);
      
      // Step 2: Create structured prompt for Claude based on Gemini data
      const structuredPrompt = `Analiza este documento PRD procesado y crea un prompt optimizado para generar código de una aplicación web:

DOCUMENTO PROCESADO CON GEMINI:
${JSON.stringify(geminiData, null, 2)}

INSTRUCCIONES:
1. Identifica los requerimientos funcionales principales
2. Detecta el tipo de aplicación web que se debe crear
3. Lista las funcionalidades específicas necesarias
4. Crea un prompt claro y detallado para generar el código HTML/CSS/JS
5. El prompt debe ser específico y técnico para generar una aplicación completa

FORMATO DE RESPUESTA:
TIPO DE APLICACIÓN: [tipo]
FUNCIONALIDADES PRINCIPALES:
- [funcionalidad 1]
- [funcionalidad 2]
- [etc]

PROMPT OPTIMIZADO:
[Aquí el prompt detallado para generar la aplicación web completa con HTML, CSS y JavaScript]

Responde únicamente con el análisis y prompt optimizado, sin explicaciones adicionales.`;
      
      const requestBody = {
        fileContent: JSON.stringify(geminiData),
        fileName: uploadedFile.name,
        prompt: structuredPrompt
      };

      console.log('📤 Enviando datos procesados a Claude para análisis...');
      
      const response = await fetch(buildApiUrl(apiConfig.endpoints.analyzeDocument), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📬 Respuesta recibida. Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error en la respuesta del backend:', errorData);
        throw new Error(`Error de API: ${response.status} - ${errorData.message || 'Error desconocido'}`);
      }

      const data = await response.json();
      console.log('📊 Datos de respuesta:', data);
      
      if (!data.success || !data.analysis) {
        throw new Error('Respuesta inválida del backend');
      }

      const analysisContent = data.analysis;
      console.log('✅ Análisis completado:', analysisContent.substring(0, 200) + '...');
      
      setAnalysisResult(analysisContent);
      
      // Generate screens based on extracted data
      const screens = generateScreensFromData(geminiData);
      onAnalysisComplete(screens);
      
      toast.success('¡Análisis completado con Gemini + Claude!');
      
    } catch (error) {
      console.error('❌ Error completo al analizar documento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al analizar el documento: ${errorMessage}`);
      setAnalysisResult(`Error: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateScreensFromData = (data: any) => {
    const screens = [];
    
    // Generate screens based on extracted data
    if (data.userFlows && data.userFlows.length > 0) {
      data.userFlows.forEach((flow: any, index: number) => {
        screens.push({
          id: `flow-${index}`,
          name: flow.name || `Flujo ${index + 1}`,
          type: 'Flujo de Usuario',
          description: flow.steps ? flow.steps.join(' → ') : 'Flujo de usuario identificado',
          confidence: flow.priority === 'high' ? 95 : flow.priority === 'medium' ? 80 : 70
        });
      });
    }
    
    if (data.features && data.features.length > 0) {
      data.features.forEach((feature: any, index: number) => {
        screens.push({
          id: `feature-${index}`,
          name: feature.name || `Funcionalidad ${index + 1}`,
          type: 'Funcionalidad',
          description: feature.description || 'Funcionalidad identificada en el PRD',
          confidence: feature.priority === 'high' ? 90 : feature.priority === 'medium' ? 75 : 60
        });
      });
    }
    
    // Default screens if no specific flows/features found
    if (screens.length === 0) {
      screens.push(
        {
          id: '1',
          name: 'Pantalla Principal',
          type: 'Página de Inicio',
          description: 'Landing page con funcionalidades principales',
          confidence: 85
        },
        {
          id: '2', 
          name: 'Dashboard',
          type: 'Panel de Control',
          description: 'Interfaz de usuario principal',
          confidence: 80
        }
      );
    }
    
    return screens;
  };

  return (
    <Card className="rappi-card">
      <CardHeader>
        <CardTitle className="rappi-text-gradient flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Análisis de PRD
        </CardTitle>
        <CardDescription>
          Sube tu documento PRD para generar automáticamente el prompt optimizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileUpload}
            className="hidden"
            id="prd-upload"
          />
          <label htmlFor="prd-upload" className="cursor-pointer">
            <div className="space-y-4">
              <div className="w-16 h-16 rappi-gradient rounded-full mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold">Sube tu PRD</p>
                <p className="text-muted-foreground">PDF, imagen o texto • Máximo 20MB</p>
              </div>
            </div>
          </label>
        </div>

        {/* Uploaded File Display */}
        {uploadedFile && (
          <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              onClick={removeFile}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Analyze Button */}
        {uploadedFile && (
          <Button
            onClick={analyzeDocument}
            disabled={isAnalyzing}
            className="rappi-button w-full"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Bot className="w-4 h-4 mr-2" />
            )}
            {isAnalyzing ? 'Analizando con Gemini + Claude...' : 'Analizar con Gemini + Claude'}
          </Button>
        )}

        {/* Analysis Result */}
        {analysisResult && (
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-primary">Análisis Completado</h4>
            <div className="text-sm text-muted-foreground max-h-40 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{analysisResult}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentAnalysis;
