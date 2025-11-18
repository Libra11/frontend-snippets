import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "command-palette",
  "title": "命令面板",
  "excerpt": "基于 cmdk + shadcn 构建全局搜索与快捷操作入口，支持模糊检索、快捷键与最近项目。",
  "keywords": [
    "命令面板",
    "全局搜索",
    "快捷键",
    "cmdk"
  ],
  "detail": {
    "overview": "借助 cmdk 的高性能列表过滤与 shadcn/ui 命令组件封装，实现类似 Linear、Vercel 的全局命令面板：支持键盘快捷键唤起、路由导航、快捷操作以及最近项目回访，并在选择后提供即时反馈。",
    "implementation": [
      "封装 CommandDialog 组件，将 cmdk 与 Radix Dialog 结合，确保命令面板具备键盘可达性与光晕效果。",
      "维护应用路由、快捷操作、最近项目三类数据，分别渲染 CommandGroup 并附带说明文字与快捷键信息。",
      "在 useEffect 中监听 ⌘K / Ctrl+K 快捷键，随时打开或关闭命令面板，保持与桌面应用一致的操作体验。",
      "CommandItem 的 onSelect 中可触发实际的路由跳转或业务逻辑，示例里通过 toast 提示展示导航结果，并动态更新最近项目列表。"
    ],
    "notes": [
      "生产环境可以结合路由库（如 react-router、next/navigation）在 onSelect 中执行 push/replace。",
      "可扩展为多级命令、命令输入参数或服务器搜索；若数据量较大，可在输入时触发接口请求。"
    ]
  },
  "codeExamples": [
    {
      "name": "键盘快捷键唤起",
      "language": "ts",
      "code": "useEffect(() => {\n  const handleKeyDown = (event: KeyboardEvent) => {\n    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === \"k\") {\n      event.preventDefault()\n      setOpen((prev) => !prev)\n    }\n  }\n  window.addEventListener(\"keydown\", handleKeyDown)\n  return () => window.removeEventListener(\"keydown\", handleKeyDown)\n}, [])"
    },
    {
      "name": "命令项选择回调",
      "language": "ts",
      "code": "const handleRouteSelect = (route: RouteItem) => {\n  toast.success(`已跳转到 ${route.label}`, {\n    description: `模拟访问 ${route.href}`,\n  })\n  setOpen(false)\n}"
    }
  ],
  "resources": [
    {
      "title": "cmdk 文档",
      "url": "https://cmdk.paco.me/"
    },
    {
      "title": "shadcn/ui Command 组件",
      "url": "https://ui.shadcn.com/docs/components/command"
    }
  ]
};
