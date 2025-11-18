import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "rich-text-editor",
  "title": "富文本编辑器",
  "excerpt": "基于 TipTap 实现的富文本编辑器，提供常用排版与链接功能。",
  "keywords": [
    "富文本",
    "编辑器",
    "tiptap"
  ],
  "detail": {
    "overview": "集成 TipTap Starter Kit，支持标题、加粗、斜体、删除线、列表、引用、代码块、撤销重做等常用编辑功能，并提供工具栏与链接插入示例。",
    "implementation": [
      "通过 useEditor 创建 TipTap 实例，配置 Starter Kit 与 Link 扩展，设置编辑区的基础样式。",
      "构建工具栏按钮，调用 editor.chain().focus()...run() 切换不同的文本格式与列表。",
      "添加链接输入框，支持设置/移除链接，并自动扩展选区中的链接范围。",
      "在侧栏介绍快捷键与使用提示，便于二次封装成业务组件。"
    ],
    "notes": [
      "可按需接入 Markdown、Image、Table 等额外扩展，实现更完整的编辑体验。",
      "生产环境应考虑内容校验与粘贴过滤，防止不安全的 HTML。"
    ]
  },
  "codeExamples": [
    {
      "name": "初始化编辑器",
      "language": "tsx",
      "code": "const editor = useEditor({\n  extensions: [StarterKit, Link.configure({ openOnClick: false })],\n  content: initialHtml,\n})"
    },
    {
      "name": "工具栏示例",
      "language": "ts",
      "code": "editor.chain().focus().toggleBold().run()\neditor.chain().focus().toggleHeading({ level: 2 }).run()"
    },
    {
      "name": "插入链接",
      "language": "ts",
      "code": "editor.chain().focus().extendMarkRange(\"link\").setLink({ href: url }).run()"
    }
  ],
  "resources": [
    {
      "title": "TipTap 文档",
      "url": "https://tiptap.dev/"
    },
    {
      "title": "TipTap Link 扩展",
      "url": "https://tiptap.dev/api/extensions/link"
    }
  ]
};
