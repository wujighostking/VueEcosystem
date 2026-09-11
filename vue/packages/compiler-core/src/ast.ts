export enum NodeTypes {
  /** 根节点，整个模板 AST 的入口，children 为模板顶层节点列表 */
  ROOT,
  /** 元素节点，如 <div>、<MyComponent>，包含 tag、props、children 等 */
  ELEMENT,
  /** 纯文本节点，如 "hello world" */
  TEXT,
  /** 注释节点，如 <!-- comment --> */
  COMMENT,
  /** 简单表达式节点，如 {{ count + 1 }} 中的 count + 1，isStatic 标识是否为静态表达式 */
  SIMPLE_EXPRESSION,
  /** 插值节点，即 {{ ... }} 双大括号表达式，content 为内部表达式 */
  INTERPOLATION,
  /** 普通属性节点，如 class="foo"，包含 name 和 value */
  ATTRIBUTE,
  /** 指令节点，如 v-if、v-model、@click，包含 name、exp、arg、modifiers */
  DIRECTIVE,
  // containers
  /** 复合表达式节点，用于合并多个相邻的文本/插值节点，如 "hello {{ name }}" */
  COMPOUND_EXPRESSION,
  /** v-if 节点，branches 存储所有 if / else-if / else 分支 */
  IF,
  /** v-if 的单个分支节点（if、else-if 或 else），condition 为条件表达式 */
  IF_BRANCH,
  /** v-for 节点，包含 source（遍历源）、valueAlias、keyAlias、objectIndexAlias */
  FOR,
  /** 文本调用节点，将文本/插值包装为 createTextVNode() 调用，由 transformText 生成 */
  TEXT_CALL,
  // codegen
  /** VNode 创建调用节点，对应 createVNode() / createElementVNode() 等运行时调用 */
  VNODE_CALL,
  /** JS 函数调用表达式节点，如 fn(arg1, arg2)，对应 CodegenCallExpression */
  JS_CALL_EXPRESSION,
  /** JS 对象字面量表达式节点，如 { key: value }，常用于生成 props 对象 */
  JS_OBJECT_EXPRESSION,
  /** JS 对象属性节点，即对象字面量中的单个键值对 key: value */
  JS_PROPERTY,
  /** JS 数组字面量表达式节点，如 [a, b, c]，常用于生成 children 数组 */
  JS_ARRAY_EXPRESSION,
  /** JS 函数表达式节点，如 function render() {} 或箭头函数，用于生成渲染函数 */
  JS_FUNCTION_EXPRESSION,
  /** JS 条件（三元）表达式节点，如 a ? b : c，用于 v-if 的代码生成 */
  JS_CONDITIONAL_EXPRESSION,
  /** 缓存表达式节点，对应 _cache[n] 缓存访问，配合 cacheStatic 实现静态提升缓存 */
  JS_CACHE_EXPRESSION,

  // ssr codegen
  /** JS 块语句节点，即 { ... } 代码块，仅用于 SSR 代码生成 */
  JS_BLOCK_STATEMENT,
  /** JS 模板字符串节点，如 `hello ${name}`，SSR 中用于拼接输出 HTML 字符串 */
  JS_TEMPLATE_LITERAL,
  /** JS if 语句节点，SSR 中用于 v-if 的代码生成 */
  JS_IF_STATEMENT,
  /** JS 赋值表达式节点，如 a = b，SSR 代码生成中使用 */
  JS_ASSIGNMENT_EXPRESSION,
  /** JS 逗号序列表达式节点，如 (a, b, c)，SSR 代码生成中使用 */
  JS_SEQUENCE_EXPRESSION,
  /** JS return 语句节点，SSR 渲染函数的返回语句 */
  JS_RETURN_STATEMENT,
}
