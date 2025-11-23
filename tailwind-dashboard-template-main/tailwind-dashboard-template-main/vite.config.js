import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  define: {
    "process.env": process.env,
  },

  plugins: [react()],

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
