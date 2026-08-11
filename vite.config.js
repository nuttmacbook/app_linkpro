import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        nodePolyfills(),
        tailwindcss()
    ],
    define: {
        'globalThis.Buffer': 'undefined',
    },
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
            },
        },
    },
});