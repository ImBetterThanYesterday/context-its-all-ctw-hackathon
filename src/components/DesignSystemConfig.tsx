
import React, { useState } from 'react';
import { Palette, Code, Wand2, Download, ShoppingBag, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface DesignSystemConfigProps {
  onSystemSelected: (system: any) => void;
}

const DesignSystemConfig: React.FC<DesignSystemConfigProps> = ({ onSystemSelected }) => {
  const [selectedSystem, setSelectedSystem] = useState<string>('rappi');
  const [customColors, setCustomColors] = useState({
    primary: '#FA3D22',
    secondary: '#F6553F',
    background: '#FAFAFA',
    foreground: '#4C2C24',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFA500',
    info: '#1E18BC'
  });

  const [customInstructions, setCustomInstructions] = useState('');
  const [configSteps, setConfigSteps] = useState({
    colorPalette: true,
    typography: false,
    spacing: false,
    components: false
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    responsiveDesign: true,
    accessibility: true,
    animations: false,
    darkMode: false
  });

  const predefinedSystems = [
    {
      id: 'rappi',
      name: 'Rappi Design System',
      description: 'Sistema oficial de Rappi con colores y componentes optimizados',
      preview: '#FA3D22',
      colors: {
        primary: '#FA3D22',
        secondary: '#F6553F',
        background: '#FAFAFA',
        foreground: '#4C2C24',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FFA500',
        info: '#1E18BC'
      }
    },
    {
      id: 'tailwind',
      name: 'Tailwind CSS',
      description: 'Framework utilitario moderno con componentes flexibles',
      preview: '#3B82F6',
      colors: {
        primary: '#3B82F6',
        secondary: '#6366F1',
        background: '#FFFFFF',
        foreground: '#1F2937',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
      }
    },
    {
      id: 'material',
      name: 'Material Design',
      description: 'Google Material UI con principios de diseño sólidos',
      preview: '#2196F3',
      colors: {
        primary: '#2196F3',
        secondary: '#FF4081',
        background: '#FAFAFA',
        foreground: '#212121',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3'
      }
    }
  ];

  const handleSystemSelect = (systemId: string) => {
    setSelectedSystem(systemId);
    const system = predefinedSystems.find(s => s.id === systemId);
    if (system) {
      setCustomColors(system.colors);
      onSystemSelected({
        ...system,
        customInstructions,
        configSteps,
        advancedSettings
      });
    }
  };

  const handleCustomColorChange = (colorKey: string, value: string) => {
    const newColors = {
      ...customColors,
      [colorKey]: value
    };
    setCustomColors(newColors);
    
    // Update CSS variables in real-time
    document.documentElement.style.setProperty(`--color-${colorKey}`, value);
  };

  const handleConfigStepToggle = (step: string, checked: boolean) => {
    setConfigSteps(prev => ({
      ...prev,
      [step]: checked
    }));
  };

  const handleAdvancedSettingToggle = (setting: string, checked: boolean) => {
    setAdvancedSettings(prev => ({
      ...prev,
      [setting]: checked
    }));
  };

  const applyCustomSystem = () => {
    const customSystem = {
      id: 'custom',
      name: 'Sistema Personalizado Rappi',
      colors: customColors,
      customInstructions,
      configSteps,
      advancedSettings,
      timestamp: new Date().toISOString()
    };
    
    onSystemSelected(customSystem);
  };

  const exportConfiguration = () => {
    const config = {
      system: selectedSystem,
      colors: customColors,
      instructions: customInstructions,
      steps: configSteps,
      settings: advancedSettings
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rappi-design-system-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="rappi-card">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold flex items-center rappi-text-gradient">
          <Palette className="w-6 h-6 mr-3 text-primary" />
          Sistema de Diseño
        </CardTitle>
        <p className="text-muted-foreground font-medium">
          Configura el estilo visual y las instrucciones para tus pantallas generadas
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="predefined" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="predefined" className="font-semibold">Sistemas</TabsTrigger>
            <TabsTrigger value="custom" className="font-semibold">Personalizar</TabsTrigger>
            <TabsTrigger value="config" className="font-semibold">Configuración</TabsTrigger>
            <TabsTrigger value="instructions" className="font-semibold">Instrucciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predefined" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {predefinedSystems.map((system) => (
                <Card 
                  key={system.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedSystem === system.id ? 'border-primary bg-primary/10 rappi-glow' : 'bg-muted/20 border-border'
                  }`}
                  onClick={() => handleSystemSelect(system.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div 
                      className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                      style={{ 
                        background: system.id === 'rappi' 
                          ? 'linear-gradient(135deg, #FA3D22, #F6553F)' 
                          : `${system.preview}20` 
                      }}
                    >
                      {system.id === 'rappi' ? (
                        <ShoppingBag className="w-6 h-6 text-white" />
                      ) : (
                        <Code className="w-6 h-6" style={{ color: system.preview }} />
                      )}
                    </div>
                    <h3 className="font-bold mb-2 text-rappi-dark">{system.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{system.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(customColors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize font-semibold">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="color"
                        value={value}
                        onChange={(e) => handleCustomColorChange(key, e.target.value)}
                        className="w-16 h-10 p-1 border-border cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={value}
                        onChange={(e) => handleCustomColorChange(key, e.target.value)}
                        className="flex-1 font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-muted/30 rounded-lg p-6 border border-border">
                <h4 className="font-bold mb-4 text-rappi-dark flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Vista Previa
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    style={{ backgroundColor: customColors.primary, color: 'white' }}
                    className="font-bold"
                  >
                    Botón Primario
                  </Button>
                  <Button 
                    variant="outline"
                    style={{ borderColor: customColors.secondary, color: customColors.secondary }}
                    className="font-semibold"
                  >
                    Secundario
                  </Button>
                  <Button 
                    style={{ backgroundColor: customColors.success, color: 'white' }}
                    className="font-medium"
                  >
                    Éxito
                  </Button>
                  <Button 
                    style={{ backgroundColor: customColors.error, color: 'white' }}
                    className="font-medium"
                  >
                    Error
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-4 text-rappi-dark flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Pasos de Configuración
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(configSteps).map(([step, enabled]) => (
                    <div key={step} className="flex items-center space-x-2">
                      <Checkbox
                        id={step}
                        checked={enabled}
                        onCheckedChange={(checked) => handleConfigStepToggle(step, checked as boolean)}
                      />
                      <Label htmlFor={step} className="capitalize font-medium">
                        {step.replace(/([A-Z])/g, ' $1')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-rappi-dark">Configuraciones Avanzadas</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(advancedSettings).map(([setting, enabled]) => (
                    <div key={setting} className="flex items-center space-x-2">
                      <Checkbox
                        id={setting}
                        checked={enabled}
                        onCheckedChange={(checked) => handleAdvancedSettingToggle(setting, checked as boolean)}
                      />
                      <Label htmlFor={setting} className="capitalize font-medium">
                        {setting.replace(/([A-Z])/g, ' $1')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instructions" className="mt-6">
            <div className="space-y-4">
              <div>
                <Label className="font-semibold mb-2 block">Instrucciones Personalizadas</Label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Agrega instrucciones específicas para la generación de código (ej: 'Usar componentes modulares', 'Priorizar accesibilidad', 'Incluir animaciones suaves', etc.)"
                  className="min-h-[120px] resize-none"
                  rows={5}
                />
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Ejemplos de instrucciones útiles:</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• "Usar Grid CSS para layouts complejos"</li>
                  <li>• "Implementar modo oscuro automático"</li>
                  <li>• "Optimizar para dispositivos móviles primero"</li>
                  <li>• "Incluir estados de carga y error"</li>
                  <li>• "Usar animaciones CSS sutiles"</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button onClick={applyCustomSystem} className="flex-1 rappi-button font-bold">
            <Wand2 className="w-4 h-4 mr-2" />
            Aplicar Configuración
          </Button>
          <Button onClick={exportConfiguration} variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignSystemConfig;
