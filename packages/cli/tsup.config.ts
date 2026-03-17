import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // CLI binary — no type declarations needed
  banner: {
    js: '#!/usr/bin/env node',
  },
})
