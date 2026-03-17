import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    snapshotOptions: {
      snapshotsDirPath: resolve(__dirname, 'snapshots'),
    },
  },
  resolve: {
    alias: {
      '@skelix/core': resolve(__dirname, '../packages/core/src/index.ts'),
      '@skelix/adapters': resolve(__dirname, '../packages/adapters/src/index.ts'),
    },
  },
})
