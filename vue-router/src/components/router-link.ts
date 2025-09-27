import type { Component, ComponentPropsOptions } from 'vue'
import { h, inject } from 'vue'
import { ROUTER } from '../utils/config'

export const RouterLink: Component = {
  name: 'RouterLink',
  props: {
    to: {
      type: [String, Object],
      required: true,
    },
  },

  setup(props: ComponentPropsOptions, { slots }) {
    const link = useLink(props)
    return () => h('a', { onClick: link.navigate }, slots.default?.())
  },
}

function useLink(props: any) {
  const router = inject(ROUTER) as any

  function navigate() {
    router.push(props.to)
  }

  return {
    navigate,
  }
}
