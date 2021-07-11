import { defineConfig } from 'vite'
import { isoImport } from './index'

export default defineConfig({
  plugins: [isoImport()]
})
