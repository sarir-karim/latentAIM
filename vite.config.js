import { defineConfig } from "vite";
import tailwindcss from "tailwindcss"
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      clientPort: 443,
      host: process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co',
      protocol: 'wss',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
  },
  root: "./client",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      shared: path.resolve(__dirname, "shared"),
    },
  },
});