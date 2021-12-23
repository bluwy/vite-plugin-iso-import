<script>
  import { foo } from '$lib/client-module?client'
  import { hey } from '$lib/server-module?server'
  import camelcase from 'camelcase?client'
  import { truncate } from 'lodash-es?server'

  // In normal vite app, import.meta.env.SSR can be used
  if (browser) {
    console.log('foo', foo)
    console.log(camelcase('camel_case'))
  } else {
    console.log('hey', hey)
    console.log(truncate('hello', { length: 3 }))
  }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
