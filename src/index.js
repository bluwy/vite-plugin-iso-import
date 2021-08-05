import MagicString from 'magic-string'
import { init, parse } from 'es-module-lexer'

const clientRE = /(\?|&)client(&|$)/
const serverRE = /(\?|&)server(&|$)/

/**
 * Isomorphically import modules on client or server context
 * @returns {import('vite').Plugin}
 */
export function isoImport() {
  return {
    name: 'vite-plugin-iso-import',
    enforce: 'post',
    async transform(code, id, ssr) {
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
 * TypeScript plugin to correctly resolve ?client and ?server imports.
 * Only works for JS and TS files. Vue and Svelte are not supported.
 */
export default function tsPlugin() {
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

// TypeScript only loads plugins via cjs with `module.exports`
if (typeof module !== 'undefined') {
  module.exports = tsPlugin
  tsPlugin.default = tsPlugin
  tsPlugin.isoImport = isoImport
}
