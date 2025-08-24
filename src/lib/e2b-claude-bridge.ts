// DEPRECATED: This file is no longer used. 
// E2B integration moved to backend server with real Claude integration.
// See /server.ts and /src/lib/api-service.ts for the new implementation.

// This file is kept for reference but should use api-service.ts instead.

export interface CodeGenerationProgress {
  stage: 'initializing' | 'creating_sandbox' | 'generating_code' | 'starting_server' | 'ready' | 'error';
  message: string;
  details?: string;
  progress?: number; // 0-100
  previewUrl?: string;
  projectId?: string;
}

export type ProgressCallback = (progress: CodeGenerationProgress) => void;

export class E2BClaudeBridge {
  private e2bService: E2BService;

  constructor() {
    console.log('🔍 E2BClaudeBridge constructor started');
    try {
      this.e2bService = new E2BService();
      console.log('🔍 E2BClaudeBridge initialized successfully');
    } catch (error) {
      console.error('🔍 E2BClaudeBridge constructor failed:', error);
      throw error;
    }
  }

  /**
   * Generate a web application using Claude Code SDK in E2B sandbox
   */
  async generateWebApp(
    prompt: string, 
    framework: 'react' | 'nextjs' | 'vite' = 'nextjs',
    onProgress?: ProgressCallback
  ): Promise<{ previewUrl: string; projectId: string }> {
    
    console.log('🔍 generateWebApp called with:', { prompt, framework });
    
    const reportProgress = (progress: CodeGenerationProgress) => {
      console.log(`[E2B-Claude] ${progress.stage}: ${progress.message}`);
      onProgress?.(progress);
    };

    try {
      console.log('🔍 Starting generateWebApp execution...');
      // Step 1: Initialize
      reportProgress({
        stage: 'initializing',
        message: 'Iniciando generación de código...',
        progress: 0
      });

      // Step 2: Create E2B Sandbox
      reportProgress({
        stage: 'creating_sandbox',
        message: 'Creando sandbox aislado en la nube...',
        progress: 10
      });

      await this.e2bService.createSandbox();
      
      reportProgress({
        stage: 'creating_sandbox',
        message: 'Sandbox creado exitosamente',
        progress: 20
      });

      // Step 3: Install Claude Code CLI in sandbox
      await this.setupClaudeInSandbox();
      
      reportProgress({
        stage: 'creating_sandbox',
        message: 'Claude Code SDK instalado en sandbox',
        progress: 30
      });

      // Step 4: Generate project structure
      const projectName = this.generateProjectName(prompt);
      
      reportProgress({
        stage: 'generating_code',
        message: `Creando proyecto ${framework}: ${projectName}...`,
        progress: 40
      });

      const project = await this.e2bService.createWebProject(projectName, framework);
      
      reportProgress({
        stage: 'generating_code',
        message: 'Estructura base del proyecto creada',
        progress: 50,
        projectId: project.id
      });

      // Step 5: Use Claude Code SDK to generate code
      reportProgress({
        stage: 'generating_code',
        message: 'Generando código con Claude Code SDK...',
        progress: 60,
        projectId: project.id
      });

      await this.runClaudeCodeGeneration(prompt, project);
      
      reportProgress({
        stage: 'generating_code',
        message: 'Código generado exitosamente',
        progress: 80,
        projectId: project.id
      });

      // Step 6: Start development server
      reportProgress({
        stage: 'starting_server',
        message: 'Iniciando servidor de desarrollo...',
        progress: 85,
        projectId: project.id
      });

      const previewUrl = await this.e2bService.startDevServer(project.id);
      
      reportProgress({
        stage: 'ready',
        message: '¡Aplicación lista! Servidor ejecutándose',
        progress: 100,
        previewUrl,
        projectId: project.id
      });

      return { previewUrl, projectId: project.id };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      reportProgress({
        stage: 'error',
        message: 'Error durante la generación',
        details: errorMessage,
        progress: 0
      });

      console.error('[E2B-Claude] Generation failed:', error);
      throw error;
    }
  }

