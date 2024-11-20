import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    ...configDefaults,
    clearMocks: true,
    reporters: process.env.CI
      ? ['./dist/generate-report.js']
      : ['./dist/generate-report.js'],
  },
})
