# 📋 Rappi Creator - Knowledge Base del Proyecto

## 🎯 Resumen Ejecutivo

**Rappi Creator** es una plataforma de desarrollo de interfaz de usuario que convierte documentos de requisitos de producto (PRD) en pantallas funcionales utilizando inteligencia artificial. El proyecto combina la potencia de Claude Code SDK para análisis de documentos y generación de código con E2B Sandboxes para ejecución segura de código en tiempo real.

### Propósito Principal
Acelerar el proceso de desarrollo de interfaces de usuario permitiendo a los equipos de producto y desarrollo generar prototipos funcionales a partir de especificaciones de producto escritas en lenguaje natural.

### Usuarios Objetivo
- Product Managers que necesitan visualizar rápidamente sus ideas
- Diseñadores UX/UI que quieren prototipos funcionales
- Desarrolladores que buscan acelerar el scaffolding inicial de proyectos

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

#### Frontend
- **Framework**: React 18.3.1 con TypeScript
- **Build Tool**: Vite 5.4.1
- **Estilado**: Tailwind CSS 3.4.11 + shadcn/ui
- **Estado**: React Context (ThemeContext)
- **Routing**: React Router DOM 6.26.2
- **UI Components**: Radix UI + shadcn/ui (componentes accesibles y modernos)

#### Backend
- **Runtime**: Node.js con Express 5.1.0
- **Lenguaje**: TypeScript con tsx para ejecución
- **CORS**: Configurado para desarrollo local

#### Integraciones Externas
- **Claude AI**: Anthropic SDK 0.56.0 (Claude Sonnet 4)
- **E2B Sandboxes**: E2B Code Interpreter 1.5.1
- **Claude Code SDK**: Anthropic Claude Code 1.0.0

### Arquitectura de Componentes

```
src/
├── components/
│   ├── UXForgeDashboard.tsx      # Componente principal del dashboard
│   ├── ChatWithPreview.tsx       # Chat con vista previa en tiempo real
│   ├── LovableChatInterface.tsx  # Interfaz de chat estilo Lovable
│   ├── DocumentAnalysis.tsx      # Análisis de documentos PRD
│   ├── ScreenDetectionGrid.tsx   # Grid de pantallas detectadas
│   └── ui/                       # Biblioteca completa shadcn/ui
├── contexts/
│   └── ThemeContext.tsx          # Gestión de tema claro/oscuro
├── lib/
│   ├── claude-sdk.ts            # Integración Claude Code SDK
│   ├── e2b-service.ts           # Servicio E2B Sandbox
│   └── api-service.ts           # Cliente API para backend
└── pages/
    ├── Index.tsx                # Página principal
    └── NotFound.tsx             # Página 404
```

---

## ⚡ Funcionalidades Actuales

### 1. Dashboard Principal (UXForgeDashboard)
- **Navegación**: 5 secciones principales (Inicio, Proyectos, Plantillas, Documentación, Nosotros)
- **Tema**: Soporte completo para modo claro/oscuro
- **Branding**: Integración completa de colores y gradientes Rappi

### 2. Análisis de Documentos (DocumentAnalysis)
- **Upload**: Soporte para archivos múltiples (PDF, DOC, TXT, imágenes)
- **Procesamiento**: Análisis con Claude AI para extraer pantallas y funcionalidades
- **Detección**: Identificación automática de flujos de usuario y componentes UI

### 3. Chat Interface (LovableChatInterface)
- **Estilo Lovable**: Interfaz moderna inspirada en Lovable
- **Avatar AI**: Mostacho icon como avatar del asistente
- **Mensajería**: Soporte para texto e imágenes
- **Tema**: Adapta automáticamente al tema del sistema

### 4. Generación de Código (E2B Integration)
- **Sandboxes**: Entornos aislados para ejecución de código
- **Frameworks Soportados**: Next.js, React (CRA), Vite
- **Vista Previa**: URLs de preview en tiempo real
- **Gestión**: Cleanup automático de sandboxes (>10 minutos)

### 5. API Backend
- **Endpoints Principales**:
  - `POST /api/chat` - Chat con Claude AI
  - `POST /api/analyze-document` - Análisis de documentos
  - `POST /api/e2b/generate` - Generación de aplicaciones
  - `GET /health` - Health check con métricas

