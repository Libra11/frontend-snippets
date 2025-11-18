import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "scroll-to-top",
  "title": "滚动到顶部按钮",
  "excerpt": "滚动一段距离后自动浮现的返回顶部按钮，支持平滑动画与容器适配。",
  "keywords": [
    "滚动",
    "浮动按钮",
    "交互反馈"
  ],
  "detail": {
    "overview": "封装可复用的 Scroll To Top 控件，自动监听滚动位置高亮入口，点击后以平滑动画将视图带回顶部，同时兼容整页与局部滚动场景。",
    "implementation": [
      "监听目标容器的 scrollTop/scrollY，当超过预设阈值时切换按钮的显隐状态。",
      "通过透明度与位移动画处理显隐过渡，避免遮挡内容的同时提供视觉反馈。",
      "点击调用 `scrollTo({ behavior: 'smooth' })` 平滑回到顶部，不支持时退化为直接设置 scrollTop。",
      "暴露阈值、滚动容器与样式配置，使组件可在全局布局或局部面板中复用。"
    ],
    "notes": [
      "在 SSR 或微前端场景中使用时需判断 window 是否存在再绑定事件。",
      "如项目已开启 CSS 全局平滑滚动，可适当下调阈值或调整动画，避免重复效果。"
    ]
  },
  "codeExamples": [
    {
      "name": "页面级使用",
      "language": "tsx",
      "code": "import { ScrollToTopButton } from \"@/components/scroll-to-top-button\"\n\nexport function Layout() {\n  return (\n    <div className=\"min-h-screen\">\n      {/* 页面内容 */}\n      <ScrollToTopButton />\n    </div>\n  )\n}"
    },
    {
      "name": "嵌入滚动容器",
      "language": "tsx",
      "code": "import { useCallback, useRef } from \"react\"\nimport { ScrollToTopButton } from \"@/components/scroll-to-top-button\"\n\nexport function ScrollablePanel() {\n  const panelRef = useRef<HTMLDivElement>(null)\n  const getContainer = useCallback(() => panelRef.current, [])\n\n  return (\n    <div ref={panelRef} className=\"relative h-[480px] overflow-y-auto\">\n      {/* 内容 */}\n      <ScrollToTopButton\n        getScrollContainer={getContainer}\n        threshold={160}\n        className=\"absolute bottom-4 right-4\"\n        buttonClassName=\"bg-primary text-primary-foreground\"\n      />\n    </div>\n  )\n}"
    }
  ],
  "resources": [
    {
      "title": "MDN: Window.scrollTo",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Window/scrollTo"
    },
    {
      "title": "MDN: Element.scrollTo",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollTo"
    },
    {
      "title": "CSS Tricks: Smooth Scrolling",
      "url": "https://css-tricks.com/snippets/jquery/smooth-scrolling/"
    }
  ]
};
