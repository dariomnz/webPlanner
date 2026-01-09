import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import reactScan from 'vite-plugin-react-scan';

// https://vite.dev/config/
export default defineConfig({
    base: '/webPlanner/',
    plugins: [
        reactScan(),
        svgr(),
        react({
            babel: {
                plugins: [['babel-plugin-react-compiler', { target: '19' }]],
            },
        }),
    ],
    server: {
        host: true, // Expone el servidor a la red local
        port: 5173, // Puerto por defecto de Vite
    },
})
