import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '~': fileURLToPath(new URL('./resources/js/src', import.meta.url)),
        },
    },
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['resources/js/src/test/setup.ts'],
        css: false,
    },
});
