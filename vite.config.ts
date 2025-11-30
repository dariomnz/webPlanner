import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    base: '/webPlanner/',
    plugins: [react()],
    server: {
        host: true, // Expone el servidor a la red local
        port: 5173, // Puerto por defecto de Vite
    }
})
