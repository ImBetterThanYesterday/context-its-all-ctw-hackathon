// DEPRECATED: This file is no longer used. E2B integration moved to backend server.
// See /server.ts and /src/lib/api-service.ts for the new implementation.

// Keeping this file for reference but it should not be used in browser environment.
// E2B SDK is designed for Node.js server environments, not browser environments.

export interface E2BSandboxResult {
  stdout: string;
  stderr: string;
  error?: {
    name: string;
    value: string;
    traceback: string;
  };
  results: Array<{
    text?: string;
    png?: string;
    html?: string;
    json?: any;
  }>;
}

export interface WebAppProject {
  id: string;
  name: string;
  framework: 'react' | 'nextjs' | 'vite';
  port: number;
  status: 'creating' | 'installing' | 'starting' | 'running' | 'error' | 'stopped';
  previewUrl?: string;
  projectPath: string;
}

export class E2BService {
  private sandbox: Sandbox | null = null;
  private apiKey: string;
  private activeProjects: Map<string, WebAppProject> = new Map();

  constructor() {
    console.log('🔍 E2BService constructor - checking environment variables');
    console.log('🔍 Available env vars:', Object.keys(import.meta.env));
    console.log('🔍 VITE_E2B_API_KEY exists:', !!import.meta.env.VITE_E2B_API_KEY);
    
    this.apiKey = import.meta.env.VITE_E2B_API_KEY || '';
    console.log('🔍 API Key length:', this.apiKey.length);
    console.log('🔍 API Key prefix:', this.apiKey.substring(0, 10) + '...');
    
    if (!this.apiKey) {
      console.error('🔍 Missing VITE_E2B_API_KEY environment variable');
      throw new Error('VITE_E2B_API_KEY environment variable is required');
    }
    
    console.log('🔍 E2BService initialized successfully');
  }

