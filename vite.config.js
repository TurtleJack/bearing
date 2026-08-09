import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Shared design tokens/components: @ui → packages/ui/src
  resolve: {
    alias: { '@ui': fileURLToPath(new URL('./packages/ui/src', import.meta.url)) },
  },
})
