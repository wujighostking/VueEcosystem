import { h } from './h'

export function createAppAPI(render) {
  return function createApp(rootComponent, rootProps) {
    const context = {
      provides: {},
    }

    const app = {
      _container: null,

      mount(container) {
        const vnode = h(rootComponent, rootProps)
        vnode.appContext = context
        render(vnode, container)
        app._container = container
      },

      unmount() {
        render(null, app._container)
      },
    }

    return app
  }
}
