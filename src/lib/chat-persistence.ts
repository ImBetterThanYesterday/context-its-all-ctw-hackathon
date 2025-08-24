// Chat persistence service for maintaining conversation history and document context
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: FileAttachment[];
  isGenerating?: boolean;
  previewUrl?: string;
  projectId?: string;
  documentContext?: DocumentContext[];
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  data?: string; // base64 data
}

export interface DocumentContext {
  documentId: string;
  fileName: string;
  extractedData: any;
  processed: boolean;
  timestamp: Date;
  mimeType: string;
}

export interface ChatSession {
  sessionId: string;
  sandboxId?: string;
  messages: ChatMessage[];
  documents: DocumentContext[];
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

class ChatPersistenceService {
  private currentSession: ChatSession | null = null;
  private readonly STORAGE_KEY = 'rappi_creator_chat_session';
  private readonly MAX_SESSIONS_STORED = 10;

  constructor() {
    this.initializeSession();
    this.cleanupOldSessions();
  }

  // Initialize or restore current session
  private initializeSession() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        // Convert date strings back to Date objects
        session.createdAt = new Date(session.createdAt);
        session.lastActivity = new Date(session.lastActivity);
        session.messages = session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        session.documents = session.documents.map((doc: any) => ({
          ...doc,
          timestamp: new Date(doc.timestamp)
        }));

        // Check if session is recent (within 24 hours)
        const hoursOld = (Date.now() - session.lastActivity.getTime()) / (1000 * 60 * 60);
        if (hoursOld < 24 && session.isActive) {
          this.currentSession = session;
          console.log('🔄 Restored chat session:', session.sessionId);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to restore session:', error);
    }

    // Create new session
    this.createNewSession();
  }

