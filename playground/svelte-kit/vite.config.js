import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { isoImport } from 'vite-plugin-iso-import'

export default defineConfig({
  plugins: [sveltekit(), isoImport()]
})
