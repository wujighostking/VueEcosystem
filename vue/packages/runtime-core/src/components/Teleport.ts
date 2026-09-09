export const isTeleport = type => type?.__isTeleport

export const Teleport = {
  name: 'Teleport',
  __isTeleport: true,
  props: {
    to: {
      type: String,
    },
    disabled: {
      type: Boolean,
    },
  },

  process(n1, n2, container, anchor, parentComponent, internals) {
    const { mountChildren, patchChildren, options: { querySelector, insert } } = internals

    const { disabled, to } = n2.props
    /**
     * 1。挂载
     * 2。更新
     */

    if (n1 == null) {
      // 挂载
      const target = disabled ? container : querySelector(to)
      if (target) {
        n2.target = target
        mountChildren(target, n2.children, parentComponent)
      }
    }
    else {
    //   更新
      patchChildren(n1, n2, n1.target, parentComponent)
      n2.target = n1.target

      const prevProps = n1.props
      if (prevProps.to !== to || disabled !== prevProps.disabled) {
        const target = disabled ? container : querySelector(to)

        for (const child of n2.children) {
          insert(child.el, target)
        }

        n2.target = target
      }
    }
  },
}
