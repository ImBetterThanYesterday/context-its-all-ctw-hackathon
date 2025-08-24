
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Download, Star, Search, Filter, Zap, ShoppingBag, Smartphone, Globe } from 'lucide-react';

const TemplatesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    {
      id: 1,
      name: 'E-commerce Dashboard',
      description: 'Dashboard completo para plataformas de e-commerce con métricas en tiempo real',
      category: 'dashboard',
      rating: 4.8,
      downloads: 1234,
      preview: '/placeholder.svg',
      tags: ['React', 'Tailwind', 'Charts'],
      rappiStyle: true
    },
    {
      id: 2,
      name: 'App Móvil Delivery',
      description: 'Interfaz completa para aplicaciones de delivery con tracking en tiempo real',
      category: 'mobile',
      rating: 4.9,
      downloads: 2100,
      preview: '/placeholder.svg',
      tags: ['Mobile', 'Maps', 'Real-time'],
      rappiStyle: true
    },
    {
      id: 3,
      name: 'Landing Page Rappi',
      description: 'Página de aterrizaje optimizada con el estilo visual de Rappi',
      category: 'landing',
      rating: 4.7,
      downloads: 890,
      preview: '/placeholder.svg',
      tags: ['Landing', 'Conversion', 'Rappi Brand'],
      rappiStyle: true
    },
    {
      id: 4,
      name: 'Admin Panel',
      description: 'Panel de administración con gestión de usuarios y contenido',
      category: 'admin',
      rating: 4.6,
      downloads: 567,
      preview: '/placeholder.svg',
      tags: ['Admin', 'CRUD', 'Tables'],
      rappiStyle: false
    },
    {
      id: 5,
      name: 'Marketplace Multi-vendor',
      description: 'Plataforma completa para marketplace con múltiples vendedores',
      category: 'ecommerce',
      rating: 4.8,
      downloads: 1500,
      preview: '/placeholder.svg',
      tags: ['Marketplace', 'Vendors', 'Payments'],
      rappiStyle: true
    },
    {
      id: 6,
      name: 'Social Media App',
      description: 'Interfaz de red social con feed, stories y mensajería',
      category: 'social',
      rating: 4.5,
      downloads: 800,
      preview: '/placeholder.svg',
      tags: ['Social', 'Feed', 'Messages'],
      rappiStyle: false
    }
  ];

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'dashboard', label: 'Dashboards' },
    { value: 'mobile', label: 'Aplicaciones Móviles' },
    { value: 'landing', label: 'Landing Pages' },
    { value: 'admin', label: 'Admin Panels' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'social', label: 'Redes Sociales' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dashboard': return <Globe className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'ecommerce': return <ShoppingBag className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-display font-black rappi-text-gradient uppercase tracking-wide">
          Plantillas RappiPage
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Acelera tu desarrollo con plantillas pre-diseñadas que siguen los estándares de Rappi
        </p>
      </div>

      {/* Filters */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-64">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative">
              <img
                src={template.preview}
                alt={template.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              {template.rappiStyle && (
                <Badge className="absolute top-3 right-3 rappi-gradient text-white">
                  <ShoppingBag className="w-3 h-3 mr-1" />
                  Rappi Style
                </Badge>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button className="rappi-button">
                  <Eye className="w-4 h-4 mr-2" />
                  Vista Previa
                </Button>
              </div>
            </div>
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(template.category)}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {template.rating}
                </div>
              </div>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">
                  {template.downloads.toLocaleString()} descargas
                </span>
                <Button className="rappi-button">
                  <Download className="w-4 h-4 mr-2" />
                  Usar Plantilla
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No se encontraron plantillas</h3>
          <p className="text-muted-foreground">
            Intenta cambiar los filtros o términos de búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplatesSection;
