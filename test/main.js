import { client } from './client-module?client'
import { server } from './server-module?server'

if (import.meta.env.SSR) {
  console.log(server)
} else {
  console.log(client)
}
