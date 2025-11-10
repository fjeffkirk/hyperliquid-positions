import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use root path for Render, use /hyperliquid-positions/ for GitHub Pages
  base: process.env.RENDER ? '/' : '/hyperliquid-positions/',
})

