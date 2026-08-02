import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Two pages share this project: the app, and the design-system reference
// that documents it. The dev server serves both (`/` and `/system.html`),
// but they are built in separate passes on purpose — folding them into one
// rollup input hoists their shared modules into a common chunk, and
// `tools/bundle.mjs` needs the app to stay a single JS and a single CSS
// file to inline it into one self-contained page.
//
//   npx vite build                    -> dist/index.html   (app, unchanged)
//   npx vite build --mode system      -> dist/system.html  (reference)
//
// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: mode === 'system'
    ? {
      emptyOutDir: false,   // keep the app build already in dist/
      rollupOptions: {
        input: { system: resolve(import.meta.dirname, 'system.html') },
      },
    }
    : {},
}))
