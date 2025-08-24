¡Entendido! Mis disculpas por la confusión. El nombre "Context is all" es excelente y refleja muy bien la capacidad del sistema.

Aquí tienes el README.md actualizado, completamente renombrado y ajustado a "Context is all".

🎨 Context is all: De PRD a Interfaz Funcional con IA

Context is all es una plataforma de desarrollo de IU de vanguardia diseñada para revolucionar el flujo de trabajo de producto a desarrollo. Transforma tus Documentos de Requisitos de Producto (PRD), incluyendo PDFs y wireframes, en interfaces web completamente funcionales y estilizadas utilizando el poder combinado de las APIs de Claude y Gemini, todo dentro de un entorno de ejecución de código seguro y aislado gracias a E2B.

Su nombre, "Context is all", refleja su capacidad para utilizar inteligentemente el contexto completo de un proyecto —documentos, historial de chat y guías de diseño— para generar resultados de alta fidelidad.


✨ Características Principales

🤖 Generación de UI por IA: Describe tu interfaz o sube un documento y observa cómo la IA construye tu aplicación en tiempo real.

📄 Análisis Inteligente de Documentos: Soporte para múltiples formatos (PDF, JPG, PNG, GIF) gracias a la API de Gemini para una extracción de requisitos estructurada y precisa.

⚡ Sandboxing con E2B: Cada aplicación se genera y ejecuta en un entorno de sandbox seguro y aislado, proporcionando una URL de vista previa en vivo.

🧠 Integración Dual de IA: Aprovecha Claude 4 Sonnet para una generación de código robusta y Gemini 2.0 Flash para un análisis de documentos y chat conversacional de última generación.

🔮 Gestión de Contexto Inteligente: Un sistema avanzado de 128K tokens que detecta la intención del usuario (generación de código vs. chat), gestiona el historial de conversación y utiliza el contexto de los documentos analizados para obtener resultados de alta precisión.

🎨 Sistema de Diseño Detallado: El código generado puede seguir un sistema de diseño increíblemente específico. El proyecto viene pre-configurado con una réplica del sistema de diseño de Rappi como una potente demostración de su precisión.

💬 Interfaz de Chat Inmersiva: Una interfaz de chat estilo "Lovable" con vista previa en vivo, temas claro/oscuro y persistencia de sesión.

🚀 Arquitectura Optimizada: El backend maneja toda la lógica pesada con las APIs de IA y E2B, mientras que el frontend (React/Vite) ofrece una experiencia de usuario fluida y rápida.

🛠️ Stack Tecnológico
Área	Tecnología
Frontend	React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, React Router
Backend	Node.js, Express, TypeScript, tsx
IA y Servicios	Anthropic Claude 4 Sonnet, Google Gemini 2.0 Flash, E2B Code Interpreter
Herramientas	ESLint, Prettier, Concurrently, Vite
🏗️ Arquitectura del Sistema

El flujo de trabajo está diseñado para ser seguro y eficiente, separando las preocupaciones entre el cliente y el servidor.

Usuario (Frontend en localhost:8081): El usuario interactúa con la interfaz de chat, sube un PRD o describe la aplicación que desea crear.

Servidor (Backend en localhost:3001):

Recibe la solicitud del frontend.

Si se sube un archivo, lo procesa con la API de Gemini para extraer datos estructurados.

Construye un prompt optimizado utilizando el Smart Context Manager.

Llama a la API de Claude para generar el código HTML basado en el detallado sistema de diseño configurado.

Crea un Sandbox de E2B seguro en la nube.

Escribe los archivos generados en el sandbox.

Inicia un servidor web de Python dentro del sandbox.

URL de Vista Previa (E2B): El backend devuelve una URL de vista previa segura.

Usuario (Frontend): La URL se carga en un iframe en el panel de vista previa, mostrando la aplicación funcional en tiempo real.

🚀 Empezando

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

Prerrequisitos

Node.js (v18 o superior)

npm o un gestor de paquetes compatible

1. Clonar el Repositorio
code
Bash
download
content_copy
expand_less

git clone https://github.com/tu-usuario/imbetterthanyesterday-context-its-all-ctw-hackathon.git
cd imbetterthanyesterday-context-its-all-ctw-hackathon
2. Instalar Dependencias

Este proyecto utiliza un único package.json para las dependencias del frontend y del backend.

code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
npm install
3. Configurar Variables de Entorno

Crea un archivo .env en la raíz del proyecto copiando el ejemplo:

code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
cp .env.example .env

Abre el archivo .env y añade tus claves de API. Estas son requeridas para que el backend funcione.

code
Code
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
# .env
E2B_API_KEY=tu_clave_api_de_e2b
ANTHROPIC_API_KEY=tu_clave_api_de_anthropic
GEMINI_API_KEY=tu_clave_api_de_google_gemini
💻 Uso y Comandos

Puedes ejecutar el servidor de backend y el cliente de desarrollo de frontend por separado o juntos con un solo comando.

Ejecutar el Backend y Frontend simultáneamente (Recomendado)
code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
npm run dev:full

El servidor de la API estará disponible en http://localhost:3001.

La aplicación frontend estará disponible en http://localhost:8081.

Ejecutar solo el Servidor de Backend
code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
npm run server
Ejecutar solo el Cliente de Frontend
code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
npm run dev
🔌 Endpoints de la API del Backend

El servidor de Express expone los siguientes endpoints:

Método	Ruta	Descripción

├── public/                  # Archivos estáticos
├── src/                     # Código fuente de la aplicación Frontend
│   ├── components/          # Componentes de React
│   │   ├── UXForgeDashboard.tsx  # Dashboard principal
│   │   ├── LovableChatInterface.tsx # Componente central de chat con IA
│   │   └── ui/              # Componentes de shadcn/ui
│   ├── contexts/            # React Contexts (Auth, Theme)
│   ├── lib/                 # Lógica de negocio y servicios
│   │   ├── api-service.ts   # Cliente para la API del backend
│   │   ├── smart-context-manager.ts # Lógica de contexto de IA
│   │   └── chat-persistence.ts # Manejo de la sesión de chat
│   └── pages/               # Páginas de la aplicación (Login, Dashboard)
├── server.ts                # Servidor de Backend (Node.js/Express)
├── package.json             # Dependencias y scripts
└── README.md                # Este archivo
🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un "issue" para discutir cambios importantes antes de realizar un "pull request".

📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
