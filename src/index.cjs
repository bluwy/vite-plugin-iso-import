const MagicString = require('magic-string')
const { init, parse } = require('es-module-lexer')

const clientRE = /(\?|&)client(&|$)/
const serverRE = /(\?|&)server(&|$)/

/**
 * Isomorphically import modules on client or server context
 * @returns {import('vite').Plugin}
 */
function isoImport() {
  return {
    name: 'vite-plugin-iso-import',
    enforce: 'post',
    config() {
      return {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [esbuildPatchPlugin()]
          }
        }
      }
    },
    async transform(code, id, opts) {
      // Support breaking change in Vite 2.7
      // The third argument now contains an object with ssr property, instead of just the ssr boolean
      const ssr = opts === true || opts?.ssr

      await init

      let _s
      const s = () => _s || (_s = new MagicString(code))
      const [imports] = parse(code)

      // Strip suffix only
      const stripRE = ssr ? serverRE : clientRE
      // Rip the whole import
      const ripRE = ssr ? clientRE : serverRE

      for (const i of imports) {
        // Ignore if no name or is dynamic import
        if (!i.n || i.d !== -1) continue
        let m
        if ((m = i.n.match(stripRE))) {
          // "?client"         => ""
          // "?client&foo"     => "?foo"
          // "?foo&client"     => "?foo"
          // "?foo&client&bar" => "?foo&bar"
          s().overwrite(i.s + m.index, i.s + m.index + m[0].length, m[2] ? m[1] : '')
        } else if ((m = i.n.match(ripRE))) {
          s().overwrite(i.ss, i.se, '')
        }
      }

      if (_s) {
        return {
          code: _s.toString(),
          map: _s.generateMap()
        }
      }
    }
  }
}

/**
 * I wish I would never have to write this again :(
 *
 * This esbuild plugin patches Vite's dep scan plugin so it's `build.onResolve`
 * callback param always receives `args.path` without `?client` or `?server` suffix.
 *
 * But why this method? A list of alternatives tried:
 *
 * 1. Esbuild plugin which resolves "my-lib?client" => "my-lib"
 *
 * This does not work because `build.onResolve` doesn't fallthrough
 * (needs resolve to absolute path), which also means Vite's scanner won't catch this.
 *
 * 2. Use Vite plugin `resolveId` for "my-lib?client" => "my-lib?client"
 *
 * Almost worked, but Vite prebundles as "my-lib?client", causing actual import to
 * trigger dynamic pre-bundling.
 *
 * 3. Intercept server._optimizeDepsMetadata (Idea: https://github.com/antfu/vite-plugin-optimize-persist)
 *
 * Too risky with potential pitfalls. Plus we need to fix this for non-package imports
 * as well so Vite crawls into the import path, e.g. relative or alias imports.
 *
 * 4. Use esbuild tsconfig option to map "*?client" => "*" naively
 *
 * Doesn't work. Don't think it's valid either.
 *
 * 5. Fix Vite directly to strip anything after "?"
 *
 * There could be legitimate reasons we don't want that to happen.
 *
 * @return {import('vite').UserConfig['optimizeDeps']['esbuildOptions']['plugins'][number]}
 */
function esbuildPatchPlugin() {
  return {
    name: 'esbuild-plugin-iso-import',
    setup(build) {
      const viteScanPlugin = build.initialOptions.plugins.find((v) => v.name === 'vite:dep-scan')

      if (!viteScanPlugin) return

      const oriSetup = viteScanPlugin.setup.bind(viteScanPlugin)
      viteScanPlugin.setup = function (build) {
        const oriResolve = build.onResolve.bind(build)
        build.onResolve = function (options, callback) {
          function wrapCallback(args) {
            args.path = args.path
              .replace(clientRE, (_, $1, $2) => ($2 ? $1 : ''))
              .replace(serverRE, (_, $1, $2) => ($2 ? $1 : ''))
            return callback(args)
          }

          return oriResolve(options, wrapCallback)
        }
        return oriSetup(build)
      }
    }
  }
}

/**
 * TypeScript plugin to correctly resolve ?client and ?server imports.
 * Only works for JS and TS files. Vue and Svelte are not supported.
 */
function tsPlugin() {
  /**
   * @param {import('typescript/lib/tsserverlibrary').server.PluginCreateInfo} info
   */
  function create(info) {
    // Thanks: https://github.com/sveltejs/language-tools/blob/6e0396ca18ea5e7da801468eab35cdef43b3c979/packages/typescript-plugin/src/module-loader.ts#L56
    const originalResolveModuleNames = info.languageServiceHost.resolveModuleNames.bind(info.languageServiceHost)
    info.languageServiceHost.resolveModuleNames = (moduleNames, ...args) => {
      const newModuleNames = moduleNames.map(
        (name) =>
          name
            .replace(clientRE, (_, $1, $2) => ($2 ? $1 : '')) // Strip ?client
            .replace(serverRE, (_, $1, $2) => ($2 ? $1 : '')) // Strip ?server
      )
      return originalResolveModuleNames(newModuleNames, ...args)
    }

    return info.languageService
  }

  return { create }
}

module.exports = tsPlugin
tsPlugin.default = tsPlugin
tsPlugin.isoImport = isoImport
