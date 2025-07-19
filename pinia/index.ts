import type { Plugin } from 'vue'

const installer: Plugin = {
  install(app) {
    // eslint-disable-next-line no-console
    console.log(app)
  },
}

export function createPinia() {
  return installer
}

export default installer
