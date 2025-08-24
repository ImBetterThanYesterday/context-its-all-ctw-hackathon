
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Share, 
  Code, 
  Eye, 
  Smartphone, 
  Monitor, 
  Tablet,
  Zap,
  ExternalLink,
  Copy,
  Github,
  Figma
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UIGeneratorViewerProps {
  selectedScreens: string[];
  designSystem: any;
}

const UIGeneratorViewer = ({ selectedScreens, designSystem }: UIGeneratorViewerProps) => {
  const [activeDevice, setActiveDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Simulated generated screens
  const generatedScreens = [
    {
      id: '1',
      name: 'Pantalla de Inicio',
      type: 'desktop',
      html: `
        <div class="min-h-screen bg-gray-50">
          <header class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-orange-500 rounded-lg"></div>
                  <h1 class="text-xl font-bold text-gray-900">Rappi Creator</h1>
                </div>
                <nav class="hidden md:flex space-x-6">
                  <a href="#" class="text-gray-600 hover:text-orange-500">Inicio</a>
                  <a href="#" class="text-gray-600 hover:text-orange-500">Productos</a>
                  <a href="#" class="text-gray-600 hover:text-orange-500">Servicios</a>
                </nav>
                <button class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                  Comenzar
                </button>
              </div>
            </div>
          </header>
          <main class="max-w-7xl mx-auto px-4 py-16">
            <div class="text-center space-y-8">
              <h2 class="text-5xl font-bold text-gray-900">
                Convierte tu PRD en <span class="text-orange-500">pantallas funcionales</span>
              </h2>
              <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                Una herramienta Rappi con IA integrada. De tu documento a diseño en segundos.
              </p>
              <button class="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all">
                Subir PRD
              </button>
            </div>
          </main>
        </div>
      `,
      react: `
import React from 'react';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg"></div>
              <h1 className="text-xl font-bold text-gray-900">Rappi Creator</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-orange-500">Inicio</a>
              <a href="#" className="text-gray-600 hover:text-orange-500">Productos</a>
              <a href="#" className="text-gray-600 hover:text-orange-500">Servicios</a>
            </nav>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Comenzar
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h2 className="text-5xl font-bold text-gray-900">
            Convierte tu PRD en <span className="text-orange-500">pantallas funcionales</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Una herramienta Rappi con IA integrada. De tu documento a diseño en segundos.
          </p>
          <Button className="bg-orange-500 hover:bg-orange-600 px-8 py-4 text-lg font-semibold">
            Subir PRD
          </Button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
      `
    }
  ];

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceClass = () => {
    switch (activeDevice) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'tablet': return 'max-w-2xl mx-auto';
      default: return 'w-full';
    }
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado",
      description: "El código ha sido copiado al portapapeles",
    });
  };

  const handleDownload = (format: string) => {
    toast({
      title: "Descarga iniciada",
      description: `Descargando archivos en formato ${format}`,
    });
  };

  const handleShare = () => {
    toast({
      title: "Enlace copiado",
      description: "El enlace para compartir ha sido copiado al portapapeles",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rappi-gradient rounded-2xl mx-auto flex items-center justify-center animate-bounce-subtle">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-3xl font-display font-black rappi-text-gradient uppercase">
          ¡Interfaces Generadas!
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Hemos creado {selectedScreens.length} pantallas basadas en tu PRD y sistema de diseño.
        </p>
      </div>

      {/* Action Bar */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Badge className="rappi-gradient text-white">
                {selectedScreens.length} Pantallas
              </Badge>
              <Badge variant="secondary">
                React + Tailwind
              </Badge>
              <Badge variant="secondary">
                Responsive
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => handleDownload('HTML')}>
                <Download className="w-4 h-4 mr-2" />
                HTML/CSS
              </Button>
              <Button variant="outline" onClick={() => handleDownload('React')}>
                <Github className="w-4 h-4 mr-2" />
                React
              </Button>
              <Button variant="outline" onClick={() => handleDownload('Figma')}>
                <Figma className="w-4 h-4 mr-2" />
                Figma
              </Button>
              <Button className="rappi-button" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Preview Controls */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2 bg-card border border-border rounded-lg p-1">
          {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
            <Button
              key={device}
              variant={activeDevice === device ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveDevice(device)}
              className={activeDevice === device ? 'rappi-button' : ''}
            >
              {getDeviceIcon(device)}
              <span className="ml-2 capitalize">{device}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Generated Screens */}
      <div className="space-y-8">
        {generatedScreens.map((screen) => (
          <Card key={screen.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {getDeviceIcon(screen.type)}
                    <span>{screen.name}</span>
                  </CardTitle>
                  <CardDescription>
                    Pantalla generada automáticamente con componentes responsivos
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Vista Completa
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs defaultValue="preview" className="w-full">
                <div className="px-6 pb-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                    <TabsTrigger value="code">Código</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="preview" className="px-6 pb-6">
                  <div className={`border border-border rounded-lg overflow-hidden ${getDeviceClass()}`}>
                    <div 
                      className="bg-white"
                      style={{ 
                        minHeight: activeDevice === 'mobile' ? '600px' : '400px',
                        transform: `scale(${activeDevice === 'mobile' ? '0.8' : '1'})`,
                        transformOrigin: 'top center'
                      }}
                      dangerouslySetInnerHTML={{ __html: screen.html }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="code" className="px-6 pb-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">React Component</Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCopyCode(screen.react)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{screen.react}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export Options */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-center">¿Listo para exportar?</CardTitle>
          <CardDescription className="text-center">
            Descarga tu proyecto completo o envíalo directamente a tu plataforma favorita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex-col space-y-2">
              <Download className="w-6 h-6" />
              <span>Proyecto Completo</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2">
              <Github className="w-6 h-6" />
              <span>GitHub Repo</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col space-y-2">
              <Figma className="w-6 h-6" />
              <span>Exportar a Figma</span>
            </Button>
            <Button className="rappi-button h-16 flex-col space-y-2">
              <Zap className="w-6 h-6" />
              <span>Deploy Ahora</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UIGeneratorViewer;
