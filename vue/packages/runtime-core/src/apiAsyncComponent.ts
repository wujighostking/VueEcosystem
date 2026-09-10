import { ref } from '@vue/reactivity'
import { isFunction } from '@vue/shared'
import { h } from './h'

export function defineAsyncComponent(options) {
  if (isFunction(options)) {
    options = {
      loader: options,
    }
  }

  const defaultComponent = () => h('span', null, '')

  const { loader, loadingComponent = defaultComponent, errorComponent = defaultComponent, timeout } = options

  return {
    setup(props, { attrs, slots }) {
      const component = ref(loadingComponent)

      function loadComponent() {
        return new Promise((resolve, reject) => {
          if (timeout && timeout > 0) {
            setTimeout(() => {
              reject(new Error('timeout'))
            }, timeout)
          }

          loader().then(resolve, reject)
        })
      }

      loadComponent().then((comp) => {
        if (comp && comp[Symbol.toStringTag] === 'Module') {
          // eslint-disable-next-line ts/ban-ts-comment
          // @ts-expect-error
          comp = comp.default
        }
        component.value = comp
      }, () => {
      //   加载失败
        component.value = errorComponent
      })

      return () => {
        return h(component.value, { ...props, ...attrs }, slots)
      }
    },
  }
}
