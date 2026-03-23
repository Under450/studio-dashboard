import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: '/studio-dashboard/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/postiz': {
        target: 'http://localhost:4007',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/postiz/, ''),
      },
    },
  },
});
