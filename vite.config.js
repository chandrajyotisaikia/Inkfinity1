import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    // @imgly/background-removal ships ONNX/WASM worker assets that Vite's
    // dependency pre-bundler can mangle — exclude it so it's only handled
    // at request time via the dynamic import in SmartTryOn.jsx.
    exclude: ['@imgly/background-removal'],
  },
})
