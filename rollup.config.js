import pkg from './package.json'

export default /** @type {import('rollup').RollupOptions} */ ({
  input: './src/index.js',
  output: [
    {
      file: './dist/index.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: './dist/index.mjs',
      format: 'esm',
      exports: 'named'
    }
  ],
  external: Object.keys(pkg.dependencies)
})
