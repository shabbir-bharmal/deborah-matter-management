import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

/**
 * The SPA talks to the Laravel API with session cookies, so the dev server
 * proxies `/api` and `/sanctum` to Laravel — that keeps everything same-origin
 * and avoids CORS entirely. Override the backend with SPA_API_PROXY when not
 * using the Herd host (e.g. SPA_API_PROXY=http://127.0.0.1:8000).
 */
const apiTarget = process.env.SPA_API_PROXY ?? 'https://deborah-matter-management.test';

export default defineConfig({
    root: 'resources/js/src',
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '~': fileURLToPath(new URL('./resources/js/src', import.meta.url)),
        },
    },
    server: {
        port: 5174,
        proxy: {
            // secure:false accepts Herd's self-signed certificate.
            '/api': { target: apiTarget, changeOrigin: true, secure: false },
            '/sanctum': { target: apiTarget, changeOrigin: true, secure: false },
        },
    },
    build: {
        outDir: '../../../public/spa',
        emptyOutDir: true,
    },
    esbuild: {
        jsx: 'automatic',
    },
});
