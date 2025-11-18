import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "notification-toasts",
  "title": "通知提示合集",
  "excerpt": "基于 sonner 的全局通知组件，涵盖成功、警告、加载等常见场景，并支持自定义图标与动作按钮。",
  "keywords": [
    "toast",
    "通知",
    "反馈"
  ],
  "detail": {
    "overview": "使用 sonner 构建一致性的全局通知中心。封装多个语义预设，结合 action、duration、promise 等能力，帮助产品在不同场景下提供即时反馈。",
    "implementation": [
      "在应用根节点挂载 shadcn 封装的 Toaster，并根据当前主题切换 light/dark 外观。",
      "维护通知预设数组，统一描述标题、图标与描述文字，点击按钮时直接调用 toast API。",
      "利用 toast.loading + toast.dismiss、toast.promise 展示异步任务的起止状态，保证反馈连贯。",
      "示例中展示 action、自定义图标、持续时长等配置，便于拓展成 Notification Center。"
    ],
    "notes": [
      "sonner 本身支持队列和分组，可在复杂项目中结合业务 ID 控制去重与更新。",
      "若需要更丰富的布局，可传入 React 节点作为 toast 内容，与 UI 系统保持一致。"
    ]
  },
  "codeExamples": [
    {
      "name": "基础成功提示",
      "language": "ts",
      "code": "toast.success(\"发布成功\", {\n  description: \"内容已同步至所有渠道\",\n  duration: 3800,\n})"
    },
    {
      "name": "异步任务状态",
      "language": "ts",
      "code": "const toastId = toast.loading(\"正在同步资源...\", { duration: 10000 })\n\nsetTimeout(() => {\n  toast.success(\"同步完成\", { duration: 3800 })\n  toast.dismiss(toastId)\n}, 2600)"
    },
    {
      "name": "Promise 语法糖",
      "language": "ts",
      "code": "toast.promise(fetchReport(), {\n  loading: \"报告生成中...\",\n  success: \"报告已准备好\",\n  error: \"生成失败，请稍后重试\",\n})"
    }
  ],
  "resources": [
    {
      "title": "sonner 官方文档",
      "url": "https://sonner.emilkowal.ski/"
    },
    {
      "title": "shadcn/ui Sonner 集成说明",
      "url": "https://ui.shadcn.com/docs/components/sonner"
    }
  ]
};
