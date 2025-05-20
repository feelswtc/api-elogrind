import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  dts: false,
  clean: true,
  minify: false,
  sourcemap: true,
  skipNodeModulesBundle: true,
  target: 'node18',
  outDir: 'dist',
  onSuccess: 'echo Build completed successfully!',
  env: {
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
  // Importante para resolver os imports com @/
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    }
  },
})