/// <reference types="@sveltejs/kit" />

declare module 'camelcase?client' {
  import all from 'camelcase'
  export = all
}

declare module 'lodash-es?server' {
  import * as all from 'lodash-es'
  export = all
}
