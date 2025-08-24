import React, { useState } from 'react';
import { Monitor, Home, Sun, Moon, Loader2, Code, ExternalLink, RefreshCw, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import LovableChatInterface from './LovableChatInterface';

interface ChatWithPreviewProps {
  onNavigateHome?: () => void;
  initialMessage?: string;
}

interface LoadingState {
  isLoading: boolean;
  stage: string;
  message: string;
  progress: number;
}

const ChatWithPreview: React.FC<ChatWithPreviewProps> = ({ onNavigateHome, initialMessage }) => {
  const { isDark, toggleTheme } = useTheme();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    stage: '',
    message: '',
    progress: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  const handleRefreshPreview = async () => {
    if (!previewUrl) return;
    
    setIsRefreshing(true);
    try {
      // Force iframe reload by changing src
      const iframe = document.querySelector('iframe[title="Generated Application Preview"]') as HTMLIFrameElement;
      if (iframe) {
        const currentSrc = iframe.src;
        iframe.src = 'about:blank';
        setTimeout(() => {
          iframe.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 'refresh=' + Date.now();
        }, 100);
      }
    } catch (error) {
      console.error('Error refreshing preview:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full bg-primary p-6">
      {/* Panel izquierdo - Chat Interface (≈35%) */}
      <div className="md:w-1/3 w-full">
        <Card className="h-full shadow-lg border border-border/50">
          <LovableChatInterface 
            className="h-full" 
            onPreviewUpdate={setPreviewUrl}
            onLoadingStateChange={setLoadingState}
            initialMessage={initialMessage}
          />
        </Card>
      </div>

      {/* Panel derecho - Preview Area (≈65%) */}
      <div className="flex-1 relative">
        {/* Botones de control */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className={`${isDark ? 'bg-gray-800/80 text-white border-gray-600 hover:bg-gray-700' : 'bg-white/80 text-gray-900 border-gray-300 hover:bg-gray-100'} backdrop-blur-sm`}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          
          {previewUrl && (
            <>
              <Button
                onClick={() => setViewMode(viewMode === 'mobile' ? 'desktop' : 'mobile')}
                variant="outline"
                size="sm"
                className={`${isDark ? 'bg-gray-800/80 text-white border-gray-600 hover:bg-gray-700' : 'bg-white/80 text-gray-900 border-gray-300 hover:bg-gray-100'} backdrop-blur-sm`}
                title={`Cambiar a vista ${viewMode === 'mobile' ? 'desktop' : 'móvil'}`}
              >
                {viewMode === 'mobile' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={handleRefreshPreview}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className={`${isDark ? 'bg-gray-800/80 text-white border-gray-600 hover:bg-gray-700' : 'bg-white/80 text-gray-900 border-gray-300 hover:bg-gray-100'} backdrop-blur-sm`}
                title="Recargar preview"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
                variant="outline"
                size="sm"
                className={`${isDark ? 'bg-gray-800/80 text-white border-gray-600 hover:bg-gray-700' : 'bg-white/80 text-gray-900 border-gray-300 hover:bg-gray-100'} backdrop-blur-sm`}
                title="Abrir en nueva pestaña"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Nueva Pestaña
              </Button>
            </>
          )}
          
          <Button
            onClick={onNavigateHome}
            variant="outline"
            size="sm"
            className={`${isDark ? 'bg-gray-800/80 text-white border-gray-600 hover:bg-gray-700' : 'bg-white/80 text-gray-900 border-gray-300 hover:bg-gray-100'} backdrop-blur-sm`}
          >
            <Home className="w-4 h-4 mr-2" />
            Inicio
          </Button>
        </div>
        
        <div className={`h-full rounded-lg border-2 border-dashed flex flex-col ${
          isDark 
            ? 'bg-gray-800/30 border-gray-600' 
            : 'bg-gray-100/50 border-gray-300'
        }`}>
          {previewUrl ? (
            <div className={`w-full h-full flex items-center justify-center ${viewMode === 'mobile' ? 'p-4' : ''}`}>
              <div className={`${viewMode === 'mobile' ? 'w-[375px] h-[667px] border-4 border-gray-800 rounded-[40px] shadow-xl overflow-hidden' : 'w-full h-full'}`}>
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full border-0 bg-background"
                  title="Generated Application Preview"
                />
              </div>
            </div>
          ) : loadingState.isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-6 max-w-md">
                {/* Loading Animation */}
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  } relative overflow-hidden`}>
                    <Code className={`w-10 h-10 ${
                      isDark ? 'text-orange-400' : 'text-orange-600'
                    } z-10`} />
                    <Loader2 className={`w-24 h-24 absolute animate-spin ${
                      isDark ? 'text-orange-500' : 'text-orange-600'
                    } opacity-60`} />
                  </div>
                  
                  {/* Progress Ring */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={isDark ? '#374151' : '#E5E7EB'}
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={isDark ? '#F97316' : '#EA580C'}
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - loadingState.progress / 100)}`}
                        className="transition-all duration-500 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                
                {/* Loading Text */}
                <div className="space-y-3">
                  <h3 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    🚀 Generando tu aplicación
                  </h3>
                  
                  <div className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {loadingState.message}
                  </div>
                  
                  {loadingState.stage && (
                    <div className={`text-xs px-3 py-1 rounded-full inline-block ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {loadingState.stage}
                    </div>
                  )}
                  
                  {/* Progress Bar */}
                  <div className={`w-full h-2 rounded-full ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  } overflow-hidden`}>
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 ease-out"
                      style={{ width: `${loadingState.progress}%` }}
                    />
                  </div>
                  
                  <div className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {loadingState.progress}% completado
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <Monitor className={`w-8 h-8 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-lg font-medium mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Aún no hay preview disponible
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Describe tu idea en el chat y la construiré
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWithPreview;