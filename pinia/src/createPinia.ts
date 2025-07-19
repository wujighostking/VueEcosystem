import type { App, EffectScope, Plugin, Ref } from 'vue'
import { effectScope, ref } from 'vue'
import { piniaSymbol } from './rootStore'

export interface PiniaType {
  install: (app: App) => void
  use: (app: App) => void
  state: Ref<any, any> | undefined
  _e: EffectScope
  _s: Map<any, any>
}
export function createPinia() {
  const scope = effectScope()

  const state = scope.run(() => ref({}))

  const pinia: PiniaType = {
    install(app: App) {
      app.provide(piniaSymbol, pinia)
      app.config.globalProperties.$store = pinia
    },
    use() {
      //   自定义插件
    },

    state,
    _e: scope,
    _s: new Map<any, any>(), // 记录有哪些store counter -> store
  }
  return pinia as Plugin
}
