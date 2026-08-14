import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      // onnxruntime-web (a peer dep of @imgly/background-removal) conditionally
      // imports backend-specific subpaths (webgpu/webgl/wasm) at runtime based
      // on what the browser supports. These aren't real resolvable package
      // exports at build time, so Rollup must treat them as external rather
      // than try to bundle them — the actual files are only needed if that
      // code path executes in the browser, where they resolve fine.
      external: [
        'onnxruntime-web/webgpu',
        'onnxruntime-web/webgl',
        'onnxruntime-web/wasm',
      ],
    },
  },
  optimizeDeps: {
    // @imgly/background-removal ships ONNX/WASM worker assets that Vite's
    // dependency pre-bundler can mangle — exclude it so it's only handled
    // at request time via the dynamic import in SmartTryOn.jsx.
    exclude: ['@imgly/background-removal'],
  },
})
