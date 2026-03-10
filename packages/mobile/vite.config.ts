import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-native": "react-native-web",
      "@/": `${path.resolve(__dirname, "src")}/`,
    },
    extensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js"],
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
    global: "globalThis",
  },
  optimizeDeps: {
    esbuild: {
      // JSX factory for react-native-web internals
      jsx: "automatic",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    port: 3001,
  },
})
