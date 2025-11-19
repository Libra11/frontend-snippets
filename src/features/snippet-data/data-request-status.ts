import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "data-request-status",
  "title": "数据请求状态板",
  "excerpt": "统一处理接口的加载、成功、空状态与错误兜底，让列表或仪表盘的请求体验更加一致。",
  "keywords": [
    "loading",
    "请求状态",
    "空状态",
    "错误处理"
  ],
  "detail": {
    "overview": "通过一个轻量的状态机管理 API 请求结果，并在视图层统一接入 Skeleton、空状态与错误处理。示例使用 mock 数据按钮模拟三种返回场景，展示如何共用一套状态与渲染逻辑。",
    "implementation": [
      "定义 RequestStatus 枚举与 STATUS_META 映射，管理加载、成功、空状态、错误四种视图及其文案。",
      "封装 handleRequest 统一处理 setLoading、清理定时器、延迟返回结果，并根据模式设置数据或错误提示。",
      "在 renderContent 中集中判断 status，分别返回 Skeleton 骨架、指标列表、空白提示和错误兜底，避免在主 JSX 中出现大量条件渲染。",
      "在操作区提供“重新请求”与不同场景按钮，方便演示如何复用同一套逻辑驱动不同接口结果。"
    ],
    "notes": [
      "真实项目可将请求逻辑抽出为自定义 Hook，统一暴露 status、data、error、refetch 等字段。",
      "骨架屏可以替换为专用 Skeleton 组件或 shimmer 动画；错误兜底可以接入工单系统或联系方式。"
    ]
  },
  "codeExamples": [
    {
      "name": "状态机定义",
      "language": "ts",
      "code": "type RequestStatus = \"idle\" | \"loading\" | \"success\" | \"empty\" | \"error\"\n\nconst STATUS_META: Record<RequestStatus, { label: string }> = {\n  idle: { label: \"等待请求\" },\n  loading: { label: \"加载中\" },\n  success: { label: \"加载成功\" },\n  empty: { label: \"内容为空\" },\n  error: { label: \"请求失败\" },\n}"
    },
    {
      "name": "集中渲染四种视图",
      "language": "tsx",
      "code": "function renderContent(\n  status: RequestStatus,\n  records: InsightRecord[],\n  message?: string,\n) {\n  if (status === \"loading\") {\n    return <LoadingSkeleton />\n  }\n\n  if (status === \"success\") {\n    return <InsightList items={records} />\n  }\n\n  if (status === \"empty\") {\n    return <EmptyPlaceholder />\n  }\n\n  if (status === \"error\") {\n    return <ErrorFallback message={message ?? \"请求失败\"} />\n  }\n\n  return <PendingBlock />\n}"
    }
  ],
  "resources": [
    {
      "title": "React 文档：管理多重状态",
      "url": "https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state"
    },
    {
      "title": "Kent C. Dodds：打造可靠的加载与错误界面",
      "url": "https://kentcdodds.com/blog/handling-async-state-in-ui"
    },
    {
      "title": "shadcn/ui Button 组件",
      "url": "https://ui.shadcn.com/docs/components/button"
    }
  ]
};
