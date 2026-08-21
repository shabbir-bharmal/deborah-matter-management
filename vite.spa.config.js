import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

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
    },
    build: {
        outDir: '../../../public/spa',
        emptyOutDir: true,
    },
    esbuild: {
        jsx: 'automatic',
    },
});