  /**
   * Create a new E2B sandbox
   */
  async createSandbox(): Promise<void> {
    try {
      console.log('🚀 Creating E2B sandbox...');
      console.log('🔍 Using API key prefix:', this.apiKey.substring(0, 10) + '...');
      console.log('🔍 Calling Sandbox.create with config:', { apiKey: this.apiKey.substring(0, 10) + '...' });
      
      this.sandbox = await Sandbox.create({ 
        apiKey: this.apiKey 
      });
      
      console.log('✅ E2B sandbox created successfully');
      console.log(`📦 Sandbox ID: ${this.sandbox.id}`);
      console.log('🔍 Sandbox object:', this.sandbox);
    } catch (error) {
      console.error('❌ Failed to create E2B sandbox - DETAILED ERROR:');
      console.error('🔍 Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🔍 Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('🔍 Error object:', error);
      console.error('🔍 Error type:', typeof error);
      console.error('🔍 Error constructor:', error?.constructor?.name);
      
      // Re-throw with more context
      throw new Error(`E2B Sandbox creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute code in the sandbox
   */
  async executeCode(code: string): Promise<E2BSandboxResult> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized. Call createSandbox() first.');
    }

    try {
      console.log('🔧 Executing code in sandbox...');
      console.log('Code:', code);
      
      const execution = await this.sandbox.runCode(code);
      
      const result: E2BSandboxResult = {
        stdout: execution.stdout || '',
        stderr: execution.stderr || '',
        results: execution.results || [],
      };

      if (execution.error) {
        result.error = {
          name: execution.error.name,
          value: execution.error.value,
          traceback: execution.error.traceback,
        };
        console.error('❌ Code execution error:', result.error);
      } else {
        console.log('✅ Code executed successfully');
        if (result.stdout) console.log('📝 Stdout:', result.stdout);
        if (result.stderr) console.log('⚠️ Stderr:', result.stderr);
      }

      return result;
    } catch (error) {
      console.error('❌ Failed to execute code:', error);
      throw error;
    }
  }

  /**
   * Install npm packages in the sandbox
   */
  async installPackages(packages: string[]): Promise<void> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized. Call createSandbox() first.');
    }

    try {
      console.log('📦 Installing packages:', packages.join(', '));
      const installCommand = `npm install ${packages.join(' ')}`;
      const result = await this.sandbox.commands.run(installCommand);
      
      if (result.exitCode === 0) {
        console.log('✅ Packages installed successfully');
      } else {
        console.error('❌ Package installation failed:', result.stderr);
        throw new Error(`Package installation failed: ${result.stderr}`);
      }
    } catch (error) {
      console.error('❌ Failed to install packages:', error);
      throw error;
    }
  }

  /**
   * Create a file in the sandbox
   */
  async createFile(path: string, content: string): Promise<void> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized. Call createSandbox() first.');
    }

    try {
      console.log(`📄 Creating file: ${path}`);
      await this.sandbox.files.write(path, content);
      console.log('✅ File created successfully');
    } catch (error) {
      console.error('❌ Failed to create file:', error);
      throw error;
    }
  }

  /**
   * List files in the sandbox
   */
  async listFiles(path: string = '/home/user'): Promise<string[]> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized. Call createSandbox() first.');
    }

    try {
      console.log(`📁 Listing files in: ${path}`);
      const files = await this.sandbox.files.list(path);
      console.log('Files:', files.map(f => f.name));
      return files.map(f => f.name);
    } catch (error) {
      console.error('❌ Failed to list files:', error);
      throw error;
    }
  }

  /**
   * Get sandbox information
   */
  getSandboxInfo(): { id: string | null; isActive: boolean } {
    return {
      id: this.sandbox?.id || null,
      isActive: this.sandbox !== null,
    };
  }

  /**
   * Create a React/Next.js project in the sandbox
   */
  async createWebProject(projectName: string, framework: 'react' | 'nextjs' | 'vite'): Promise<WebAppProject> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized. Call createSandbox() first.');
    }

    const projectId = `${projectName}-${Date.now()}`;
    const projectPath = `/home/user/${projectName}`;
    
    const project: WebAppProject = {
      id: projectId,
      name: projectName,
      framework,
      port: 3000, // Default port, will be updated
      status: 'creating',
      projectPath,
    };

    this.activeProjects.set(projectId, project);

    try {
      console.log(`🚀 Creating ${framework} project: ${projectName}`);
      
      let createCommand: string;
      switch (framework) {
        case 'nextjs':
          createCommand = `npx create-next-app@latest ${projectName} --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"`;
          break;
        case 'vite':
          createCommand = `npm create vite@latest ${projectName} -- --template react-ts`;
          break;
        case 'react':
        default:
          createCommand = `npx create-react-app ${projectName} --template typescript`;
          break;
      }

      const result = await this.sandbox.commands.run(createCommand, { workdir: '/home/user' });
      
      if (result.exitCode !== 0) {
        project.status = 'error';
        throw new Error(`Failed to create project: ${result.stderr}`);
      }

      console.log('✅ Project created successfully');
      project.status = 'installing';
      
      return project;
    } catch (error) {
      project.status = 'error';
      console.error('❌ Failed to create web project:', error);
      throw error;
    }
  }

  /**
   * Install dependencies and start development server
   */
  async startDevServer(projectId: string): Promise<string> {
    const project = this.activeProjects.get(projectId);
    if (!project || !this.sandbox) {
      throw new Error('Project not found or sandbox not initialized.');
    }

    try {
      console.log(`📦 Installing dependencies for ${project.name}...`);
      project.status = 'installing';
      
      // Install dependencies
      const installResult = await this.sandbox.commands.run('npm install', { 
        workdir: project.projectPath 
      });
      
      if (installResult.exitCode !== 0) {
        project.status = 'error';
        throw new Error(`Failed to install dependencies: ${installResult.stderr}`);
      }

      console.log(`🔧 Starting development server for ${project.name}...`);
      project.status = 'starting';

      // Find available port
      const availablePort = await this.findAvailablePort();
      project.port = availablePort;

      // Start development server in background
      let startCommand: string;
      switch (project.framework) {
        case 'nextjs':
          startCommand = `npm run dev -- --port ${availablePort}`;
          break;
        case 'vite':
          startCommand = `npm run dev -- --port ${availablePort} --host 0.0.0.0`;
          break;
        case 'react':
        default:
          startCommand = `PORT=${availablePort} npm start`;
          break;
      }

      // Start server in background
      this.sandbox.commands.run(startCommand, { 
        workdir: project.projectPath,
        background: true 
      });

      // Wait for server to be ready
      await this.waitForServerReady(availablePort);
      
      project.status = 'running';
      project.previewUrl = `https://${this.sandbox.getHost()}:${availablePort}`;
      
      console.log(`✅ Development server running at: ${project.previewUrl}`);
      return project.previewUrl;
      
    } catch (error) {
      project.status = 'error';
      console.error('❌ Failed to start development server:', error);
      throw error;
    }
  }

  /**
   * Find an available port in the sandbox
   */
  private async findAvailablePort(): Promise<number> {
    const startPort = 3000;
    const maxPort = 3010;
    
    for (let port = startPort; port <= maxPort; port++) {
      try {
        const result = await this.sandbox!.commands.run(`netstat -tuln | grep :${port}`);
        if (result.exitCode !== 0) {
          // Port is available
          return port;
        }
      } catch {
        // Port is available
        return port;
      }
    }
    
    throw new Error('No available ports found');
  }

  /**
   * Wait for development server to be ready
   */
  private async waitForServerReady(port: number, maxAttempts: number = 30): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await this.sandbox!.commands.run(`curl -f http://localhost:${port} || echo "not ready"`);
        if (result.stdout.includes('not ready')) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        return; // Server is ready
      } catch {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('Development server failed to start within timeout');
  }

  /**
   * Get project by ID
   */
  getProject(projectId: string): WebAppProject | undefined {
    return this.activeProjects.get(projectId);
  }

  /**
   * Get all active projects
   */
  getActiveProjects(): WebAppProject[] {
    return Array.from(this.activeProjects.values());
  }

  /**
   * Stop a project's development server
   */
  async stopProject(projectId: string): Promise<void> {
    const project = this.activeProjects.get(projectId);
    if (!project || !this.sandbox) {
      throw new Error('Project not found or sandbox not initialized.');
    }

    try {
      console.log(`🛑 Stopping project: ${project.name}`);
      
      // Kill processes on the project's port
      await this.sandbox.commands.run(`pkill -f "port ${project.port}"`);
      
      project.status = 'stopped';
      project.previewUrl = undefined;
      
      console.log('✅ Project stopped successfully');
    } catch (error) {
      console.error('❌ Failed to stop project:', error);
      throw error;
    }
  }

  /**
   * Close the sandbox
   */
  async closeSandbox(): Promise<void> {
    if (this.sandbox) {
      try {
        console.log('🔥 Closing E2B sandbox...');
        
        // Stop all active projects
        for (const project of this.activeProjects.values()) {
          if (project.status === 'running') {
            await this.stopProject(project.id);
          }
        }
        
        await this.sandbox.kill();
        this.sandbox = null;
        this.activeProjects.clear();
        
        console.log('✅ Sandbox closed successfully');
      } catch (error) {
        console.error('❌ Failed to close sandbox:', error);
        throw error;
      }
    }
  }
}

// Export a singleton instance for easy use
export const e2bService = new E2BService();