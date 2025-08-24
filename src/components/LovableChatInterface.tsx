import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Bot, User, X, Loader2, Monitor, FileText, Image, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { e2bClaudeBridge, CodeGenerationProgress, apiService } from '@/lib/api-service';
import chatPersistence, { ChatMessage, DocumentContext } from '@/lib/chat-persistence';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

interface LovableChatInterfaceProps {
  className?: string;
  onPreviewUpdate?: (previewUrl: string | null) => void;
  onLoadingStateChange?: (state: {isLoading: boolean, stage: string, message: string, progress: number}) => void;
  initialMessage?: string;
}

const LovableChatInterface: React.FC<LovableChatInterfaceProps> = ({ className = '', onPreviewUpdate, onLoadingStateChange, initialMessage }) => {
  const { isDark } = useTheme();
  
  // Initialize with persisted messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const persistedMessages = chatPersistence.getMessages();
    if (persistedMessages.length === 0) {
      // Add initial welcome message if no persisted messages
      const welcomeMessage = chatPersistence.addMessage({
        content: '¡Hola! Soy tu asistente de Rappi Creator. Puedo ayudarte a crear interfaces y aplicaciones web. También puedo analizar documentos PDFs e imágenes. ¿En qué te gustaría trabajar hoy?',
        role: 'assistant'
      });
      return [welcomeMessage];
    }
    return persistedMessages;
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync local state with persistence
  useEffect(() => {
    const persistedMessages = chatPersistence.getMessages();
    setMessages(persistedMessages);
  }, []);

  // Handle initial message from props (will be moved after handleSend definition)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const maxSize = 20 * 1024 * 1024; // 20MB limit
      const validFiles: File[] = [];
      
      Array.from(files).forEach(file => {
        const validTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp'
        ];
        
        if (!validTypes.includes(file.type)) {
          toast.error(`Archivo "${file.name}" no es compatible. Solo se admiten PDF, JPG, PNG, GIF y WebP`);
          return;
        }
        
        if (file.size > maxSize) {
          toast.error(`Archivo "${file.name}" es muy grande. Máximo 20MB permitido.`);
          return;
        }
        
        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setAttachedFiles(prev => [...prev, ...validFiles]);
        
        // Process files with Gemini immediately
        validFiles.forEach(file => processFileWithGemini(file));
      }
    }
  };

  const processFileWithGemini = async (file: File) => {
    setIsProcessingFile(true);
    
    try {
      console.log('🔍 Processing file with Gemini:', file.name);
      
      const result = await apiService.processDocumentWithGemini(
        file,
        undefined,
        (message) => {
          console.log('📄 Processing progress:', message);
          toast.info(message);
        }
      );

      if (result.success && result.extractedData && result.documentId) {
        // Add document context to persistence
        const documentContext: DocumentContext = {
          documentId: result.documentId,
          fileName: file.name,
          extractedData: result.extractedData,
          processed: true,
          mimeType: file.type
        };

        chatPersistence.addDocumentContext(documentContext);
        
        // Add system message about document processing
        const systemMessage = chatPersistence.addMessage({
          content: `📄 **Documento procesado: "${file.name}"**\n\n✅ He analizado el documento y extraído la información clave. Ahora voy a generar automáticamente una interfaz móvil de Rappi basada en el contenido del PRD.`,
          role: 'assistant'
        });

        setMessages(chatPersistence.getMessages());
        
        toast.success(`Documento "${file.name}" procesado exitosamente`);
        console.log('✅ Document processed and added to context:', documentContext);
        
        // Auto-generate UI based on the document content
        await autoGenerateUIFromDocument(documentContext);
      }
      
    } catch (error) {
      console.error('❌ Error processing file:', error);
      
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
          errorMessage = 'El archivo es muy grande. Intenta con un archivo más pequeño (máximo 20MB).';
        } else if (error.message.includes('SyntaxError')) {
          errorMessage = 'Error del servidor procesando el archivo. Intenta de nuevo.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica que esté ejecutándose.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(`Error procesando "${file.name}": ${errorMessage}`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const autoGenerateUIFromDocument = async (documentContext: DocumentContext) => {
    try {
      console.log('🚀 Auto-generating UI from document:', documentContext.fileName);
      
      // Create a smart prompt based on the document content
      const extractedData = documentContext.extractedData;
      let autoPrompt = '';
      
      if (extractedData) {
        // Analyze the document type and content to create a specific prompt
        const documentType = extractedData.documentType || 'unknown';
        const title = extractedData.title || documentContext.fileName;
        const features = extractedData.features || [];
        const userFlows = extractedData.userFlows || [];
        const requirements = extractedData.requirements || [];
        
        // Create a context-aware prompt
        if (features.length > 0) {
          const mainFeature = features[0];
          if (mainFeature.name.toLowerCase().includes('gamif') || 
              mainFeature.name.toLowerCase().includes('reto') ||
              mainFeature.name.toLowerCase().includes('punto') ||
              mainFeature.name.toLowerCase().includes('challenge')) {
            autoPrompt = `Crea una interfaz móvil de Rappi para gamificación con retos y puntos, basada en "${title}". Incluye: tarjetas de retos, sistema de puntos, badges, y clasificación de usuarios.`;
          } else if (mainFeature.name.toLowerCase().includes('pago') ||
                     mainFeature.name.toLowerCase().includes('tip') ||
                     mainFeature.name.toLowerCase().includes('checkout') ||
                     mainFeature.name.toLowerCase().includes('propina')) {
            autoPrompt = `Crea una interfaz móvil de Rappi para checkout y pagos con propinas, basada en "${title}". Incluye: resumen del pedido, métodos de pago, opciones de propina, y confirmación.`;
          } else if (mainFeature.name.toLowerCase().includes('deliver') ||
                     mainFeature.name.toLowerCase().includes('entrega') ||
                     mainFeature.name.toLowerCase().includes('track')) {
            autoPrompt = `Crea una interfaz móvil de Rappi para seguimiento de entrega, basada en "${title}". Incluye: mapa en tiempo real, estado del pedido, información del repartidor, y tiempo estimado.`;
          } else if (mainFeature.name.toLowerCase().includes('restaurant') ||
                     mainFeature.name.toLowerCase().includes('comida') ||
                     mainFeature.name.toLowerCase().includes('menu')) {
            autoPrompt = `Crea una interfaz móvil de Rappi para restaurantes y menús, basada en "${title}". Incluye: lista de restaurantes, categorías de comida, productos con precios, y carrito de compras.`;
          } else {
            autoPrompt = `Crea una interfaz móvil de Rappi para ${mainFeature.name}, basada en "${title}". Funcionalidad principal: ${mainFeature.description}`;
          }
        } else if (userFlows.length > 0) {
          const mainFlow = userFlows[0];
          autoPrompt = `Crea una interfaz móvil de Rappi para el flujo "${mainFlow.name}", basada en "${title}". Incluye las pantallas: ${mainFlow.screens.slice(0, 3).join(', ')}.`;
        } else if (requirements.length > 0) {
          const mainRequirement = requirements[0];
          autoPrompt = `Crea una interfaz móvil de Rappi basada en "${title}". Requisito principal: ${mainRequirement}`;
        } else {
          autoPrompt = `Crea una interfaz móvil de Rappi basada en el documento "${title}". Genera una pantalla principal con las funcionalidades identificadas en el PRD.`;
        }
      } else {
        autoPrompt = `Crea una interfaz móvil de Rappi basada en el documento "${documentContext.fileName}". Genera una pantalla principal con funcionalidades de la app.`;
      }
      
      console.log('🎯 Auto-generated prompt:', autoPrompt);
      
      // Use the same code generation logic but with the auto-generated prompt
      await handleCodeGeneration(autoPrompt);
      
    } catch (error) {
      console.error('❌ Error in auto-generation:', error);
      
      // Add a fallback message
      const fallbackMessage = chatPersistence.addMessage({
        content: `⚠️ **Auto-generación pausada**\n\nTuve un problema generando automáticamente la interfaz. Puedes pedirme que cree una interfaz específica basada en el documento "${documentContext.fileName}".`,
        role: 'assistant'
      });
      
      setMessages(chatPersistence.getMessages());
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCodeGeneration = useCallback(async (prompt: string) => {
    // Check if there's an existing sandbox to determine if it's a modification
    const existingSandboxId = chatPersistence.getSandboxId();
    const isModification = existingSandboxId !== null;
    
    // Add generation message with appropriate text
    const generationMessage = chatPersistence.addMessage({
      content: isModification 
        ? `🔄 **Modificando aplicación existente**\n\nSolicitud: "${prompt}"\n\n✨ Aplicando cambios al mockup móvil actual...`
        : `🚀 **Generando nueva aplicación móvil**\n\nSolicitud: "${prompt}"\n\n🎯 Creando mockup móvil de Rappi desde cero...`,
      role: 'assistant',
      isGenerating: true
    });

    setMessages(chatPersistence.getMessages());

    // Get document context for enhanced prompts
    const documents = chatPersistence.getDocumentContexts();
    
    // Build enhanced prompt with document context if available
    let enhancedPrompt = prompt;
    if (documents.length > 0) {
      const documentSummary = documents.map(doc => 
        `Documento: ${doc.fileName} - ${doc.extractedData?.title || 'Información extraída'}`
      ).join('\n');
      
      enhancedPrompt = `${prompt}\n\nCONTEXTO DE DOCUMENTOS:\n${documentSummary}`;
      console.log('📄 Enhanced prompt with document context from', documents.length, 'documents');
    } else {
      console.log('🎯 Using clean prompt without document context');
    }

    // Determine framework
    let framework: 'react' | 'nextjs' | 'vite' = 'nextjs';
    if (prompt.toLowerCase().includes('vite')) {
      framework = 'vite';
    } else if (prompt.toLowerCase().includes('react') && !prompt.toLowerCase().includes('next')) {
      framework = 'react';
    }

    try {
      // Check if there's an existing sandbox for this session
      const existingSandboxId = chatPersistence.getSandboxId();
      
      let isModification = false;
      let result;
      
      if (existingSandboxId) {
        console.log('🔄 Modifying existing sandbox:', existingSandboxId);
        isModification = true;
        
        // Use existing sandbox
        try {
          result = await apiService.modifySandbox(
            existingSandboxId,
            { 
              prompt: enhancedPrompt, // Use enhanced prompt with document context
              framework 
            },
            (message: string) => {
              console.log('🔄 Modification progress:', message);
              
              // Update the generation message with progress
              chatPersistence.updateMessage(generationMessage.id, {
                content: `🔄 **Modificando aplicación existente**\n\n**Estado**: ${message}`
              });
              
              setMessages(chatPersistence.getMessages());
            }
          );
        } catch (modifyError) {
          console.warn('⚠️ Failed to modify existing sandbox, creating new one:', modifyError);
          // If modification fails, create a new sandbox
          isModification = false;
          result = null;
        }
      }
      
      if (!isModification || !result) {
        console.log('🔍 Creating new sandbox with clean prompt');
        console.log('🔍 Framework selected:', framework);
        
        result = await e2bClaudeBridge.generateWebApp(
          enhancedPrompt, // Use enhanced prompt with document context
          framework,
          (progress: CodeGenerationProgress) => {
            console.log('🔍 Progress update:', progress);
            
            // Update loading state for preview
            onLoadingStateChange?.({
              isLoading: progress.stage !== 'ready' && progress.stage !== 'error',
              stage: progress.stage,
              message: progress.message,
              progress: progress.progress || 0
            });
            
            // Update the generation message with progress
            const progressEmoji = isModification ? '🔄' : '🚀';
            const actionText = isModification ? 'Modificando mockup móvil' : 'Generando aplicación móvil';
            
            chatPersistence.updateMessage(generationMessage.id, {
              generationProgress: progress,
              content: `${progressEmoji} **${actionText}**\n\n**Estado**: ${progress.message}\n**Progreso**: ${progress.progress || 0}%`
            });
            
            setMessages(chatPersistence.getMessages());
          }
        );
      }

      const { previewUrl, projectId } = result;
      console.log('✅ Code generation completed:', { previewUrl, projectId, isModification });
      
      // Associate session with sandbox (update or set)
      if (projectId) {
        chatPersistence.setSandboxId(projectId);
      }

      // Update final message
      const contextInfo = documents.length > 0 
        ? ` usando el contexto de ${documents.length} documento(s) analizado(s)`
        : '';
      
      const finalMessage = isModification 
        ? `🔄 **¡Mockup móvil modificado exitosamente!**\n\nHe actualizado el mockup de Rappi basándome en tu nueva solicitud${contextInfo}.\n\n📱 **Vista previa**: El mockup actualizado está ejecutándose en el mismo sandbox\n📦 **Framework**: ${framework}\n🆔 **Proyecto**: ${projectId}\n⚡ **Ventaja**: Sandbox reutilizado - modificación más rápida\n\n*Usa el botón 🔄 para recargar el preview si necesitas ver los cambios.*`
        : `✅ **¡Mockup móvil de Rappi generado exitosamente!**\n\nHe creado un nuevo mockup móvil basado en tu solicitud${contextInfo}.\n\n📱 **Vista previa**: El mockup está ejecutándose en un sandbox aislado\n📦 **Framework**: ${framework}\n🆔 **Proyecto**: ${projectId}\n🚀 **Nuevo sandbox**: Creado para esta sesión\n\n*El preview se muestra en formato móvil (375px) para simular la app de Rappi.*`;
      
      chatPersistence.updateMessage(generationMessage.id, {
        content: finalMessage,
        isGenerating: false,
        previewUrl,
        projectId
      });

      setMessages(chatPersistence.getMessages());
      
      // Update preview
      onPreviewUpdate?.(previewUrl);
      
      toast.success('¡Aplicación generada exitosamente!');
      
    } catch (error) {
      console.error('❌ Code generation failed:', error);
      
      chatPersistence.updateMessage(generationMessage.id, {
        content: `❌ **Error en la generación**\n\n${error instanceof Error ? error.message : 'Error desconocido'}`,
        isGenerating: false
      });
      
      setMessages(chatPersistence.getMessages());
      
      onLoadingStateChange?.({
        isLoading: false,
        stage: 'error',
        message: 'Error en la generación',
        progress: 0
      });
      
      toast.error('Error generando aplicación');
    }
  }, [onPreviewUpdate, onLoadingStateChange]);

  const handleChatResponse = useCallback(async (prompt: string) => {
    try {
      console.log('💬 Generating chat response with Gemini');
      
      // Get conversation history for Gemini
      const messages = chatPersistence.getMessages();
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get document context for reference
      const documents = chatPersistence.getDocumentContexts();
      const documentContext = documents.length > 0 
        ? `Documentos analizados: ${documents.map(doc => doc.fileName).join(', ')}`
        : '';

      // Use Gemini for natural chat responses
      const result = await apiService.chatWithGemini(
        prompt,
        `Rappi Creator - Plataforma de generación de aplicaciones web. ${documentContext}`,
        conversationHistory
      );

      if (result.success) {
        const assistantMessage = chatPersistence.addMessage({
          content: result.response,
          role: 'assistant'
        });

        setMessages(chatPersistence.getMessages());
        console.log('✅ Gemini chat response added');
      } else {
        throw new Error('Error en respuesta de Gemini');
      }
      
    } catch (error) {
      console.error('❌ Gemini chat response failed:', error);
      
      const errorMessage = chatPersistence.addMessage({
        content: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        role: 'assistant'
      });

      setMessages(chatPersistence.getMessages());
      throw error;
    }
  }, []);

  const detectCodeGenerationIntent = async (prompt: string): Promise<boolean> => {
    try {
      // Simple keyword-based detection first (fast fallback)
      const codeKeywords = [
        'crea', 'genera', 'construye', 'desarrolla', 'haz una', 'build', 'create', 'make',
        'aplicación', 'app', 'página', 'sitio', 'website', 'web', 'landing', 
        'dashboard', 'formulario', 'interfaz', 'componente'
      ];
      
      const hasCodeKeywords = codeKeywords.some(keyword => 
        prompt.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // If no obvious keywords, default to chat
      if (!hasCodeKeywords) {
        return false;
      }
      
      // Use Gemini for more nuanced detection when keywords are present
      const intentPrompt = `Analiza este mensaje del usuario y determina si quiere GENERAR CÓDIGO o CHATEAR.

Responde únicamente con "CÓDIGO" o "CHAT".

CÓDIGO = quiere crear, generar, construir, desarrollar una aplicación, página web, formulario, etc.
CHAT = quiere hacer una pregunta, conversar, pedir información, etc.

Mensaje: "${prompt}"

Respuesta:`;

      const result = await apiService.chatWithGemini(intentPrompt);
      
      if (result.success) {
        const response = result.response.trim().toUpperCase();
        return response.includes('CÓDIGO');
      }
      
      // Fallback to keyword detection if Gemini fails
      return hasCodeKeywords;
      
    } catch (error) {
      console.error('❌ Intent detection failed, using keyword fallback:', error);
      
      // Fallback to simple keyword detection
      const codeKeywords = ['crea', 'genera', 'construye', 'aplicación', 'app', 'página', 'web'];
      return codeKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
    }
  };

  const askClarifyingQuestions = async (prompt: string): Promise<string | null> => {
    try {
      console.log('🤔 Checking if clarification is needed for:', prompt);
      
      // Get document context for better questions
      const documents = chatPersistence.getDocumentContexts();
      const documentContext = documents.length > 0 
        ? `Documentos disponibles: ${documents.map(doc => doc.fileName).join(', ')}`
        : 'No hay documentos analizados';

      // Check if we already asked questions in this session
      const messages = chatPersistence.getMessages();
      const recentQuestions = messages.slice(-10).filter(msg => 
        msg.role === 'assistant' && msg.content.includes('🤔')
      );
      
      // If we've asked questions recently, skip clarification
      if (recentQuestions.length > 0) {
        console.log('🚫 Skipping clarification - already asked questions recently');
        return null;
      }

      const clarificationPrompt = `Actúa como un asistente especializado en crear mockups móviles de Rappi.

El usuario quiere: "${prompt}"

Contexto: ${documentContext}

Analiza si REALMENTE necesitas hacer preguntas de clarificación antes de generar el código. 

CRITERIOS PARA GENERAR DIRECTO:
- El request menciona cualquier elemento específico de UI (botón, pantalla, formulario, etc.)
- Hay documentos disponibles que pueden dar contexto
- El request es suficientemente específico
- Puedes inferir lo que quiere hacer

CRITERIOS PARA PREGUNTAR (MUY RESTRICTIVO):
- Request extremadamente vago como "crea algo"
- No hay contexto y el request es ambiguo
- Máximo 1-2 preguntas muy específicas

**IMPORTANTE**: Sé muy generoso con GENERAR_DIRECTO. Es mejor crear algo y iterar que preguntar mucho.

Responde con "GENERAR_DIRECTO" o máximo 2 preguntas específicas:`;

      const result = await apiService.chatWithGemini(clarificationPrompt);
      
      if (result.success) {
        const response = result.response.trim();
        if (response.includes('GENERAR_DIRECTO')) {
          return null; // No need for clarification
        }
        
        // If asking questions, ensure it's brief and only if really necessary
        if (response.length > 300) {
          console.log('🚫 Clarification too long, skipping');
          return null;
        }
        
        return response; // Return the clarifying questions
      }
      
      return null; // Fallback to direct generation
      
    } catch (error) {
      console.error('❌ Clarification failed:', error);
      return null; // Fallback to direct generation
    }
  };

  const handleSend = useCallback(async () => {
    console.log('🔍 handleSend called with:', { inputValue, attachedFiles });
    
    if (!inputValue.trim()) {
      console.log('🔍 handleSend: no input, returning early');
      return;
    }

    const currentInput = inputValue.trim();
    
    // Add user message to persistence
    const userMessage = chatPersistence.addMessage({
      content: currentInput,
      role: 'user',
      attachments: attachedFiles.length > 0 ? attachedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      })) : undefined
    });

    setMessages(chatPersistence.getMessages());
    setInputValue('');
    setAttachedFiles([]);
    setIsTyping(true);

    console.log('🔍 Processing input:', currentInput);

    try {
      // Use Gemini for intent detection
      const isCodeGenerationRequest = await detectCodeGenerationIntent(currentInput);
      
      console.log('🎯 Intent detected:', isCodeGenerationRequest ? 'CODE_GENERATION' : 'CHAT');

      if (isCodeGenerationRequest) {
        // Ask clarifying questions first
        const clarificationNeeded = await askClarifyingQuestions(currentInput);
        
        if (clarificationNeeded) {
          // Show clarifying questions instead of generating code
          console.log('🤔 Clarification needed, showing questions');
          
          const clarificationMessage = chatPersistence.addMessage({
            content: `🤔 **Perfecto! Quiero asegurarme de crear exactamente lo que necesitas.**\n\n${clarificationNeeded}\n\n*Una vez que me confirmes estos detalles, procederé a generar el código del mockup móvil.*`,
            role: 'assistant'
          });

          setMessages(chatPersistence.getMessages());
          return; // Don't generate code yet, wait for clarification
        }
        
        // Generate code with clean context (no clarification needed)
        await handleCodeGeneration(currentInput);
      } else {
        // Regular chat response with Gemini
        await handleChatResponse(currentInput);
      }
    } catch (error) {
      console.error('❌ Error in handleSend:', error);
      
      const errorMessage = chatPersistence.addMessage({
        content: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        role: 'assistant'
      });

      setMessages(chatPersistence.getMessages());
      toast.error('Error procesando mensaje');
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, attachedFiles, handleCodeGeneration, handleChatResponse]); // Dependencies for useCallback

  // Handle initial message from props - moved after handleSend definition
  useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      setInputValue(initialMessage);
      setTimeout(() => {
        handleSend();
      }, 100);
    }
  }, [initialMessage]); // Remove handleSend from dependencies to prevent infinite loop

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    try {
      // Get current sandbox ID before clearing session
      const currentSandboxId = chatPersistence.getSandboxId();
      
      // Clear all chat data
      chatPersistence.clearSession();
      setMessages(chatPersistence.getMessages());
      setAttachedFiles([]);
      setIsProcessingFile(false);
      setIsTyping(false);
      
      // Clear preview
      if (onPreviewUpdate) {
        onPreviewUpdate(null);
      }
      
      // Reset loading state
      if (onLoadingStateChange) {
        onLoadingStateChange({
          isLoading: false,
          stage: '',
          message: '',
          progress: 0
        });
      }
      
      // Close the previous sandbox if it exists
      if (currentSandboxId) {
        try {
          console.log('🗑️ Closing previous sandbox:', currentSandboxId);
          await apiService.killSandbox(currentSandboxId);
          console.log('✅ Previous sandbox closed successfully');
          toast.success('Nuevo chat iniciado - Sandbox anterior cerrado');
        } catch (error) {
          console.warn('⚠️ Failed to close previous sandbox:', error);
          toast.success('Nuevo chat iniciado');
        }
      } else {
        toast.success('Nuevo chat iniciado');
      }
      
      console.log('🆕 New chat started - context and sandbox cleared');
      
    } catch (error) {
      console.error('❌ Error starting new chat:', error);
      toast.error('Error al iniciar nuevo chat');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className={`flex flex-col h-full rounded-lg overflow-hidden ${className}`}>
      {/* Chat Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <img 
            src="/mostacho-icon.svg" 
            alt="Rappi Creator" 
            className="w-6 h-6"
          />
          <span className="font-medium text-sm">Rappi Creator</span>
        </div>
        <Button
          onClick={handleNewChat}
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          title="Iniciar nuevo chat"
        >
          <Plus className="w-3 h-3" />
          Nuevo Chat
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className={`${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <img 
                        src="/mostacho-icon.svg" 
                        alt="AI" 
                        className="w-4 h-4"
                      />
                    )}
                  </AvatarFallback>
                </Avatar>

                {/* Message Content */}
                <div className={`rounded-lg px-4 py-2 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : isDark 
                      ? 'bg-gray-800 text-gray-100' 
                      : 'bg-gray-100 text-gray-900'
                }`}>
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm opacity-80">
                          {getFileIcon(attachment.type)}
                          <span>{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Text */}
                  <div className="text-sm">
                    {message.role === 'assistant' ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>

                  {/* Generation Progress */}
                  {message.isGenerating && (
                    <div className="mt-2 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm opacity-80">Generando...</span>
                    </div>
                  )}

                  {/* Preview URL */}
                  {message.previewUrl && (
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onPreviewUpdate?.(message.previewUrl!)}
                        className="gap-2"
                      >
                        <Monitor className="w-4 h-4" />
                        Ver Preview
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-muted">
                    <img 
                      src="/mostacho-icon.svg" 
                      alt="AI" 
                      className="w-4 h-4"
                    />
                  </AvatarFallback>
                </Avatar>
                <div className={`rounded-lg px-4 py-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Procesando...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        {/* File attachments */}
        {attachedFiles.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1">
                  {getFileIcon(file.type)}
                  <span className="text-sm">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachedFile(index)}
                    className="h-auto p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingFile}
            className="flex-shrink-0"
          >
            {isProcessingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
          </Button>
          
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje... (Puedes subir PDFs e imágenes)"
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            disabled={isTyping}
          />
          
          <Button
            onClick={handleSend}
            disabled={(!inputValue.trim() || isTyping) && attachedFiles.length === 0}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default LovableChatInterface;