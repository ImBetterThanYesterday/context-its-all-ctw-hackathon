
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, Search, Filter, MoreHorizontal, Eye, Download, Share2, 
  Trash2, Edit, Calendar, Clock, FileText, Zap, TrendingUp,
  Users, ShoppingBag, Smartphone, Globe
} from 'lucide-react';

const ProjectsSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const projects = [
    {
      id: 1,
      name: 'Rappi Super App Redesign',
      description: 'Rediseño completo de la aplicación principal de Rappi',
      status: 'completed',
      progress: 100,
      screens: 24,
      lastModified: '2024-01-15',
      thumbnail: '/placeholder.svg',
      tags: ['Mobile', 'E-commerce', 'Rappi Style'],
      collaborators: 3
    },
    {
      id: 2,
      name: 'Dashboard Analytics',
      description: 'Panel de métricas y analytics para restaurantes',
      status: 'in-progress',
      progress: 65,
      screens: 8,
      lastModified: '2024-01-10',
      thumbnail: '/placeholder.svg',
      tags: ['Dashboard', 'Analytics', 'Web'],
      collaborators: 2
    },
    {
      id: 3,
      name: 'Checkout Flow Optimization',
      description: 'Optimización del flujo de compra para mejorar conversión',
      status: 'in-progress',
      progress: 30,
      screens: 6,
      lastModified: '2024-01-08',
      thumbnail: '/placeholder.svg',
      tags: ['Conversion', 'UX', 'Mobile'],
      collaborators: 4
    },
    {
      id: 4,
      name: 'Admin Panel v2',
      description: 'Nueva versión del panel administrativo',
      status: 'draft',
      progress: 10,
      screens: 15,
      lastModified: '2024-01-05',
      thumbnail: '/placeholder.svg',
      tags: ['Admin', 'Web', 'CRUD'],
      collaborators: 1
    }
  ];

  const stats = {
    totalProjects: 12,
    completedProjects: 8,
    totalScreens: 156,
    totalDownloads: 2340
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'draft': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En Progreso';
      case 'draft': return 'Borrador';
      default: return 'Desconocido';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-4xl font-display font-black rappi-text-gradient uppercase tracking-wide">
            Mis Proyectos
          </h2>
          <p className="text-xl text-muted-foreground mt-2">
            Gestiona y organiza todos tus proyectos RappiPage
          </p>
        </div>
        <Button className="rappi-button text-lg px-6 py-3">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Proyectos</p>
                <p className="text-3xl font-bold text-primary">{stats.totalProjects}</p>
              </div>
              <div className="w-12 h-12 rappi-gradient rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedProjects}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pantallas Creadas</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalScreens}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descargas</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalDownloads}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="recent">Recientes</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="in-progress">En Progreso</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-6">
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative">
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getStatusColor(project.status)} text-white`}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button size="sm" variant="ghost" className="w-8 h-8 bg-white/80 hover:bg-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button size="sm" className="rappi-button">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {project.collaborators}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>{project.screens} pantallas</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="w-4 h-4 mr-1" />
                      Compartir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No se encontraron proyectos</h3>
              <p className="text-muted-foreground mb-4">
                Intenta cambiar los filtros o términos de búsqueda
              </p>
              <Button className="rappi-button">
                <Plus className="w-4 h-4 mr-2" />
                Crear Nuevo Proyecto
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent">
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Proyectos Recientes</h3>
            <p className="text-muted-foreground">
              Aquí aparecerán tus proyectos más recientes
            </p>
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Proyectos Favoritos</h3>
            <p className="text-muted-foreground">
              Marca tus proyectos favoritos para acceso rápido
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectsSection;