  // Create a new chat session
  createNewSession(): ChatSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      messages: [],
      documents: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true
    };

    this.saveSession();
    console.log('🆕 Created new chat session:', sessionId);
    return this.currentSession;
  }

  // Get current session
  getCurrentSession(): ChatSession {
    if (!this.currentSession) {
      return this.createNewSession();
    }
    return this.currentSession;
  }

  // Add message to current session
  addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const session = this.getCurrentSession();
    
    const fullMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    session.messages.push(fullMessage);
    session.lastActivity = new Date();
    
    this.saveSession();
    console.log('💬 Added message to session:', fullMessage.id);
    
    return fullMessage;
  }

  // Update message in current session
  updateMessage(messageId: string, updates: Partial<ChatMessage>): boolean {
    const session = this.getCurrentSession();
    const messageIndex = session.messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      console.warn('Message not found for update:', messageId);
      return false;
    }

    session.messages[messageIndex] = {
      ...session.messages[messageIndex],
      ...updates,
      id: messageId // Ensure ID doesn't change
    };

    session.lastActivity = new Date();
    this.saveSession();
    
    console.log('✏️ Updated message:', messageId);
    return true;
  }

  // Add document context to session
  addDocumentContext(document: Omit<DocumentContext, 'timestamp'>): DocumentContext {
    const session = this.getCurrentSession();
    
    const fullDocument: DocumentContext = {
      ...document,
      timestamp: new Date()
    };

    // Remove any existing document with same ID
    session.documents = session.documents.filter(doc => doc.documentId !== document.documentId);
    session.documents.push(fullDocument);
    
    session.lastActivity = new Date();
    this.saveSession();
    
    console.log('📄 Added document context:', fullDocument.documentId);
    return fullDocument;
  }

  // Get all document contexts for current session
  getDocumentContexts(): DocumentContext[] {
    const session = this.getCurrentSession();
    return session.documents;
  }

  // Get formatted context for Claude
  getFormattedContextForClaude(): string {
    const session = this.getCurrentSession();
    
    let context = '';

    // Add document contexts
    if (session.documents.length > 0) {
      context += '\n# Contexto de Documentos Analizados\n\n';
      
      session.documents.forEach(doc => {
        if (doc.processed && doc.extractedData) {
          context += `## ${doc.fileName}\n`;
          context += this.formatDocumentDataForClaude(doc.extractedData);
          context += '\n---\n\n';
        }
      });
    }

    // Add recent message history (last 5 messages)
    const recentMessages = session.messages.slice(-5);
    if (recentMessages.length > 0) {
      context += '\n# Historial de Conversación Reciente\n\n';
      
      recentMessages.forEach(msg => {
        const role = msg.role === 'user' ? 'Usuario' : 'Asistente';
        context += `**${role}**: ${msg.content}\n\n`;
      });
    }

    return context;
  }

  // Format document data for Claude
  private formatDocumentDataForClaude(extractedData: any): string {
    if (!extractedData) return '';

    let formatted = '';

    if (extractedData.title) {
      formatted += `**Título**: ${extractedData.title}\n\n`;
    }

    if (extractedData.summary) {
      formatted += `**Resumen**: ${extractedData.summary}\n\n`;
    }

    if (extractedData.requirements && extractedData.requirements.length > 0) {
      formatted += `**Requisitos**:\n`;
      extractedData.requirements.forEach((req: string) => {
        formatted += `- ${req}\n`;
      });
      formatted += '\n';
    }

    if (extractedData.features && extractedData.features.length > 0) {
      formatted += `**Funcionalidades**:\n`;
      extractedData.features.forEach((feature: any) => {
        formatted += `- **${feature.name}**: ${feature.description}\n`;
      });
      formatted += '\n';
    }

    if (extractedData.userFlows && extractedData.userFlows.length > 0) {
      formatted += `**Flujos de Usuario**:\n`;
      extractedData.userFlows.forEach((flow: any) => {
        formatted += `- **${flow.name}**: ${flow.steps.join(' → ')}\n`;
      });
      formatted += '\n';
    }

    return formatted;
  }

  // Associate session with sandbox
  setSandboxId(sandboxId: string) {
    const session = this.getCurrentSession();
    session.sandboxId = sandboxId;
    session.lastActivity = new Date();
    this.saveSession();
    
    console.log('🔗 Associated session with sandbox:', sandboxId);
  }

  // Get sandbox ID for current session
  getSandboxId(): string | undefined {
    return this.getCurrentSession().sandboxId;
  }

  // End current session (when sandbox is destroyed)
  endSession() {
    if (this.currentSession) {
      this.currentSession.isActive = false;
      this.currentSession.lastActivity = new Date();
      this.saveSession();
      
      console.log('🔚 Ended chat session:', this.currentSession.sessionId);
      this.currentSession = null;
    }
  }

  // Get all messages for current session
  getMessages(): ChatMessage[] {
    return this.getCurrentSession().messages;
  }

  // Clear current session and start fresh
  clearSession() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentSession = null;
    this.createNewSession();
    
    console.log('🧹 Cleared chat session');
  }

  // Save session to localStorage
  private saveSession() {
    if (this.currentSession) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentSession));
      } catch (error) {
        console.error('Failed to save session:', error);
        // If localStorage is full, clear old data and try again
        this.cleanupOldSessions();
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentSession));
        } catch (retryError) {
          console.error('Failed to save session after cleanup:', retryError);
        }
      }
    }
  }

  // Clean up old sessions to prevent localStorage bloat
  private cleanupOldSessions() {
    try {
      // This is a simple implementation - in a real app you might want
      // to store multiple sessions and clean up only the oldest ones
      const keys = Object.keys(localStorage);
      const sessionKeys = keys.filter(key => key.startsWith('rappi_creator_chat_session_old_'));
      
      // Remove excess old sessions
      if (sessionKeys.length > this.MAX_SESSIONS_STORED) {
        const toRemove = sessionKeys.slice(0, sessionKeys.length - this.MAX_SESSIONS_STORED);
        toRemove.forEach(key => localStorage.removeItem(key));
        console.log(`🧹 Cleaned up ${toRemove.length} old sessions`);
      }
    } catch (error) {
      console.warn('Failed to cleanup old sessions:', error);
    }
  }

  // Export session for backup/debugging
  exportSession(): string {
    return JSON.stringify(this.getCurrentSession(), null, 2);
  }

  // Import session from backup
  importSession(sessionData: string): boolean {
    try {
      const session = JSON.parse(sessionData);
      // Validate session structure
      if (session.sessionId && session.messages && Array.isArray(session.messages)) {
        this.currentSession = session;
        this.saveSession();
        console.log('📥 Imported session:', session.sessionId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import session:', error);
      return false;
    }
  }
}

// Singleton instance
const chatPersistence = new ChatPersistenceService();

export default chatPersistence;