---

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo
npm run dev          # Frontend (puerto 8081)
npm run server       # Backend (puerto 3001)
npm run dev:full     # Frontend + Backend concurrente

# Testing
npx tsx test-e2b-basic.ts        # Test básico E2B
npx tsx test-api-integration.ts  # Test integración API

# Build y Deploy
npm run build        # Build producción
npm run lint         # Linting ESLint
```

---

## 🔧 Variables de Entorno

```bash
# Backend (.env)
E2B_API_KEY=your_e2b_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

---

## 📈 Métricas de Rendimiento

### Optimizaciones E2B Implementadas
- ✅ **90% más rápido**: Arquitectura simplificada sin npm installs complejos
- ✅ **Python HTTP Server**: Servidor confiable y ligero
- ✅ **Batch File Operations**: Escritura de múltiples archivos en una sola llamada
- ✅ **Streaming Logs**: Output en tiempo real con onStdout/onStderr
- ✅ **Cleanup Automático**: Eliminación de sandboxes inactivos

### Nuevas Funcionalidades Implementadas ✅
- ✅ **Procesamiento PDF con Gemini**: Análisis automático de documentos con IA
- ✅ **Persistencia de Chat**: Memoria de conversaciones entre sesiones
- ✅ **Contexto de Documentos**: Integración de contenido analizado en respuestas
- ✅ **Flujo PDF → Gemini → Claude**: Pipeline completo de procesamiento
- ✅ **Soporte Multi-formato**: PDF, JPG, PNG, GIF, WebP
- ✅ **Análisis Estructurado**: Extracción de PRDs, wireframes, specs técnicas
- ✅ **Smart Context Manager**: Sistema inteligente de gestión de contexto
- ✅ **Auto-detección de Intent**: Distingue automáticamente código vs conversación
- ✅ **Token Budget Management**: Optimización de uso de tokens por tipo de request
- ✅ **Filtrado de Relevancia**: Solo usa documentos recientes y relevantes
- ✅ **Context Isolation**: Contexto limpio para generación de código (sin historial chat)
- ✅ **128K Token Support**: Ventana de contexto masiva para proyectos complejos
- ✅ **Extended Memory**: Hasta 48 horas de retención de documentos, 20+ mensajes de historial
- ✅ **Smart Truncation**: Puntos de corte inteligentes en párrafos y secciones

---

### 1. **Funcionalidades de Producto a desarrollar**

#### ✅ COMPLETADO - Procesamiento de documentos
- **Problema**: Los documentos PDF no se procesaban correctamente con Claude
- **Solución**: Implementado procesamiento con Gemini API → JSON estructurado → Claude
- **Estado**: Funcionando - PDFs e imágenes se procesan automáticamente al subirlos

#### ✅ COMPLETADO - Persistencia de memoria en chat
- **Problema**: La IA no recordaba mensajes anteriores en ChatWithPreview
- **Solución**: Sistema de persistencia completo con localStorage y contexto de documentos
- **Estado**: Funcionando - Chat mantiene memoria entre sesiones y usa contexto de documentos

#### ✅ COMPLETADO - Contexto inteligente para generación de código
- **Problema**: El historial de chat contaminaba la generación de código causando confusión
- **Solución**: Smart Context Manager que separa contextos por tipo de request
- **Funcionalidades**: Auto-detección de intent, filtrado de documentos relevantes, límites de tokens, contexto limpio para código
- **Estado**: Funcionando - Generación de código más precisa sin interferencia del historial chat

#### 🔄 PENDIENTE - Guardado de proyectos
- **Requerimiento**: Guardar proyectos en pestaña "Proyectos"
- **Idea**: Almacenamiento local con metadata de sandbox y preview URLs
- **Estado**: Por implementar

#### 🔄 PENDIENTE - Canvas de preview interactivo
- **Requerimiento**: Canvas con múltiples pantallas, variaciones y dispositivos
- **Funcionalidades**: 
  - Generar variaciones de pantalla para mismo prompt
  - Botones: "Crear variaciones", "Editar con feedback", "Copiar prompt"
  - Zoom y vista móvil/desktop
  - Selección de pantalla específica para iteración en chat
- **Estado**: Por implementar - Alta prioridad
	    

## 📚 Referencias y Documentación

- **Claude Code SDK**: https://docs.anthropic.com/es/docs/claude-code/sdk
- **E2B Documentation**: https://e2b.dev/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

*Última actualización: 2025-07-14*