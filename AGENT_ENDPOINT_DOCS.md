# Agent Endpoint Documentation

## POST /api/agent/generate

Un endpoint completo que puede generar aplicaciones web a partir de URLs de PDF o prompts de texto, utilizando un agente inteligente que combina Gemini AI (para PDFs) y Claude 4 (para generación de código).

### Características

- ✅ **Procesamiento de PDFs desde URL**: Descarga y analiza PDFs automáticamente
- ✅ **Procesamiento de prompts de texto**: Acepta instrucciones directas
- ✅ **Generación automática de código**: Utiliza Claude 4 Sonnet para crear aplicaciones completas
- ✅ **Despliegue automático**: Crea sandbox E2B y despliega la aplicación
- ✅ **Análisis inteligente**: Extrae requerimientos estructurados de documentos
- ✅ **URL de aplicación en tiempo real**: Retorna URL funcional inmediatamente

### Endpoint

```
POST http://localhost:3001/api/agent/generate
```

### Parámetros de Request

```json
{
  // Opción 1: Usar URL de PDF
  "pdfUrl": "https://example.com/document.pdf",
  
  // Opción 2: Usar prompt directo
  "prompt": "Crear una landing page para una pizzería...",
  
  // Opcional: Framework (por defecto: "html")
  "framework": "html"
}
```

**Nota**: Debes proporcionar `pdfUrl` O `prompt`, no ambos.

### Ejemplos de Uso

#### 1. Generar app desde PDF

```json
{
  "pdfUrl": "https://docs.google.com/document/export?format=pdf&id=YOUR_DOC_ID",
  "framework": "html"
}
```

#### 2. Generar app desde prompt

```json
{
  "prompt": "Crear una aplicación de e-commerce para venta de ropa con carrito de compras, catálogo de productos y checkout. Usar colores modernos y diseño responsive.",
  "framework": "html"
}
```

### Response Format

#### Éxito (200)

```json
{
  "success": true,
  "appUrl": "https://xyz123.e2b.dev",
  "sandboxId": "sb_abc123",
  "projectName": "pizzeria-app-1234",
  "framework": "html",
  "sourceType": "pdf" | "prompt",
  "sourceData": {
    "pdfUrl": "https://example.com/doc.pdf" | null,
    "prompt": "Crear una landing page..." | null,
    "documentAnalysis": {
      "appType": "landing",
      "title": "Pizzería La Bella",
      "description": "Landing page para pizzería...",
      "features": ["menú", "galería", "contacto"],
      "uiComponents": ["navbar", "hero", "menu-cards"],
      "pages": [...]
    }
  },
  "generatedAt": "2024-01-01T12:00:00.000Z",
  "message": "Application generated successfully from agent"
}
```

#### Error (400/500)

```json
{
  "success": false,
  "error": "Either pdfUrl or prompt is required",
  "message": "Failed to generate application with agent",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Flujo de Procesamiento

1. **Validación de Input**
   - Verifica que se proporcione `pdfUrl` o `prompt`
   - Valida parámetros requeridos

2. **Procesamiento de Fuente**
   - **Si PDF**: Descarga → Analiza con Gemini → Extrae estructura → Genera prompt mejorado
   - **Si Prompt**: Usa directamente el prompt proporcionado

3. **Generación de Código**
   - Envía prompt final a Claude 4 Sonnet
   - Genera HTML/CSS/JS completo usando sistema de diseño Rappi

4. **Despliegue**
   - Crea sandbox E2B
   - Escribe archivos del proyecto
   - Inicia servidor HTTP
   - Retorna URL pública

### Casos de Uso

#### PRDs y Documentos Técnicos
```bash
curl -X POST http://localhost:3001/api/agent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "pdfUrl": "https://company.com/prd-mobile-app.pdf"
  }'
```

#### Wireframes y Mockups
```bash
curl -X POST http://localhost:3001/api/agent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "pdfUrl": "https://company.com/wireframes.pdf"
  }'
```

#### Instrucciones Directas
```bash
curl -X POST http://localhost:3001/api/agent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Crear dashboard administrativo con gráficos, tablas de datos y panel de control. Usar tema oscuro y colores azules."
  }'
```

### Tiempos de Respuesta

- **Prompt directo**: ~30-45 segundos
- **PDF simple**: ~45-60 segundos  
- **PDF complejo**: ~60-90 segundos

### Limitaciones

- **PDFs**: Máximo 50MB por archivo
- **Sandboxes**: Timeout de 5 minutos por sandbox
- **Concurrencia**: Limitado por recursos E2B
- **Tipos de archivo**: Solo PDFs para documentos

### Variables de Entorno Requeridas

```env
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
E2B_API_KEY=...
```

### Testing

Ejecuta el script de pruebas:

```bash
npx tsx test-agent-endpoint.ts
```

### Monitoreo

- Health check: `GET /health`
- Sandboxes activos: `GET /api/e2b/sandboxes`
- Logs en tiempo real en consola del servidor

### Gestión de Sandboxes

- **Creación automática**: Cada generación crea un nuevo sandbox
- **Limpieza automática**: Se limpia automáticamente en caso de error
- **Eliminación manual**: `DELETE /api/e2b/sandbox/:sandboxId`
- **Sin auto-cleanup**: Los sandboxes permanecen activos hasta eliminación manual
