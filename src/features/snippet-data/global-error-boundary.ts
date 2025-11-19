import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "global-error-boundary",
  "title": "全局错误捕获",
  "excerpt": "用 ErrorBoundary 兜底 React 树，阻止白屏并提供重试/上报机制。",
  "keywords": [
    "错误监控",
    "稳定性",
    "兜底 UI"
  ],
  "detail": {
    "overview": "AppErrorBoundary 统一包裹 React 树，捕获渲染阶段抛出的异常，自定义 fallback 提示并暴露 reset 钩子以便重新挂载或发起自愈逻辑。",
    "implementation": [
      "继承自 React.Component，借助 getDerivedStateFromError + componentDidCatch 捕获错误并记录日志。",
      "fallback 函数拿到 error / resetError，可自定义兜底面板、埋点上报、提供操作按钮。",
      "全局入口（main.tsx）在 StrictMode 外层包裹 App，确保任意 Snippet 出错不会导致页面整体崩溃。"
    ],
    "notes": [
      "componentDidCatch 内可接入 Sentry/自建监控，将 error 信息与环境上下文上报。",
      "对 Suspense / 异步数据建议结合 React.lazy + ErrorBoundary，分别兜底加载与异常。"
    ]
  },
  "codeExamples": [
    {
      "name": "全局包裹",
      "language": "tsx",
      "code": "createRoot(root).render(\n  <StrictMode>\n    <AppErrorBoundary>\n      <App />\n    </AppErrorBoundary>\n  </StrictMode>\n)"
    },
    {
      "name": "自定义 fallback",
      "language": "tsx",
      "code": "const Fallback = ({ error, resetError }: ErrorBoundaryFallbackProps) => (\n  <div>\n    <p>抱歉，模块加载失败：{error.message}</p>\n    <Button onClick={resetError}>重试</Button>\n  </div>\n)\n\n<AppErrorBoundary fallback={Fallback}>\n  <Dashboard />\n</AppErrorBoundary>"
    }
  ],
  "resources": [
    {
      "title": "React Docs: Error Boundaries",
      "url": "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary"
    },
    {
      "title": "Sentry + ErrorBoundary 集成",
      "url": "https://docs.sentry.io/platforms/javascript/guides/react/enriching-events/error-boundaries/"
    }
  ]
};
