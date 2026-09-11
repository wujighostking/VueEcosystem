/** All the states the tokenizer can be in. */
export enum State {
  /** 普通文本状态（初始状态），解析标签之间的纯文本内容 */
  Text = 1,

  // interpolation
  /** 插值开始，刚遇到 {{ ，等待进入插值表达式 */
  InterpolationOpen,
  /** 插值内部，正在解析 {{ ... }} 中的表达式内容 */
  Interpolation,
  /** 插值结束，刚遇到 }} ，准备回到文本状态 */
  InterpolationClose,

  // Tags
  /** 标签名之前，刚遇到 < （如 <div 中 < 之后、div 之前） */
  BeforeTagName, // After <
  /** 标签名内部，正在解析标签名（如 div） */
  InTagName,
  /** 自闭合标签内部，刚遇到 /> 中的 / */
  InSelfClosingTag,
  /** 闭合标签名之前，刚遇到 </ */
  BeforeClosingTagName,
  /** 闭合标签名内部，正在解析闭合标签名（如 </div 中的 div） */
  InClosingTagName,
  /** 闭合标签名之后，等待 > 结束闭合标签 */
  AfterClosingTagName,

  // Attrs
  /** 属性名之前，标签名结束后等待属性名开始 */
  BeforeAttrName,
  /** 普通属性名内部，正在解析属性名（如 class） */
  InAttrName,
  /** 指令名内部，正在解析指令名（如 v-if 中的 if、:class 中的 class、@click 中的 click） */
  InDirName,
  /** 指令静态参数内部，正在解析指令参数（如 v-bind:key、@click.stop 中的 key） */
  InDirArg,
  /** 指令动态参数内部，正在解析动态参数（如 :[key]、@[event] 中方括号内的表达式） */
  InDirDynamicArg,
  /** 指令修饰符内部，正在解析修饰符（如 @click.stop.prevent 中的 stop、prevent） */
  InDirModifier,
  /** 属性名之后，等待 = 或下一个属性 */
  AfterAttrName,
  /** 属性值之前，刚遇到 = ，等待属性值开始 */
  BeforeAttrValue,
  /** 双引号包裹的属性值内部，如 class="foo" 中的 foo */
  InAttrValueDq, // "
  /** 单引号包裹的属性值内部，如 class='foo' 中的 foo */
  InAttrValueSq, // '
  /** 无引号包裹的属性值内部，如 class=foo 中的 foo */
  InAttrValueNq,

  // Declarations
  /** 声明之前，刚遇到 <! （如 <!DOCTYPE html>） */
  BeforeDeclaration, // !
  /** 声明内部，正在解析声明内容 */
  InDeclaration,

  // Processing instructions
  /** 处理指令内部，正在解析 <? ... ?>（如 XML 声明 <?xml version="1.0"?>） */
  InProcessingInstruction, // ?

  // Comments & CDATA
  /** 注释之前，刚遇到 <!- ，等待判断是注释 <!-- 还是 CDATA <![CDATA[ */
  BeforeComment,
  /** CDATA 序列内部，正在解析 <![CDATA[ ... ]]> 内容 */
  CDATASequence,
  /** 特殊注释内部（条件注释，如 <!--[if IE]>） */
  InSpecialComment,
  /** 类注释内容内部，正在解析 <!-- ... --> 注释内容 */
  InCommentLike,

  // Special tags
  /** 特殊标签 S 判断，遇到 <s 开头的标签，决定按 <script> 还是 <style> 处理（RAWTEXT） */
  BeforeSpecialS, // Decide if we deal with `<script` or `<style`
  /** 特殊标签 T 判断，遇到 <t 开头的标签，决定按 <title> 还是 <textarea> 处理（RCDATA） */
  BeforeSpecialT, // Decide if we deal with `<title` or `<textarea`
  /** 特殊标签起始序列内部，已确认是特殊标签（script/style/title/textarea），正在继续匹配标签名的剩余字符序列 */
  SpecialStartSequence,

  /** SFC 根标签名内部，解析单文件组件根级标签名（如 <template>、<script>、<style>） */
  InSFCRootTagName,

  /** HTML 实体内部，正在解析 & 开头的实体引用（如 &amp; &lt;），仅非浏览器环境使用 */
  InEntity, // & - non-browser only

  /** RCDATA 内容解析中（<title>、<textarea> 的内容），不是真正的 tokenizer 状态 */
  InRCDATA, // RCDATA parsing - not a real state
}

export class Tokenizer {
  state = State.Text

  /**
   * 当前正在解析的字符下标
   */
  index = 0

  /**
   * 当前状态切换时候的初始位置
   */
  sectionStart = 0

  /**
   * 用来保存当前正在解析的字符串
   */
  buffer = ''

  constructor(private cbs) {
  }

  parse(input) {
    this.buffer = input

    while (this.index < this.buffer.length) {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const str = this.buffer[this.index]

      switch (this.state) {
        case State.Text:
          // if (str === '<') {
          //   this.cbs.onText(this.sectionStart, this.index)
          //   // 切换状态
          //   this.state = State.BeforeTagName
          //   this.sectionStart = this.index + 1
          // }
          break
      }

      this.index++
    }

    this.cleanup()
  }

  cleanup() {
    if (this.sectionStart < this.index) {
      if (this.state === State.Text) {
        this.cbs.onText(this.sectionStart, this.index)
        this.sectionStart = this.index
      }
    }
  }

  getPos(index) {
    return {
      column: index + 1,
      line: 1,
      offset: 0,
    }
  }
}
