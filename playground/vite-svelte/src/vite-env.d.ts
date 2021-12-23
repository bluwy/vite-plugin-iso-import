/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module 'camelcase?client' {
  import all from 'camelcase'
  export = all
}

declare module 'lodash-es?server' {
  import * as all from 'lodash-es'
  export = all
}

declare module '*?client'
declare module '*?server'
