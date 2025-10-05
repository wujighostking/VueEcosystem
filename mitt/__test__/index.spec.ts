import { describe, expect, it, vi } from 'vitest'
import { mitt, useMitt } from '../src'

describe('test mitt', () => {
  const emitter = useMitt()

  it('test mitt is single instance', () => {
    expect(emitter).toBe(mitt())
  })

  it('test mitt', () => {
    const onEvent = vi.fn(() => {})

    emitter.on('onEvent', onEvent)
    emitter.emit('onEvent')

    expect(onEvent).toBeCalledTimes(1)

    emitter.off('onEvent', onEvent)
    emitter.emit('onEvent')

    expect(onEvent).toBeCalledTimes(1)
  })

  it('once', () => {
    const onEvent = vi.fn(() => {})

    emitter.once('onEvent', onEvent)
    emitter.emit('onEvent')

    expect(onEvent).toBeCalledTimes(1)
  })

  it('test clear', () => {
    const onEvent1 = vi.fn(() => {})
    const onEvent2 = vi.fn(() => {})

    emitter.on('onEvent1', onEvent1)
    emitter.on('onEvent2', onEvent2)

    expect(emitter.all.size()).toBe(2)

    emitter.all.clear()

    expect(emitter.all.size()).toBe(0)
    expect(onEvent1).toBeCalledTimes(0)
    expect(onEvent2).toBeCalledTimes(0)
  })
})