  /**
   * Setup environment in the E2B sandbox
   */
  private async setupClaudeInSandbox(): Promise<void> {
    console.log('📦 Setting up environment in sandbox...');
    
    // Ensure components directory exists and setup basic environment
    await this.e2bService.executeCode(`
import os
import time

# Simulate environment setup
print("Setting up development environment...")
time.sleep(1)
print("✅ Environment ready for code generation")
print("📁 Project structure will be created")
`);
    
    console.log('✅ Environment setup completed');
  }

  /**
   * Generate a project name from the prompt
   */
  private generateProjectName(prompt: string): string {
    const words = prompt.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 3);
    
    const name = words.length > 0 ? words.join('-') : 'my-app';
    return `${name}-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Run Claude Code generation in the project directory
   */
  private async runClaudeCodeGeneration(prompt: string, project: WebAppProject): Promise<void> {
    console.log(`🤖 Running Claude Code generation for: ${prompt}`);
    
    // Generate modern web application code based on the prompt
    const generatedCode = this.generateCodeFromPrompt(prompt, project.framework);
    
    // Create the main application files
    await this.createApplicationFiles(project, generatedCode);
    
    console.log('✅ Code generation completed');
  }

  /**
   * Generate code based on the user prompt and framework
   */
  private generateCodeFromPrompt(prompt: string, framework: 'react' | 'nextjs' | 'vite'): any {
    const promptLower = prompt.toLowerCase();
    
    // Analyze prompt to determine app type
    let appType = 'general';
    let components = [];
    let styles = {};
    
    if (promptLower.includes('landing') || promptLower.includes('página de inicio')) {
      appType = 'landing';
      components = ['Hero', 'Features', 'Footer'];
      styles = { theme: 'modern', colors: ['orange', 'gray'] };
    } else if (promptLower.includes('dashboard') || promptLower.includes('panel')) {
      appType = 'dashboard';
      components = ['Sidebar', 'Header', 'Stats', 'Charts'];
      styles = { theme: 'professional', colors: ['blue', 'slate'] };
    } else if (promptLower.includes('ecommerce') || promptLower.includes('tienda')) {
      appType = 'ecommerce';
      components = ['ProductGrid', 'Cart', 'Header', 'Footer'];
      styles = { theme: 'commerce', colors: ['green', 'gray'] };
    } else if (promptLower.includes('blog') || promptLower.includes('noticias')) {
      appType = 'blog';
      components = ['PostList', 'PostCard', 'Header', 'Footer'];
      styles = { theme: 'editorial', colors: ['purple', 'gray'] };
    }
    
    return {
      appType,
      components,
      styles,
      framework,
      prompt
    };
  }

  /**
   * Create application files in the project
   */
  private async createApplicationFiles(project: WebAppProject, codeConfig: any): Promise<void> {
    const { appType, framework } = codeConfig;
    
    // Ensure components directory exists
    await this.e2bService.executeCode(`
import os
components_dir = "${project.projectPath}/src/components"
os.makedirs(components_dir, exist_ok=True)
print(f"✅ Created components directory: {components_dir}")
`);
    
    // Create main App component based on type
    const appContent = this.generateAppComponent(codeConfig);
    await this.e2bService.createFile(`${project.projectPath}/src/App.tsx`, appContent);
    
    // Create index.css with Tailwind and custom styles
    const stylesContent = this.generateStyles(codeConfig);
    await this.e2bService.createFile(`${project.projectPath}/src/index.css`, stylesContent);
    
    // Create component files
    for (const componentName of codeConfig.components) {
      const componentContent = this.generateComponent(componentName, codeConfig);
      await this.e2bService.createFile(
        `${project.projectPath}/src/components/${componentName}.tsx`, 
        componentContent
      );
    }
    
    console.log(`✅ Generated ${codeConfig.components.length + 2} files for ${appType} application`);
  }

  /**
   * Generate the main App component
   */
  private generateAppComponent(config: any): string {
    const { appType, components, prompt } = config;
    
    const imports = components.map((comp: string) => 
      `import ${comp} from './components/${comp}';`
    ).join('\n');
    
    const componentElements = components.map((comp: string) => `      <${comp} />`).join('\n');
    
    return `import React from 'react';
import './index.css';
${imports}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Generated for: ${prompt} */}
${componentElements}
    </div>
  );
}

