import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    base: '/',
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost',
                changeOrigin: true,
            },
            '/auth': {
                target: 'http://localhost',
                changeOrigin: true,
            },
            '/stripe-mock': {
                target: 'http://localhost:12111',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/stripe-mock/, ''),
            },
        },
    },
})
