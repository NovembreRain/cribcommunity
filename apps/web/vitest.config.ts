import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Load .env from repo root so DATABASE_URL is available for API tests
  envDir: path.resolve(__dirname, '../..'),
  resolve: {
    alias: {
      // Mirror tsconfig paths so route imports resolve inside tests
      '@': path.resolve(__dirname, '.'),
      // Shortcut to packages/db test helpers
      '@test-helpers': path.resolve(__dirname, '../../packages/db/test-helpers'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
  },
})
