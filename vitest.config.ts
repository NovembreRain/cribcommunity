import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Root config — individual apps/packages each have their own vitest config.
    // This workspace config delegates to them.
    workspace: ['apps/*/vitest.config.ts', 'packages/*/vitest.config.ts'],
  },
})
