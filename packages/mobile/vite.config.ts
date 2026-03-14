import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

const stubDir = path.resolve(__dirname, "src/web-stubs")

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // --- Order matters: more specific patterns first ---

      // 1. RN internal sub-path imports (react-native/Libraries/...)
      {
        find: /^react-native\/Libraries\/.*/,
        replacement: path.resolve(stubDir, "codegenNativeComponent.ts"),
      },
      // 2. Exact "react-native" → shim (re-exports react-native-web + missing APIs)
      {
        find: /^react-native$/,
        replacement: path.resolve(stubDir, "react-native-shim.ts"),
      },
      // 3. lucide-react-native → lucide-react (same API, uses HTML <svg> instead of RN SVG)
      {
        find: /^lucide-react-native$/,
        replacement: "lucide-react",
      },
      // 4. react-native-screens → web stub
      {
        find: /^react-native-screens(\/.*)?$/,
        replacement: path.resolve(stubDir, "react-native-screens.tsx"),
      },
      // 5. react-native-svg → web build (for any remaining direct imports)
      {
        find: /^react-native-svg(\/.*)?$/,
        replacement: path.resolve(stubDir, "react-native-svg-stub.ts"),
      },
      // 6. react-native-safe-area-context → web stub
      {
        find: "react-native-safe-area-context",
        replacement: path.resolve(stubDir, "safe-area-context.tsx"),
      },
      // 7. react-native-gesture-handler → react-native-web (no-op)
      {
        find: /^react-native-gesture-handler(\/.*)?$/,
        replacement: path.resolve(stubDir, "react-native-shim.ts"),
      },
      // 8. AsyncStorage → localStorage
      {
        find: "@react-native-async-storage/async-storage",
        replacement: path.resolve(stubDir, "async-storage.ts"),
      },
      // 9. Path alias
      {
        find: "@/",
        replacement: `${path.resolve(__dirname, "src")}/`,
      },
    ],
    extensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js"],
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
    global: "globalThis",
  },
  optimizeDeps: {
    esbuild: {
      jsx: "automatic",
    },
    include: ["react-native-web"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    port: 3002,
  },
})
