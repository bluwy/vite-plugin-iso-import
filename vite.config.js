import { defineConfig } from 'vite'
import { isoImport } from './src/index.js'

export default defineConfig({
  plugins: [isoImport()]
})
