# Configuración de API - Context is all

## Descripción General

Hemos centralizado todas las URLs del backend en un archivo de configuración para facilitar el cambio de servidor o despliegue en diferentes entornos.

## Archivo de Configuración

### Ubicación
`src/config/api-config.ts`

### Características
- **Configuración centralizada**: Todas las URLs de API en un solo lugar
- **Soporte para variables de entorno**: Usa `VITE_API_BASE_URL` para configurar la URL base
- **Endpoints tipados**: TypeScript interfaces para mejor desarrollo
- **Flexibilidad**: Fácil cambio entre entornos (desarrollo, staging, producción)

## Configuración de Variables de Entorno

### Frontend (.env)
```bash
# Override the default backend API URL (opcional)
# Por defecto: http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001

# Para producción podrías usar:
# VITE_API_BASE_URL=https://your-api-domain.com
```

### Backend (.env)
```bash
# E2B Sandbox API Key (requerido para backend)
E2B_API_KEY=your_e2b_api_key_here

# Claude/Anthropic API Key (requerido para backend)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google Gemini API Key (requerido para backend)
GEMINI_API_KEY=your_gemini_api_key_here
```

## Uso Programático

### Importar configuración
```typescript
import { apiConfig, buildApiUrl, API_BASE_URL } from '@/config/api-config'
```

### Usar endpoints
```typescript
// Método recomendado: usar buildApiUrl
const healthUrl = buildApiUrl(apiConfig.endpoints.health)
// Resultado: "http://localhost:3001/health"

// Acceso directo a la URL base
console.log(API_BASE_URL) // "http://localhost:3001"

// Uso con fetch
const response = await fetch(buildApiUrl(apiConfig.endpoints.e2b.generate), {
  method: 'POST',
  // ...
})
```

### Cambiar URL base en tiempo de ejecución
```typescript
import { updateApiBaseUrl } from '@/config/api-config'

// Útil para testing o desarrollo
updateApiBaseUrl('http://localhost:4000')
```

## Estructura de Endpoints

```typescript
apiConfig.endpoints = {
  health: '/health',
  chat: '/api/chat',
  analyzeDocument: '/api/analyze-document',
  e2b: {
    generate: '/api/e2b/generate',
    sandbox: '/api/e2b/sandbox',
    sandboxes: '/api/e2b/sandboxes',
    modify: (sandboxId: string) => `/api/e2b/modify/${sandboxId}`,
    delete: (sandboxId: string) => `/api/e2b/sandbox/${sandboxId}`
  },
  gemini: {
    processDocument: '/api/gemini/process-document',
    chat: '/api/gemini/chat'
  },
  agent: {
    generate: '/api/agent/generate'
  }
}
```

## Migración Realizada

### Archivos Actualizados
- ✅ `src/lib/api-service.ts` - Servicio principal de API
- ✅ `src/lib/claude-sdk.ts` - SDK de Claude
- ✅ `src/components/DocumentAnalysis.tsx` - Componente de análisis

### Cambios Realizados
1. **Eliminadas URLs hardcodeadas**: No más `http://localhost:3001` en el código
2. **Centralizaci usando configuración**: Todas las URLs vienen de `api-config.ts`
3. **Mensajes de error dinámicos**: Los errores de conexión muestran la URL configurada actual
4. **Soporte para variables de entorno**: Se puede cambiar la URL con `VITE_API_BASE_URL`

## Ejemplos de Configuración por Entorno

### Desarrollo Local
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3001
```

### Staging
```bash
# .env.staging
VITE_API_BASE_URL=https://api-staging.yourdomain.com
```

### Producción
```bash
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Beneficios

1. **Mantenimiento fácil**: Cambiar URL del backend en un solo lugar
2. **Flexibilidad de despliegue**: Fácil configuración para diferentes entornos
3. **Mejor experiencia de desarrollo**: No más búsqueda y reemplazo de URLs
4. **Type safety**: TypeScript garantiza que uses endpoints válidos
5. **Debugging mejorado**: Los errores muestran la URL configurada actual

## Notas Importantes

- La variable `VITE_API_BASE_URL` debe comenzar con `VITE_` para ser accesible en el frontend
- Si no se configura la variable de entorno, se usa `http://localhost:3001` por defecto
- Los cambios en variables de entorno requieren reiniciar el servidor de desarrollo
- Para testing, puedes usar `updateApiBaseUrl()` para cambiar la URL temporalmente
