# E2B Optimized Template for Rappi Creator
FROM e2bdev/code-interpreter:latest

# Install Node.js and npm tools globally
RUN npm install -g create-next-app@latest
RUN npm install -g @vitejs/create-vite@latest
RUN npm install -g typescript@latest
RUN npm install -g @types/node@latest

# Install commonly used packages
RUN npm install -g tailwindcss@latest
RUN npm install -g @tailwindcss/typography@latest
RUN npm install -g lucide-react@latest

# Pre-create project templates for faster generation
WORKDIR /templates

# Create Next.js template
RUN npx create-next-app@latest nextjs-template \
    --typescript \
    --tailwind \
    --eslint \
    --app \
    --no-src-dir \
    --import-alias "@/*" \
    --no-git \
    --yes

# Create Vite React template  
RUN npm create vite@latest react-template -- --template react-ts --yes

# Install dependencies in templates
WORKDIR /templates/nextjs-template
RUN npm install

WORKDIR /templates/react-template  
RUN npm install

# Create a simple starter template for quick projects
WORKDIR /templates
RUN mkdir -p simple-template/src/components
WORKDIR /templates/simple-template

# Create package.json for simple template
RUN echo '{\
  "name": "simple-app",\
  "version": "1.0.0",\
  "type": "module",\
  "scripts": {\
    "dev": "vite",\
    "build": "vite build",\
    "preview": "vite preview"\
  },\
  "dependencies": {\
    "react": "^18.2.0",\
    "react-dom": "^18.2.0"\
  },\
  "devDependencies": {\
    "@types/react": "^18.2.0",\
    "@types/react-dom": "^18.2.0",\
    "@vitejs/plugin-react": "^4.0.0",\
    "typescript": "^5.0.0",\
    "vite": "^5.0.0",\
    "tailwindcss": "^3.3.0",\
    "autoprefixer": "^10.4.0",\
    "postcss": "^8.4.0"\
  }\
}' > package.json

# Install dependencies for simple template
RUN npm install

# Create basic file structure for simple template
RUN echo '<!DOCTYPE html>\
<html lang="en">\
<head>\
  <meta charset="UTF-8">\
  <meta name="viewport" content="width=device-width, initial-scale=1.0">\
  <title>Generated App</title>\
</head>\
<body>\
  <div id="root"></div>\
  <script type="module" src="/src/main.tsx"></script>\
</body>\
</html>' > index.html

RUN echo 'import { defineConfig } from "vite"\
import react from "@vitejs/plugin-react"\
\
export default defineConfig({\
  plugins: [react()],\
  server: {\
    host: "0.0.0.0",\
    port: 3000\
  }\
})' > vite.config.ts

RUN echo '@tailwind base;\
@tailwind components;\
@tailwind utilities;' > src/index.css

RUN echo 'import React from "react"\
import ReactDOM from "react-dom/client"\
import App from "./App.tsx"\
import "./index.css"\
\
ReactDOM.createRoot(document.getElementById("root")!).render(\
  <React.StrictMode>\
    <App />\
  </React.StrictMode>,\
)' > src/main.tsx

# Set working directory back to home
WORKDIR /home/user

# Set environment variables for better npm performance
ENV NPM_CONFIG_PROGRESS=false
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false

# Optimize npm configuration
RUN npm config set progress=false
RUN npm config set audit=false
RUN npm config set fund=false