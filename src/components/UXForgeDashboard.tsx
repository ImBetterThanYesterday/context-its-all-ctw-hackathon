
import React, { useState } from 'react';
import { Sparkles, Zap, Bot, Upload, FileText, X, ArrowUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import DocumentAnalysis from './DocumentAnalysis';
import ScreenDetectionGrid from './ScreenDetectionGrid';
import UIGeneratorViewer from './UIGeneratorViewer';
import AboutUsSection from './AboutUsSection';
import TemplatesSection from './TemplatesSection';
import DocumentationSection from './DocumentationSection';
import ProjectsSection from './ProjectsSection';
import LovableChatInterface from './LovableChatInterface';
import ChatHeroInput from './ChatHeroInput';
import ChatWithPreview from './ChatWithPreview';
import { apiService } from '@/lib/api-service';

const UXForgeDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [detectedScreens, setDetectedScreens] = useState<any[]>([]);
  const [isUIGenerated, setIsUIGenerated] = useState(false);
  const [selectedScreensForGeneration, setSelectedScreensForGeneration] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [isProcessingFiles, setIsProcessingFiles] = useState<boolean>(false);

  const handleAnalysisComplete = (screens: any[]) => {
    setDetectedScreens(screens);
    toast.success('Análisis completado exitosamente');
  };

  const handleHeroSubmit = async (message: string, files?: File[]) => {
    if (files && files.length > 0) {
      setIsProcessingFiles(true);
      try {
        // Process files with Gemini before navigating to chat
        const processedFiles = [];
        
        for (const file of files) {
          console.log(`🔍 Processing file: ${file.name}`);
          toast.info(`Procesando ${file.name}...`);
          
          const result = await apiService.processDocumentWithGemini(
            file,
            undefined,
            (progressMessage) => {
              console.log('📄 Progress:', progressMessage);
              toast.info(progressMessage);
            }
          );
          
          if (result.success) {
            processedFiles.push({
              fileName: file.name,
              extractedData: result.extractedData,
              documentId: result.documentId
            });
            toast.success(`✅ ${file.name} procesado exitosamente`);
          }
        }
        
        // Store processed files data for the chat interface
        localStorage.setItem('processedFiles', JSON.stringify(processedFiles));
        
        console.log('✅ All files processed successfully');
        toast.success('¡Todos los archivos procesados! Navegando al chat...');
        
      } catch (error) {
        console.error('❌ Error processing files:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        toast.error(`Error procesando archivos: ${errorMessage}`);
      } finally {
        setIsProcessingFiles(false);
      }
    }
    
    // Navigate to chat with initial message
    setInitialMessage(message);
    setActiveSection('chat');
  };



  const handleUIGeneration = (selectedScreens: string[]) => {
    setSelectedScreensForGeneration(selectedScreens);
    setIsUIGenerated(true);
    toast.success('Generación de UI iniciada');
  };


  const navigationItems = [
    { id: 'home', label: 'Inicio' },
    { id: 'projects', label: 'Proyectos' },
    { id: 'templates', label: 'Plantillas' },
    { id: 'docs', label: 'Documentación' },
    { id: 'about', label: 'Nosotros' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className="h-screen">
            <ChatWithPreview 
              onNavigateHome={() => setActiveSection('home')}
              initialMessage={initialMessage}
            />
          </div>
        );
      case 'projects':
        return <ProjectsSection />;
      case 'templates':
        return <TemplatesSection />;
      case 'docs':
        return <DocumentationSection />;
      case 'about':
        return <AboutUsSection />;
      default:
        return (
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center py-8 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 pointer-events-none blur-[120px] opacity-60">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#FA3D22_0%,_transparent_70%)]"></div>
                </div>
                <div className="relative">
                  <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center animate-bounce-subtle">
                    <img 
                      src="/rappi-creator.svg" 
                      alt="Rappi Creator Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-5xl md:text-7xl font-display font-extrabold mb-4 tracking-tight drop-shadow-lg">
                    <span className="block text-white">
                      Convierte tu <span className="inline-block scale-110 rotate-[-3deg] text-white drop-shadow-md">PRD</span>
                    </span>
                    <span className="block mt-2 text-3xl md:text-5xl font-light text-white italic animate-fade-in-slow relative">
                      <span className="text-black">en pantallas</span> <span className="font-bold text-white">funcionales</span>
                      <img 
                        src="/mostacho-icon.svg" 
                        alt="Mostacho" 
                        className="inline-block w-12 h-12 md:w-16 md:h-16 ml-3 animate-shake"
                      />
                    </span>
                  </h2>
                  <div className="mb-12">
                    <ChatHeroInput onSubmit={handleHeroSubmit} />
                    {isProcessingFiles && (
                      <div className="mt-4 text-center text-sm text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Procesando archivos con Gemini...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Document Analysis Section */}
            <section className="animate-fade-in">
              <DocumentAnalysis 
                onAnalysisComplete={handleAnalysisComplete}
              />
            </section>



            {/* Screen Detection Results */}
            {detectedScreens.length > 0 && (
              <section className="animate-slide-up">
                <ScreenDetectionGrid 
                  screens={detectedScreens} 
                  onGenerateUI={handleUIGeneration}
                />
              </section>
            )}

            {/* Generated UI Visualization */}
            {isUIGenerated && (
              <section className="animate-slide-up">
                <UIGeneratorViewer 
                  selectedScreens={selectedScreensForGeneration}
                  designSystem={null}
                />
              </section>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Hidden in chat mode */}
      {activeSection !== 'chat' && (
        <header className="border-b border-border sticky top-0 z-50 bg-card/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 flex items-center justify-center">
                <img 
                  src="/mostacho-icon.svg" 
                  alt="Rappi Creator" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`font-medium transition-colors px-3 py-2 rounded-md flex items-center gap-2 ${
                    activeSection === item.id 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <Button 
            onClick={() => setActiveSection('chat')}
            className="rappi-button font-bold uppercase tracking-wide"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Chat IA
          </Button>
        </div>
        </header>
      )}

      {activeSection === 'chat' ? (
        <div className="h-screen">
          {renderContent()}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {renderContent()}
        </div>
      )}

      {/* Footer - Hidden in chat mode */}
      {activeSection !== 'chat' && (
        <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/991156d7-7bc1-40c0-a789fba9829c.png" 
                  alt="Rappi Creator" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                Rappi Creator - Powered by Rappi • De tu PRD al diseño en segundos
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground font-medium">
              <a href="#" className="hover:text-primary transition-colors">Términos</a>
              <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
              <a href="#" className="hover:text-primary transition-colors">Soporte</a>
            </div>
          </div>
        </div>
        </footer>
      )}
    </div>
  );
};

export default UXForgeDashboard;
