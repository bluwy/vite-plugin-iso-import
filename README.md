# vite-plugin-iso-import

Import modules isomorphically. [Vite discussion](https://github.com/vitejs/vite/discussions/4172) for potential built-in support.

## Usage

Input:

```js
import { foo } from './client-module?client'
import { bar } from './server-module?server'
```

Normal build output:

```js
import { foo } from './client-module'
```

SSR build output:

```js
import { bar } from './server-module'
```

## Installation

Install library:

```bash
$ npm i -D vite-plugin-iso-import
```

Add plugin to `vite.config.js`:

```js
import { isoImport } from 'vite-plugin-iso-import'

export default defineCnfig({
  plugins: [isoImport()]
})
```

## FAQ

### What happens if I use an import value that has been stripped off?

You'll get a usual JS error of the value being unreferenced/undefined. Instead, you should always wrap these environment-specific code with `import.meta.env.SSR`.

### Using `?client` and `?server` loses intellisense

The library exports a custom TypeScript plugin that fixes it. Simply update your `jsconfig.json` or `tsconfig.json` like so:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "vite-plugin-iso-import" }]
  }
}
```

If you're using the VSCode-bundled TypeScript version, you have to update VSCode's `settings.json` with `"typescript.tsserver.pluginPaths": ["."]`. (Or a path to the project that contains the `node_modules` folder)

Also note that this currently does not work for Vue and Svelte files. The language services are unable to load TypeScript plugins. At the meantime, you can use this suboptimal solution for npm packages only:

```ts
// global.d.ts (are any ambient dts file)
declare module 'lodash-es?client' {
  import * as all from 'lodash-es'
  export = all
}
```

## License

MIT
