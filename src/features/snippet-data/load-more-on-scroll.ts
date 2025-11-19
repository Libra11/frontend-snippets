import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "load-more-on-scroll",
  "title": "下拉加载更多",
  "excerpt": "在限定高度的 Feed 内设置滚动监听，列表滑到底部后自动拉取下一批数据，并带有失败重试与手动触发入口。",
  "keywords": [
    "无限滚动",
    "IntersectionObserver",
    "下拉加载"
  ],
  "detail": {
    "overview": "模拟“下拉加载更多”体验：容器内嵌一个 sentinel，借助 IntersectionObserver 监听其可见性，一旦出现在视口内即触发模拟请求；加载成功时拼接下一批卡片，失败则展示错误提示并允许继续下拉或点击按钮重试。",
    "implementation": [
      "准备 16 条增长动态，并按 `LOAD_STEP` 切片；`visibleCount` 控制当前展示条数，配合进度条提示已加载比例。",
      "自定义 `loadStatus`（idle/loading/error），`setTimeout` 模拟远端延迟并以 18% 概率抛错，展示真实的失败场景。",
      "以容器元素作为 IntersectionObserver 的 root，监听底部 sentinel；当 `hasMore` 为 false 时自动注销监听，避免重复请求。",
      "提供手动 `Button` 作为兜底入口，若浏览器不支持 IntersectionObserver 或用户关闭自动加载时仍可点击追加数据。"
    ],
    "notes": [
      "长列表需要及时解绑 IntersectionObserver 并在组件卸载时清理定时器，防止内存泄漏。",
      "在真实接口中应避免一次性加载过多数据，可结合分页 token 或 cursor；同时做好空列表与“到底了”的视觉反馈。",
      "如需兼容旧浏览器，可在不支持 IntersectionObserver 时自动降级为按钮触发方案。"
    ]
  },
  "codeExamples": [
    {
      "name": "IntersectionObserver 监听底部",
      "language": "ts",
      "code": "useEffect(() => {\n  if (!hasMore) return\n  const container = containerRef.current\n  const sentinel = sentinelRef.current\n  if (!container || !sentinel) return\n  const observer = new IntersectionObserver(\n    (entries) => {\n      if (entries[0]?.isIntersecting) {\n        loadMore()\n      }\n    },\n    { root: container, threshold: 0.15, rootMargin: \"80px\" },\n  )\n  observer.observe(sentinel)\n  return () => observer.disconnect()\n}, [hasMore, loadMore])"
    },
    {
      "name": "模拟拉取下一批数据",
      "language": "ts",
      "code": "const loadMore = useCallback(() => {\n  if (!hasMore || status === \"loading\") return\n  setStatus(\"loading\")\n  setError(null)\n  timeoutRef.current = window.setTimeout(() => {\n    const shouldFail = Math.random() < 0.18\n    if (shouldFail) {\n      setStatus(\"error\")\n      setError(\"网络抖动，请重试\")\n      return\n    }\n    setVisibleCount((prev) => Math.min(prev + LOAD_STEP, total))\n    setStatus(\"idle\")\n  }, 900)\n}, [hasMore, status, total])"
    }
  ],
  "resources": [
    {
      "title": "MDN: IntersectionObserver",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API"
    },
    {
      "title": "web.dev: Infinite scroll UX",
      "url": "https://web.dev/learn/pwa/infinite-scroll"
    },
    {
      "title": "CSS-Tricks: Infinite Scrolling Article Lists",
      "url": "https://css-tricks.com/infinite-scrolling-article-listing/"
    }
  ]
};
