import { defineConfig } from 'vite'
import { isoImport } from './index.js'

export default defineConfig({
  plugins: [isoImport()]
})
