import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: './', // Use relative paths for GitHub Pages
  plugins: [
    react(),
    // The code below enables dev tools like taking screenshots of your site
    // while it is being developed on chef.convex.dev.
    // Feel free to remove this code if you're no longer developing your app with Chef.
    mode === "development"
      ? {
          name: "inject-chef-dev",
          transform(code: string, id: string) {
            if (id.includes("main.tsx")) {
              return {
                code: `${code}

/* Added by Vite plugin inject-chef-dev */
window.addEventListener('message', async (message) => {
  if (message.source !== window.parent) return;
  if (message.data.type !== 'chefPreviewRequest') return;

  const worker = await import('https://chef.convex.dev/scripts/worker.bundled.mjs');
  await worker.respondToMessage(message);
});
            `,
                map: null,
              };
            }
            return null;
          },
        }
      : null,
    // End of code for taking screenshots on chef.convex.dev.
  ].filter(Boolean),
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
  // Render injects the PORT env variable; binding to 0.0.0.0 is required
  // so Render's port-scan health check can reach the process.
  //
  // RENDER DEPLOYMENT CHECKLIST:
  //   1. Build Command : npm run build
  //   2. Start Command : npm run preview
  //   3. Environment tab — add all VITE_FIREBASE_* variables:
  //        VITE_FIREBASE_API_KEY
  //        VITE_FIREBASE_AUTH_DOMAIN
  //        VITE_FIREBASE_PROJECT_ID
  //        VITE_FIREBASE_STORAGE_BUCKET
  //        VITE_FIREBASE_MESSAGING_SENDER_ID
  //        VITE_FIREBASE_APP_ID
  //      Without these the app builds but Firebase fails at runtime.
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
}));
