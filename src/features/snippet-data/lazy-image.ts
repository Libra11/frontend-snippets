import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "lazy-image",
  "title": "图片懒加载",
  "excerpt": "IntersectionObserver 监听视口，支持模糊占位与淡入过渡。",
  "keywords": [
    "图片优化",
    "懒加载",
    "性能"
  ],
  "detail": {
    "overview": "通过 IntersectionObserver 判断图片是否接近视口，真正需要时才请求原图；加载过程中使用模糊占位和淡入动画减轻闪烁，兼顾性能与体验。",
    "implementation": [
      "容器作为观察目标，被观测到进入 rootMargin 区域后才切换到真实图片地址。",
      "自定义 LazyImage 组件封装 IntersectionObserver、模糊占位和加载完成的淡入过渡。",
      "利用原生 loading='lazy' 与模糊占位叠加，兼容不支持 IntersectionObserver 的浏览器时直接降级加载。",
      "通过 wrapperClassName / transitionDuration 等参数扩展，适配不同场景的布局与动效需求。"
    ],
    "notes": [
      "生产环境可以将 placeholderSrc 替换为更轻量的 Base64 缩略图或 BlurHash。",
      "需要在 SSR 场景中判断 window/IntersectionObserver 是否可用，当前组件已做保护。"
    ]
  },
  "codeExamples": [
    {
      "name": "封装 LazyImage 组件",
      "language": "tsx",
      "code": "const observer = new IntersectionObserver((entries) => {\n  if (entries.some((entry) => entry.isIntersecting)) {\n    setIsVisible(true)\n    observer.disconnect()\n  }\n}, { rootMargin })\n\nif (!('IntersectionObserver' in window)) {\n  setIsVisible(true)\n}"
    },
    {
      "name": "在页面中使用",
      "language": "tsx",
      "code": "<LazyImage\n  src={image.src}\n  alt={image.alt}\n  placeholderSrc={image.placeholder}\n  className=\"h-64 w-full object-cover\"\n  transitionDuration={700}\n/>"
    }
  ],
  "resources": [
    {
      "title": "MDN: Intersection Observer API",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API"
    },
    {
      "title": "Addy Osmani: Image Optimization for the Web",
      "url": "https://web.dev/articles/progressive-web-apps#images"
    }
  ]
};
