import type { SnippetDefinition } from "./types";
import { CopyToClipboardSnippet } from "./copy-to-clipboard";
import { LazyImageGallerySnippet } from "./image-lazy-load";

export const snippets: SnippetDefinition[] = [
  {
    id: "copy-to-clipboard",
    title: "复制到剪贴板",
    excerpt: "一键复制文本、代码、链接，包含复制成功提示气泡。",
    keywords: ["复制", "交互反馈", "工具函数"],
    Component: CopyToClipboardSnippet,
    detail: {
      overview:
        "提供统一的复制按钮并处理跨浏览器兼容，支持文本、命令和链接等不同类型的内容，同时通过 Tooltip 实时展示拷贝结果反馈。",
      implementation: [
        "维护预置的复制目标数组，区分文本、代码、链接三种展示形式，便于扩展更多场景。",
        "优先调用 `navigator.clipboard.writeText` 完成复制操作，遇到不支持的浏览器时回退到 `document.execCommand('copy')`。",
        "使用局部状态记录复制结果并在 2 秒后自动清除，结合 Tooltip 呈现成功或失败的即时反馈。",
        "结合 Tailwind + shadcn Button 构建一致的交互样式，保持桌面和移动端的可用性。",
      ],
      notes: [
        "可根据业务需要将 copyTargets 改为从接口或配置文件加载，保持复用性。",
        "如需在 SSR 环境使用，记得条件判断 `window` 与 `navigator` 可用性。",
      ],
    },
    codeExamples: [
      {
        name: "核心复制逻辑",
        language: "ts",
        code: `const handleCopy = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return true
  }

  const textarea = document.createElement("textarea")
  textarea.value = value
  textarea.setAttribute("readonly", "")
  textarea.style.position = "absolute"
  textarea.style.left = "-9999px"
  document.body.appendChild(textarea)

  const selection = document.getSelection()
  const selected = selection?.rangeCount ? selection.getRangeAt(0) : null

  textarea.select()
  const success = document.execCommand("copy")
  document.body.removeChild(textarea)

  if (selected) {
    selection?.removeAllRanges()
    selection?.addRange(selected)
  }

  return success
}`,
      },
      {
        name: "反馈提示逻辑",
        language: "ts",
        code: `setFeedback({ id: targetId, status: "success" })
resetTimer.current = setTimeout(() => setFeedback(null), 2000)

const message = feedback?.status === "success" ? "复制成功" : "复制失败"`,
      },
    ],
    resources: [
      {
        title: "MDN: Clipboard API",
        url: "https://developer.mozilla.org/zh-CN/docs/Web/API/Clipboard",
      },
      {
        title: "shadcn/ui Tooltip 组件",
        url: "https://ui.shadcn.com/docs/components/tooltip",
      },
    ],
  },
  {
    id: "lazy-image",
    title: "图片懒加载",
    excerpt: "IntersectionObserver 监听视口，支持模糊占位与淡入过渡。",
    keywords: ["图片优化", "懒加载", "性能"],
    Component: LazyImageGallerySnippet,
    detail: {
      overview:
        "通过 IntersectionObserver 判断图片是否接近视口，真正需要时才请求原图；加载过程中使用模糊占位和淡入动画减轻闪烁，兼顾性能与体验。",
      implementation: [
        "容器作为观察目标，被观测到进入 rootMargin 区域后才切换到真实图片地址。",
        "自定义 LazyImage 组件封装 IntersectionObserver、模糊占位和加载完成的淡入过渡。",
        "利用原生 loading='lazy' 与模糊占位叠加，兼容不支持 IntersectionObserver 的浏览器时直接降级加载。",
        "通过 wrapperClassName / transitionDuration 等参数扩展，适配不同场景的布局与动效需求。",
      ],
      notes: [
        "生产环境可以将 placeholderSrc 替换为更轻量的 Base64 缩略图或 BlurHash。",
        "需要在 SSR 场景中判断 window/IntersectionObserver 是否可用，当前组件已做保护。",
      ],
    },
    codeExamples: [
      {
        name: "封装 LazyImage 组件",
        language: "tsx",
        code: `const observer = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    setIsVisible(true)
    observer.disconnect()
  }
}, { rootMargin })

if (!('IntersectionObserver' in window)) {
  setIsVisible(true)
}`,
      },
      {
        name: "在页面中使用",
        language: "tsx",
        code: `<LazyImage
  src={image.src}
  alt={image.alt}
  placeholderSrc={image.placeholder}
  className="h-64 w-full object-cover"
  transitionDuration={700}
/>`,
      },
    ],
    resources: [
      {
        title: "MDN: Intersection Observer API",
        url: "https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API",
      },
      {
        title: "Addy Osmani: Image Optimization for the Web",
        url: "https://web.dev/articles/progressive-web-apps#images",
      },
    ],
  },
];
