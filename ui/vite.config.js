import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      port: Number(env.VITE_PORT) || 5173,
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": [
              "react",
              "react-dom",
              "react-router-dom",
              "react-redux",
              "@reduxjs/toolkit",
              "zustand",
            ],
            "ui-vendor": ["framer-motion", "lucide-react"],
            "chart-vendor": ["recharts"],
          },
        },
      },
    },
  };
});
