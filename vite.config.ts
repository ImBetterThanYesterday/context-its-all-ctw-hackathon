import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // define: {
  //   global: 'globalThis',
  //   'process.env': {},
  //   exports: '{}',
  //   module: '{}',
  // },
  optimizeDeps: {
    exclude: [
      'dotenv', 
      '@anthropic-ai/claude-code',
      '@anthropic-ai/sdk',
      '@e2b/code-interpreter',
      'express',
      'cors'
    ],
    include: ['react', 'react-dom']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
