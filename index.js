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
