import type { App, EffectScope, Reactive, Ref } from 'vue'
import { effectScope, ref } from 'vue'
import { piniaSymbol } from './rootStore'

export type PluginType = (params: { store: Reactive<any>, id: string }) => void
export interface PiniaType {
  install: (app: App) => void
  use: (plugin: PluginType) => void
  _p: PluginType[]
  state: Ref<any, any> | undefined
  _e: EffectScope
  _s: Map<any, any>
}

export function createPinia() {
  const scope = effectScope()

  const state = scope.run(() => ref({}))
  const _p: PluginType[] = []

  const pinia: PiniaType = {
    install(app: App) {
      app.provide(piniaSymbol, pinia)
      app.config.globalProperties.$store = pinia
    },
    use(plugin: PluginType) {
      //   自定义插件
      _p.push(plugin)
    },

    _p,
    state,
    _e: scope,
    _s: new Map<any, any>(), // 记录有哪些store counter -> store
  }
  return pinia
}
