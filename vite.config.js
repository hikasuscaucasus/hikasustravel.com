import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const mapboxStub = fileURLToPath(new URL('./src/ssr/mapbox-gl-stub.js', import.meta.url))

// Two builds come out of this config:
//   vite build                      -> dist/        the browser bundle
//   vite build --ssr src/entry-server.jsx -> dist-ssr/  the build-time renderer
//                                                    used by scripts/prerender.js
export default defineConfig(({ isSsrBuild }) => ({
  base: '/',
  plugins: [react()],
  resolve: {
    // mapbox-gl reaches for window on import, which kills the Node render.
    // Only the map's wrapper element is produced at build time (see the stub),
    // so the browser build is untouched and still gets the real library.
    //
    // Anchored regex, not the bare string: a string alias matches by prefix, so
    // it would rewrite `mapbox-gl/dist/mapbox-gl.css` too and look for the
    // stylesheet underneath the stub file. Only the package entry is swapped;
    // the CSS import resolves normally and Vite drops it from the SSR build.
    alias: isSsrBuild ? [{ find: /^mapbox-gl$/, replacement: mapboxStub }] : [],
  },
  build: isSsrBuild
    ? { outDir: 'dist-ssr', ssr: true }
    : {
        rollupOptions: {
          output: {
            manualChunks: {
              mapbox: ['mapbox-gl'],
              swiper: ['swiper'],
              router: ['react-router-dom'],
            },
          },
        },
      },
}))
