import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "markdown-preview",
  "title": "Markdown 渲染预览",
  "excerpt": "自定义解析 Markdown 字符串，实时渲染为 React 组件。",
  "keywords": [
    "markdown",
    "文本格式",
    "解析"
  ],
  "detail": {
    "overview": "结合 react-markdown 和 remark-gfm 构建 Markdown 预览面板，支持 GFM 语法并与设计系统样式保持一致。",
    "implementation": [
      "通过受控 textarea 收集 Markdown 文本，并传递给 ReactMarkdown 实时渲染。",
      "接入 remark-gfm 插件以支持表格、删除线、自动链接等 GitHub 风格扩展语法。",
      "在 components 属性中重写标题、列表、引用、表格等节点，复用 Tailwind + shadcn 的视觉规范。",
      "对代码块使用自定义渲染函数，复用 CodeBlock 组件提供的语法高亮与复制功能。"
    ],
    "notes": [
      "ReactMarkdown 默认转义 HTML，若需直接渲染 HTML 需谨慎启用 rehype-raw 等插件并做好安全防护。",
      "可以继续链式扩展 remark/rehype 插件（如表情、任务列表勾选处理）以满足更多场景。"
    ]
  },
  "codeExamples": [
    {
      "name": "定制代码块渲染",
      "language": "tsx",
      "code": "const components: Components = {\n  code({ inline, className, children }) {\n    const language = /language-(\\w+)/.exec(className ?? \"\")?.[1]\n    if (inline) {\n      return <code className=\"bg-muted px-1\">{children}</code>\n    }\n    return <CodeBlock code={String(children)} language={language ?? \"tsx\"} />\n  },\n}"
    },
    {
      "name": "挂载 ReactMarkdown",
      "language": "tsx",
      "code": "<ReactMarkdown\n  remarkPlugins={[remarkGfm]}\n  components={components}\n>\n  {markdown}\n</ReactMarkdown>"
    }
  ],
  "resources": [
    {
      "title": "react-markdown 文档",
      "url": "https://github.com/remarkjs/react-markdown"
    },
    {
      "title": "remark-gfm",
      "url": "https://github.com/remarkjs/remark-gfm"
    }
  ]
};
