- Rappi Creator: Lovable-style chat interface with Claude Code SDK integration
- Modern React/TypeScript application with shadcn/ui components  
- Features: Document analysis, design system config, screen detection, and AI chat
- Claude Code SDK integrated for real-time code generation through chat interface

# Project Structure
- `src/components/LovableChatInterface.tsx` - Main chat interface (Lovable-style with dark/light theme)
- `src/components/ChatWithPreview.tsx` - Split layout: chat + preview with theme toggle
- `src/components/UXForgeDashboard.tsx` - Main dashboard with navigation
- `src/contexts/ThemeContext.tsx` - Theme management (light/dark mode)
- `src/lib/claude-sdk.ts` - Claude Code SDK integration
- `src/lib/e2b-service.ts` - E2B Sandbox service for isolated code execution
- `src/components/ui/` - Complete shadcn/ui component library
- Uses Rappi branding colors and gradients

# Development Commands
- `npm run dev` - Start frontend development server (port 8081)
- `npm run server` - Start backend API server (port 3001) 
- `npm run dev:full` - Start both frontend and backend concurrently
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npx tsx test-e2b-basic.ts` - Test basic E2B functionality (server-side)
- `npx tsx test-api-integration.ts` - Test complete API integration

# Backend API Endpoints (Claude 4 + E2B + Gemini Optimized)
- `POST /api/chat` - Real Claude 4 Sonnet chat responses with context persistence
- `POST /api/analyze-document` - Analyze PRD documents with Claude 4 Sonnet
- `POST /api/gemini/process-document` - **NEW** Process PDFs/images with Gemini API
- `POST /api/e2b/generate` - **OPTIMIZED** Generate web apps using E2B (90% faster)
- `GET /health` - Health check endpoint with sandbox count
- `GET /api/e2b/sandboxes` - List active sandboxes with metadata
- `DELETE /api/e2b/sandbox/:id` - Terminate specific sandbox

# E2B Optimizations Implemented ✅ WORKING
- **Simplified Architecture**: No complex npm installs, direct HTML + React CDN
- **Python HTTP Server**: Simple, reliable server using built-in Python
- **Batch File Operations**: Write multiple files in single E2B call
- **Streaming Logs**: Real-time command output with `onStdout/onStderr`
- **Optimized Timeouts**: 5-minute sandbox (E2B standard), 2-second startup
- **Background Process Management**: Proper dev server handling
- **Automatic Cleanup**: Remove sandboxes older than 10 minutes
- **Enhanced Error Handling**: Detailed logging and recovery
- **Loading Animation**: Beautiful progress indicators in preview section
- **Real Apps Generated**: Tic-tac-toe, forms, dashboards working perfectly

# Claude 4 Sonnet Integration
- **Model**: `claude-sonnet-4-20250514` (latest)
- **Refusal Handling**: Proper handling of content refusal responses
- **Better Code Generation**: Improved reasoning and intelligence
- **All Endpoints Upgraded**: Chat, document analysis, and code generation

# Gemini API Integration ✅ NEW
- **Model**: `gemini-2.0-flash-exp` (latest experimental)
- **Document Processing**: PDFs and images (JPG, PNG, GIF, WebP)
- **Structured Extraction**: JSON output with PRD analysis
- **Context Integration**: Extracted data feeds into Claude for code generation
- **Automatic Processing**: Files uploaded in chat are processed immediately
- **Persistent Context**: Document context maintained across chat sessions
- **Error Handling**: Graceful fallback for parsing failures
- **Progress Tracking**: Real-time processing status updates

# Smart Context Management ✅ ENHANCED 128K
- **Intent Detection**: Auto-detects code generation vs conversation requests
- **Context Types**: Separate handling for CODE_GENERATION, CONVERSATION, DOCUMENT_ANALYSIS
- **128K Token Support**: Massive context windows for complex projects and long conversations
- **Enhanced Token Limits**: 
  - Code Generation: 60K tokens (50K documents + instructions)
  - Conversation: 80K tokens (30K documents + 40K chat history)
  - Document Analysis: 100K tokens (70K documents + 20K conversation)
- **Extended Memory**: Up to 48 hours document retention, 20+ message sliding window
- **Document Filtering**: Recent and relevant documents with extended time thresholds
- **Smart Truncation**: Intelligent break points at paragraphs/sections
- **NO CHAT HISTORY for Code Generation**: Clean context for precise code generation
- **Relevance Scoring**: Documents filtered by content overlap with user prompt
- **Confidence Metrics**: Context decisions include confidence scores
- **Performance Optimized**: Prevents context confusion despite large context windows

# Chat Interface Features ✅ ENHANCED
- Lovable-style messaging UI with Rappi branding
- Dark/light theme toggle with system-wide theme management
- Split layout: chat (35%) + live preview (65%) with responsive design
- **NEW** File upload support for PDFs and images (PDF, JPG, PNG, GIF, WebP)
- **NEW** Automatic document processing with Gemini API
- **NEW** Chat persistence and context memory across sessions
- **NEW** Smart Context Management - Intelligent context filtering for optimal performance
- **NEW** Auto-intent Detection - Automatically detects code generation vs conversation
- **NEW** Token Budget Management - Optimized context size for better responses
- **NEW** Document Relevance Filtering - Only uses relevant and recent documents
- Proper scroll handling to prevent text stacking
- Home button for easy navigation back to dashboard
- Mostacho icon as AI avatar, maintaining Rappi branding
- Real-time code generation with status updates
- Context-aware responses using analyzed document content

# E2B + Claude API Integration (Fixed Architecture)
- **Backend Server** (`server.ts`) - Node.js Express server with E2B and Claude integration
- **Frontend API Service** (`src/lib/api-service.ts`) - Handles communication with backend
- **Real E2B Sandboxes** - Created in secure cloud environment via backend
- **Claude 3.5 Sonnet** - Real AI code generation via Anthropic API
- **Chat Integration** with real-time progress updates and live preview

## Workflow (FIXED):
1. User requests app generation in chat frontend (port 8081)
2. Frontend calls backend API (port 3001)
3. Backend creates E2B sandbox in cloud using proper Node.js environment
4. Backend calls Claude API to generate real code
5. Backend creates React/Next.js project files in E2B sandbox
6. Backend starts dev server in sandbox and returns preview URL
7. Frontend displays live preview in right panel (65% width)

## Supported Frameworks:
- Next.js (default) - Full-stack React framework
- React - Create React App with TypeScript
- Vite - Fast React development with TypeScript

## Environment Variables:
- `E2B_API_KEY` - E2B sandbox authentication (backend server)
- `ANTHROPIC_API_KEY` - Claude API authentication (backend server) ✅ UPDATED
- `GEMINI_API_KEY` - Google Gemini API for PDF/image processing (backend server) ✅ REQUIRED

## Architecture Notes:
- **Frontend (Browser)**: React app communicates with backend API only
- **Backend (Node.js)**: Handles E2B and Claude integration (proper environment)
- **E2B SDK**: Runs in Node.js backend environment as designed
- **No browser limitations**: All E2B operations happen server-side

# Documentation References
- **Claude Code SDK Documentation**: https://docs.anthropic.com/es/docs/claude-code/sdk
- **E2B Documentation**: https://e2b.dev/docs
- **Project Knowledge Base**: `project-knowledge-base.md` - Comprehensive project documentation and scope definition

# Development Workflow Rules
- NEVER run `npm run dev` or start the development server automatically
- Always instruct the user when and where to run the dev server instead of executing it
- Let the user maintain control over their development environment

# Information Management Rules
- ALWAYS update CLAUDE.md when discovering new useful commands or scripts
- AUTOMATICALLY document new components, utilities, or important files in Project Structure
- PROACTIVELY save configuration patterns, environment setup, and dependency information
- IMMEDIATELY document any error solutions, workarounds, or debugging steps discovered
- CONSTANTLY update development commands when new scripts or tools are found
- PERSISTENTLY track code patterns, naming conventions, and architectural decisions
- CONTINUOUSLY document API endpoints, data models, and integration patterns discovered
- ALWAYS save user preferences, customizations, and workflow optimizations learned