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

```js
// vite.config.js

import { isoImport } from 'vite-plugin-iso-import'

export default defineCnfig({
  plugins: [isoImport()]
})
```

## FAQ

> Q: What happens if I use an import value that has been stripped off?

A: You'll get a usual JS error of the value being unreferenced/undefined. Instead, you should always wrap these environment-specific code with `import.meta.env.SSR`.

> Q: Using `?client` and `?server` loses intellisense.

A: The library exports a custom TypeScript plugin that fixes it. Simply update your `jsconfig.json` or `tsconfig.json` like so:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "vite-plugin-iso-import" }]
  }
}
```

And update VSCode's `settings.json` with `"typescript.tsserver.pluginPaths": ["."]`. (Optional if using workspace Typescript version).

## License

MIT
