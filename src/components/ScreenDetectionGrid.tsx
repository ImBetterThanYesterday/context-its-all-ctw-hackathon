
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Code, Smartphone, Monitor, Tablet, Edit, Zap, CheckCircle } from 'lucide-react';

interface Screen {
  id: string;
  name: string;
  description: string;
  components: string[];
  type: 'mobile' | 'desktop' | 'tablet';
  complexity: 'simple' | 'medium' | 'complex';
  preview?: string;
}

interface ScreenDetectionGridProps {
  screens: Screen[];
  onGenerateUI: (selectedScreens: string[]) => void;
}

const ScreenDetectionGrid = ({ screens = [], onGenerateUI }: ScreenDetectionGridProps) => {
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);

  // Datos simulados si no hay pantallas
  const defaultScreens: Screen[] = [
    {
      id: '1',
      name: 'Pantalla de Inicio',
      description: 'Landing principal con hero section, características y CTAs',
      components: ['Header', 'Hero Section', 'Feature Cards', 'Footer'],
      type: 'desktop',
      complexity: 'medium'
    },
    {
      id: '2',
      name: 'Dashboard Analytics',
      description: 'Panel de control con métricas y gráficos en tiempo real',
      components: ['Sidebar', 'Charts', 'KPI Cards', 'Data Tables'],
      type: 'desktop',
      complexity: 'complex'
    },
    {
      id: '3',
      name: 'Perfil de Usuario',
      description: 'Página de configuración personal y preferencias',
      components: ['Profile Card', 'Settings Form', 'Avatar Upload'],
      type: 'mobile',
      complexity: 'simple'
    },
    {
      id: '4',
      name: 'Checkout Process',
      description: 'Flujo de compra con formularios y validaciones',
      components: ['Cart Summary', 'Payment Form', 'Progress Steps'],
      type: 'tablet',
      complexity: 'complex'
    },
    {
      id: '5',
      name: 'Lista de Productos',
      description: 'Catálogo con filtros, búsqueda y paginación',
      components: ['Search Bar', 'Filter Panel', 'Product Grid', 'Pagination'],
      type: 'desktop',
      complexity: 'medium'
    },
    {
      id: '6',
      name: 'Notificaciones',
      description: 'Centro de notificaciones con diferentes tipos de alertas',
      components: ['Notification List', 'Filter Tabs', 'Action Buttons'],
      type: 'mobile',
      complexity: 'simple'
    }
  ];

  // Ensure we always have a valid array to work with
  const displayScreens = Array.isArray(screens) && screens.length > 0 ? screens : defaultScreens;

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleScreenSelection = (screenId: string, checked: boolean) => {
    if (checked) {
      setSelectedScreens([...selectedScreens, screenId]);
    } else {
      setSelectedScreens(selectedScreens.filter(id => id !== screenId));
    }
  };

  const handleGenerateUI = () => {
    const screensToGenerate = selectedScreens.length > 0 ? selectedScreens : displayScreens.map(s => s.id);
    onGenerateUI(screensToGenerate);
  };

  // Safety check to prevent rendering if displayScreens is still invalid
  if (!Array.isArray(displayScreens) || displayScreens.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se encontraron pantallas para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-3xl font-display font-black rappi-text-gradient uppercase">
          Pantallas Detectadas
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Hemos identificado {displayScreens.length} pantallas en tu PRD. Selecciona las que quieres generar.
        </p>
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            {selectedScreens.length} de {displayScreens.length} pantallas seleccionadas
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedScreens(displayScreens.map(s => s.id))}
          >
            Seleccionar todas
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedScreens([])}
          >
            Limpiar selección
          </Button>
        </div>
        <Button 
          className="rappi-button"
          onClick={handleGenerateUI}
        >
          <Zap className="w-4 h-4 mr-2" />
          Generar Interfaces
        </Button>
      </div>

      {/* Screens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayScreens.map((screen) => (
          <Card 
            key={screen.id} 
            className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
              selectedScreens.includes(screen.id) ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedScreens.includes(screen.id)}
                    onCheckedChange={(checked) => handleScreenSelection(screen.id, checked as boolean)}
                  />
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(screen.type)}
                    <CardTitle className="text-lg">{screen.name}</CardTitle>
                  </div>
                </div>
                <Badge className={getComplexityColor(screen.complexity)}>
                  {screen.complexity}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {screen.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Mock Preview */}
              <div className="aspect-video bg-gradient-to-br from-muted to-muted-foreground/10 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                <div className="text-center space-y-2">
                  <Eye className="w-8 h-8 text-muted-foreground mx-auto" />
                  <span className="text-sm text-muted-foreground">Vista Previa</span>
                </div>
              </div>
              
              {/* Components */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Componentes detectados:</span>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(screen.components) && screen.components.map((component, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {component}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Code className="w-4 h-4 mr-2" />
                  Código
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-primary">{displayScreens.length}</div>
          <div className="text-sm text-muted-foreground">Pantallas Totales</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">
            {displayScreens.filter(s => s.type === 'mobile').length}
          </div>
          <div className="text-sm text-muted-foreground">Móviles</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">
            {displayScreens.filter(s => s.type === 'desktop').length}
          </div>
          <div className="text-sm text-muted-foreground">Desktop</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">
            {displayScreens.reduce((acc, screen) => acc + (Array.isArray(screen.components) ? screen.components.length : 0), 0)}
          </div>
          <div className="text-sm text-muted-foreground">Componentes</div>
        </Card>
      </div>
    </div>
  );
};

export default ScreenDetectionGrid;
