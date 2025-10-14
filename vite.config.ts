import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";


const tsxMimeFix = (): Plugin => ({
  name: "tsx-mime-fix",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const pathname = req.url?.split("?")[0];
      if (pathname && (/\.tsx$/.test(pathname) || /\.ts$/.test(pathname))) {
        res.setHeader("Content-Type", "text/javascript");
      }
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const pathname = req.url?.split("?")[0];
      if (pathname && (/\.tsx$/.test(pathname) || /\.ts$/.test(pathname))) {
        res.setHeader("Content-Type", "text/javascript");
      }
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
    mimeTypes: {
      ".ts": "text/javascript",
      ".tsx": "text/javascript",
    },
  },
  preview: {
    mimeTypes: {
      ".ts": "text/javascript",
      ".tsx": "text/javascript",
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),

    tsxMimeFix(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
