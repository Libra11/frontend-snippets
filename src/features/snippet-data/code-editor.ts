import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "code-editor",
  "title": "代码编辑器",
  "excerpt": "集成 Monaco Editor，提供语言模板、主题切换、迷你地图、自动换行与格式化等控制，打造类 VS Code 的在线编辑体验。",
  "keywords": [
    "Monaco Editor",
    "代码编辑器",
    "在线 IDE",
    "配置面板"
  ],
  "detail": {
    "overview": "利用 @monaco-editor/react 封装 VS Code 核心，实现一个具备模板切换、主题联动、字体尺寸调节与常用操作（格式化、复制、重置）的代码编辑面板，适合配置中心、脚本运行台等场景。",
    "implementation": [
      "准备多份语言模板示例，通过 useState 维护当前选中的模板以及用户编辑后的内容，实现不同文件的快速切换与独立暂存。",
      "借助 useTheme 获取站点当前主题，并提供“系统/浅色/深色”三种模式，自动映射到 Monaco 的 vs-light / vs-dark 主题。",
      "通过 useMemo 组合自动布局、字体大小、迷你地图、行号和自动换行等配置，传递给 Monaco Editor 的 options 属性以保持性能。",
      "在 onMount 中持有 editor 实例，调用 editor.action.formatDocument 完成格式化，同时结合 Clipboard API 实现一键复制与重置为示例内容。"
    ],
    "notes": [
      "如果在 SSR/动态导入环境（如 Next.js）使用 Monaco，需要在客户端渲染时再加载 @monaco-editor/react；本示例基于 Vite 可直接使用。",
      "生产环境可对输入做安全限制，例如只开放允许的语言、限制最大行数或者结合 JSON Schema 校验配置内容。"
    ]
  },
  "codeExamples": [
    {
      "name": "组合编辑器配置",
      "language": "ts",
      "code": "const editorOptions = useMemo(\n  () => ({\n    automaticLayout: true,\n    fontSize,\n    minimap: { enabled: showMinimap },\n    wordWrap: wordWrap ? \"on\" : \"off\",\n    lineNumbers: showLineNumbers ? \"on\" : \"off\",\n    padding: { top: 16, bottom: 16 },\n  }),\n  [fontSize, showLineNumbers, showMinimap, wordWrap],\n)"
    },
    {
      "name": "触发 Monaco 格式化命令",
      "language": "ts",
      "code": "const handleFormat = async () => {\n  const action = editorRef.current?.getAction(\"editor.action.formatDocument\")\n  if (!action) {\n    toast.info(\"当前语言不支持自动格式化\")\n    return\n  }\n  await action.run()\n  toast.success(\"已格式化当前代码\")\n}"
    }
  ],
  "resources": [
    {
      "title": "@monaco-editor/react 文档",
      "url": "https://github.com/suren-atoyan/monaco-react"
    },
    {
      "title": "Monaco Editor Playground",
      "url": "https://microsoft.github.io/monaco-editor/playground.html"
    },
    {
      "title": "VS Code 官方语言特性概览",
      "url": "https://code.visualstudio.com/docs/languages/overview"
    }
  ]
};
