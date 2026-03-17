
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: './', // Use relative paths for deployment
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Dev server config (local development only)
  server: {
    host: true,
    port: 5173,
  },
  // Preview server config — used by Render via `npm run preview`
  preview: {
    host: "0.0.0.0",
    // Render typically uses 10000 or the $PORT env variable
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    // CRITICAL: This allows Render's domain to access the Vite preview server
    allowedHosts: [
      'restaurant-management-system-rsxp.onrender.com'
    ]
  },
}));