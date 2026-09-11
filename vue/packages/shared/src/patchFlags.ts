/* eslint-disable ts/prefer-literal-enum-member */
/**
 * Patch flags 是编译器生成的优化提示。
 *
 * 在 diff 过程中，运行时可以根据 patch flag 的值
 * 只检查需要更新的部分，从而跳过不必要 Diff 的分支。
 *
 * 每个 flag 的值可以通过位运算进行组合：
 *
 * ```js
 * const flag = PatchFlags.TEXT | PatchFlags.CLASS // 同时具有动态文本和动态 class
 * // 检查组合
 * flag & PatchFlags.TEXT // 是否包含动态文本
 * ```
 */
export enum PatchFlags {
  // 表示具有动态 textContent 的元素
  TEXT = 1,

  // 表示具有动态 class 绑定的元素
  CLASS = 1 << 1,

  // 表示具有动态 style 绑定的元素
  STYLE = 1 << 2,

  // 表示具有动态的非 class/style 的 props 的元素
  PROPS = 1 << 3,

  // 表示 props 中含有动态的 key，需要进行完整的 props diff
  FULL_PROPS = 1 << 4,

  // 表示需要 hydration 的元素（仅 SSR 相关）
  NEED_HYDRATION = 1 << 5,

  // 表示子节点顺序不会改变的稳定 Fragment
  STABLE_FRAGMENT = 1 << 6,

  // 表示子节点带有 key 的 Fragment（需要进行完整的子节点 diff）
  KEYED_FRAGMENT = 1 << 7,

  // 表示子节点不带 key 的 Fragment（只需比较长度等）
  UNKEYED_FRAGMENT = 1 << 8,

  // 表示只需要进行非 props 的 patch，例如 ref 或 directives 的更新
  NEED_PATCH = 1 << 9,

  // 表示具有动态插槽的组件
  DYNAMIC_SLOTS = 1 << 10,

  // 表示仅因为用户在模板根层级放置了注释而创建的 Fragment（仅开发环境）
  DEV_ROOT_FRAGMENT = 1 << 11,

  /**
   * 以下是特殊用途的 flag，值为负数，因此永远不会与上面通过
   * 位运算组合出的 flag 冲突，可以用 `patchFlag > 0` 来判断
   * 是否为普通 flag。
   */

  // 表示静态节点，diff 阶段可以完全跳过
  CACHED = -1,

  // 表示 diff 算法应该退出优化模式（例如遇到带作用域插槽的
  // v-for 或手写 render 函数产生的 Fragment 时）
  BAIL = -2,
}
