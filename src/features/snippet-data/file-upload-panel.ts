import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "file-upload-panel",
  "title": "文件上传面板",
  "excerpt": "拖拽 + 多文件上传队列，带进度条、大小/类型校验与 toast 提示，适配后台素材管理场景。",
  "keywords": [
    "上传",
    "拖拽",
    "进度条",
    "toast"
  ],
  "detail": {
    "overview": "基于 react-dropzone 构建现代化上传面板，支持拖拽/点击/粘贴加入文件、实时进度模拟、大小与类型校验，并结合 sonner toast 展示反馈。列表按照素材类别分组展示，可手动重试、取消、清空队列，贴近真实后台的素材管理需求。",
    "implementation": [
      "使用 useDropzone 管理拖拽与选择文件，配置 accept、maxSize、maxFiles 实现白名单校验，onDropRejected 中给出错误提示。",
      "为每个文件生成唯一任务（nanoid + File 元信息），通过 setInterval 模拟上传进度；上传完成或失败时清理定时器并调用 toast。",
      "引入任务状态 uploading/success/error，对应展示进度条、错误文案以及重试/取消按钮；支持一次性清理成功任务或清空整个队列。",
      "根据文件类型映射到图片、文档、压缩包等分类 Section，方便在后台中分别查看素材；顶部概览区统计数量与总体积。"
    ],
    "notes": [
      "真是接入时可将模拟 interval 替换为真实 API，上报 progress 事件并监听完成/失败；任务状态可同步到服务端实现秒传。",
      "Toast 可改为全局通知或嵌入侧边栏提醒；上传文件较大时建议配合分片/断点续传方案，必要时展示更详细的日志。"
    ]
  },
  "codeExamples": [
    {
      "name": "Dropzone 配置",
      "language": "ts",
      "code": "const { getRootProps, getInputProps } = useDropzone({\n  accept: {\n    \"image/jpeg\": [],\n    \"image/png\": [],\n    \"application/pdf\": [],\n    \"application/zip\": [],\n  },\n  maxSize: 15 * 1024 * 1024,\n  maxFiles: 12,\n  multiple: true,\n  onDrop,\n  onDropRejected,\n})"
    },
    {
      "name": "模拟上传进度",
      "language": "ts",
      "code": "const startUpload = (taskId: string, file: File) => {\n  const timer = setInterval(() => {\n    let outcome: UploadStatus | null = null\n    setTasks((prev) =>\n      prev.map((task) => {\n        if (task.id !== taskId || task.status !== \"uploading\") return task\n        const next = Math.min(task.progress + Math.random() * 18 + 7, 100)\n        if (next >= 100) {\n          outcome = \"success\"\n          return { ...task, progress: 100, status: \"success\" }\n        }\n        return { ...task, progress: next }\n      }),\n    )\n    if (outcome) clearInterval(timer)\n  }, 480)\n}"
    }
  ],
  "resources": [
    {
      "title": "react-dropzone 文档",
      "url": "https://react-dropzone.js.org"
    },
    {
      "title": "sonner Toast",
      "url": "https://sonner.emilkowal.ski/"
    },
    {
      "title": "shadcn/ui Progress 组件",
      "url": "https://ui.shadcn.com/docs/components/progress"
    }
  ]
};