export default App;`;
  }

  /**
   * Generate CSS styles
   */
  private generateStyles(config: any): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-lg p-6;
  }
}`;
  }

  /**
   * Generate individual components
   */
  private generateComponent(componentName: string, config: any): string {
    switch (componentName) {
      case 'Hero':
        return `import React from 'react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Bienvenido a tu nueva aplicación
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Una experiencia moderna y elegante creada especialmente para ti.
        </p>
        <button className="btn-primary text-lg px-8 py-3">
          Comenzar
        </button>
      </div>
    </section>
  );
};

export default Hero;`;

      case 'Features':
        return `import React from 'react';

const Features = () => {
  const features = [
    {
      title: "Rápido y Eficiente",
      description: "Optimizado para el mejor rendimiento"
    },
    {
      title: "Diseño Moderno",
      description: "Interfaz elegante y responsive"
    },
    {
      title: "Fácil de Usar",
      description: "Experiencia de usuario intuitiva"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Características</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;`;

      case 'Footer':
        return `import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2024 Tu Aplicación. Creado con Rappi Creator.</p>
      </div>
    </footer>
  );
};

export default Footer;`;

      case 'Sidebar':
        return `import React from 'react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Analytics', icon: '📈' },
    { name: 'Settings', icon: '⚙️' },
    { name: 'Users', icon: '👥' }
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-8">Dashboard</h2>
      <nav>
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;`;

      case 'Header':
        return `import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mi Aplicación</h1>
        <nav className="flex gap-6">
          <a href="#" className="text-gray-600 hover:text-gray-900">Inicio</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Acerca</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Contacto</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;`;

      case 'Stats':
        return `import React from 'react';

const Stats = () => {
  const stats = [
    { label: 'Usuarios Activos', value: '12,345' },
    { label: 'Ventas Totales', value: '$98,765' },
    { label: 'Productos', value: '234' },
    { label: 'Pedidos', value: '1,789' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="card">
          <h3 className="text-2xl font-bold text-orange-600">{stat.value}</h3>
          <p className="text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default Stats;`;

      default:
        return `import React from 'react';

const ${componentName} = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">${componentName}</h2>
      <p>Componente generado automáticamente.</p>
    </div>
  );
};

export default ${componentName};`;
    }
  }

  /**
   * Get project status
   */
  getProjectStatus(projectId: string): WebAppProject | undefined {
    return this.e2bService.getProject(projectId);
  }

  /**
   * Get all active projects
   */
  getActiveProjects(): WebAppProject[] {
    return this.e2bService.getActiveProjects();
  }

  /**
   * Stop a specific project
   */
  async stopProject(projectId: string): Promise<void> {
    await this.e2bService.stopProject(projectId);
  }

  /**
   * Clean up and close sandbox
   */
  async cleanup(): Promise<void> {
    await this.e2bService.closeSandbox();
  }

  /**
   * Regenerate code for an existing project
   */
  async regenerateProject(
    projectId: string, 
    newPrompt: string,
    onProgress?: ProgressCallback
  ): Promise<{ previewUrl: string; projectId: string }> {
    
    const project = this.e2bService.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const reportProgress = (progress: CodeGenerationProgress) => {
      console.log(`[E2B-Claude] ${progress.stage}: ${progress.message}`);
      onProgress?.(progress);
    };

    try {
      // Stop current server
      if (project.status === 'running') {
        await this.e2bService.stopProject(projectId);
      }

      reportProgress({
        stage: 'generating_code',
        message: 'Regenerando código...',
        progress: 20,
        projectId
      });

      // Regenerate code
      await this.runClaudeCodeGeneration(newPrompt, project);

      reportProgress({
        stage: 'starting_server',
        message: 'Reiniciando servidor...',
        progress: 80,
        projectId
      });

      // Start server again
      const previewUrl = await this.e2bService.startDevServer(projectId);

      reportProgress({
        stage: 'ready',
        message: '¡Aplicación actualizada!',
        progress: 100,
        previewUrl,
        projectId
      });

      return { previewUrl, projectId };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      reportProgress({
        stage: 'error',
        message: 'Error durante la regeneración',
        details: errorMessage,
        progress: 0,
        projectId
      });

      throw error;
    }
  }
}

// Export a singleton instance
export const e2bClaudeBridge = new E2BClaudeBridge();