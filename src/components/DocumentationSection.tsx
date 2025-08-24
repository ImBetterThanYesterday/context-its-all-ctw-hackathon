
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Book, Search, ExternalLink, FileText, Video, Code, Zap, Download, PlayCircle } from 'lucide-react';

const DocumentationSection = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const quickStartSteps = [
    {
      title: 'Sube tu PRD',
      description: 'Arrastra y suelta tu documento PRD o pega el texto directamente',
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: 'Configura el Sistema de Diseño',
      description: 'Selecciona Rappi Style o sube tu propio sistema de tokens',
      icon: <Code className="w-5 h-5" />
    },
    {
      title: 'Genera las Pantallas',
      description: 'Nuestra IA analizará el PRD y generará las interfaces automáticamente',
      icon: <Zap className="w-5 h-5" />
    },
    {
      title: 'Descarga el Código',
      description: 'Obtén el código React completo listo para producción',
      icon: <Download className="w-5 h-5" />
    }
  ];

  const faqs = [
    {
      question: '¿Qué formatos de PRD son compatibles?',
      answer: 'RappiPage acepta documentos en formato PDF, DOCX, Markdown (.md) y texto plano. También puedes pegar el contenido directamente en el editor.'
    },
    {
      question: '¿Cómo funciona la detección de pantallas?',
      answer: 'Utilizamos modelos de IA entrenados específicamente para identificar patrones comunes en PRDs como "pantalla de login", "dashboard", "checkout", etc. El algoritmo analiza el contexto y la estructura del documento.'
    },
    {
      question: '¿Puedo personalizar el sistema de diseño?',
      answer: 'Sí, puedes usar los presets de Rappi, subir tus propios design tokens en formato JSON, o crear una paleta personalizada usando nuestro editor visual.'
    },
    {
      question: '¿El código generado es production-ready?',
      answer: 'El código generado sigue las mejores prácticas de React, usa TypeScript, Tailwind CSS y componentes de Shadcn/ui. Incluye responsive design y está optimizado para producción.'
    },
    {
      question: '¿Hay límites en el tamaño del PRD?',
      answer: 'Actualmente soportamos documentos de hasta 50MB. Para PRDs muy extensos, recomendamos dividirlos en secciones más pequeñas para mejores resultados.'
    },
    {
      question: '¿Cómo exporto mis proyectos?',
      answer: 'Puedes descargar el código completo como un archivo ZIP, exportar componentes individuales, o conectar directamente con tu repositorio de GitHub.'
    }
  ];

  const tutorials = [
    {
      title: 'Tutorial Básico: Tu Primer Proyecto',
      description: 'Aprende a crear tu primera interfaz desde un PRD en menos de 10 minutos',
      duration: '8 min',
      type: 'video',
      level: 'Principiante',
      thumbnail: '/placeholder.svg'
    },
    {
      title: 'Personalización de Design Systems',
      description: 'Cómo crear y aplicar sistemas de diseño personalizados',
      duration: '15 min',
      type: 'video',
      level: 'Intermedio',
      thumbnail: '/placeholder.svg'
    },
    {
      title: 'Optimización de PRDs para mejores resultados',
      description: 'Mejores prácticas para escribir PRDs que generen interfaces precisas',
      duration: '12 min',
      type: 'article',
      level: 'Intermedio',
      thumbnail: '/placeholder.svg'
    },
    {
      title: 'Integración con GitHub y Deploy',
      description: 'Conecta RappiPage con tu workflow de desarrollo',
      duration: '20 min',
      type: 'video',
      level: 'Avanzado',
      thumbnail: '/placeholder.svg'
    }
  ];

  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutorial.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-display font-black rappi-text-gradient uppercase tracking-wide">
          Documentación RappiPage
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Todo lo que necesitas saber para dominar RappiPage y convertir tus PRDs en interfaces funcionales
        </p>
      </div>

      <Tabs defaultValue="quickstart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quickstart">Inicio Rápido</TabsTrigger>
          <TabsTrigger value="tutorials">Tutoriales</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="quickstart" className="space-y-6">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-bold flex items-center">
                <Zap className="w-6 h-6 mr-2 text-primary" />
                Comenzar en 4 pasos
              </CardTitle>
              <CardDescription>
                Crea tu primera interfaz en menos de 5 minutos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStartSteps.map((step, index) => (
                  <div key={index} className="text-center space-y-3">
                    <div className="w-12 h-12 rappi-gradient rounded-full flex items-center justify-center mx-auto text-white">
                      {step.icon}
                    </div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Formatos Soportados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>PDF Documents</span>
                  <Badge variant="secondary">✓ Soportado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Word Documents (.docx)</span>
                  <Badge variant="secondary">✓ Soportado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Markdown (.md)</span>
                  <Badge variant="secondary">✓ Soportado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Texto Plano</span>
                  <Badge variant="secondary">✓ Soportado</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Tecnologías Generadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>React + TypeScript</span>
                  <Badge className="rappi-gradient text-white">Incluido</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tailwind CSS</span>
                  <Badge className="rappi-gradient text-white">Incluido</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shadcn/ui Components</span>
                  <Badge className="rappi-gradient text-white">Incluido</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Responsive Design</span>
                  <Badge className="rappi-gradient text-white">Incluido</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar tutoriales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTutorials.map((tutorial, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button className="rappi-button">
                      {tutorial.type === 'video' ? (
                        <><PlayCircle className="w-4 h-4 mr-2" /> Ver Video</>
                      ) : (
                        <><Book className="w-4 h-4 mr-2" /> Leer Artículo</>
                      )}
                    </Button>
                  </div>
                  <Badge className="absolute top-3 right-3 bg-black/60 text-white">
                    {tutorial.duration}
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{tutorial.title}</CardTitle>
                    <Badge variant={tutorial.level === 'Principiante' ? 'secondary' : tutorial.level === 'Intermedio' ? 'default' : 'destructive'}>
                      {tutorial.level}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {tutorial.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                API Reference
              </CardTitle>
              <CardDescription>
                Documentación completa de la API de RappiPage para integraciones avanzadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Endpoint Base</h4>
                <code className="text-sm">https://api.rappipage.com/v1</code>
              </div>
              
              <div className="space-y-3">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">POST /analyze</h4>
                  <p className="text-sm text-muted-foreground">Analiza un documento PRD y extrae las pantallas</p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">POST /generate</h4>
                  <p className="text-sm text-muted-foreground">Genera el código de las interfaces</p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">GET /templates</h4>
                  <p className="text-sm text-muted-foreground">Obtiene la lista de plantillas disponibles</p>
                </div>
              </div>

              <Button className="rappi-button">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Documentación Completa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">¿No encuentras lo que buscas?</h3>
              <p className="text-muted-foreground mb-4">
                Nuestro equipo de soporte está aquí para ayudarte
              </p>
              <Button className="rappi-button">
                Contactar Soporte
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentationSection;
