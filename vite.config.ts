import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
const tsxMimeFix = (): PluginOption => ({
  name: "tsx-mime-fix",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.match(/\.tsx?(\?|$)/)) {
        res.setHeader("Content-Type", "text/javascript");
      }

      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.match(/\.tsx?(\?|$)/)) {
        res.setHeader("Content-Type", "text/javascript");
      }

      next();
    });
  },
});

export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    tsxMimeFix(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
