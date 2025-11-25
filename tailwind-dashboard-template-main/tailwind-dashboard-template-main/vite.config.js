import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  define: {
    "process.env": process.env,
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      toastify: path.resolve(__dirname, "src/toastify.js"),
      lib: path.resolve(__dirname, "src/lib"),
      // Add more aliases here if needed
    },
  },

  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.svg"],

  server: {
    proxy: {
      "/balaji-finance": {
        target: process.env.VITE_API_BASE || "http://localhost:8881",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
