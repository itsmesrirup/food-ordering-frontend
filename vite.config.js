import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Set the port to a fixed number
    port: 5174,
    // 2. Make the server exit if the port is already in use
    strictPort: true, 
  }
})