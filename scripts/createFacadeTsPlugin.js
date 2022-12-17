import fs from 'fs'
import path from 'path'

// https://stackoverflow.com/a/66504080/13265944
// TypeScript only loads plugins from node_modules for "security reasons".
// How does plugins from node_modules be safer than the one you write locally?

// Below code creates a facade "plugin" package that TypeScript can load,
// that in turn loads `index.js`.
const dirPath = path.resolve(process.cwd(), 'node_modules/plugin')
if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath)
fs.writeFileSync(path.resolve(dirPath, './package.json'), '{"name":"plugin"}', { encoding: 'utf-8' })
fs.writeFileSync(path.resolve(dirPath, './index.js'), 'module.exports = require("../../src/index.cjs")', {
  encoding: 'utf-8'
})
