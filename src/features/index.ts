import type { SnippetDefinition } from "./types";
import { CopyToClipboardSnippet } from "./copy-to-clipboard";
import { DebounceThrottleInputSnippet } from "./debounce-throttle-input";
import { CountdownTimerSnippet } from "./countdown-timer";
import { LazyImageGallerySnippet } from "./image-lazy-load";
import { MarkdownPreviewSnippet } from "./markdown-preview";
import { ScrollToTopSnippet } from "./scroll-to-top";
import { ThemeToggleSnippet } from "./theme-toggle";

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
    id: "debounce-throttle-input",
    title: "防抖/节流输入框",
    excerpt: "同一输入框分离即时值、防抖值与节流值，兼顾搜索体验与接口防刷。",
    keywords: ["防抖", "节流", "输入"],
    Component: DebounceThrottleInputSnippet,
    detail: {
      overview:
        "展示如何在单个输入组件中同时维护即时输入、防抖值与节流值：防抖值触发搜索接口，节流值用于日志/防刷上报，避免重复请求并兼顾体验。",
      implementation: [
        "受控输入在 onChange 中立即更新本地 state，用于即时 UI 渲染。",
        "防抖逻辑通过 setTimeout + 清理函数延迟同步值，只有用户停顿超过设定毫秒数才触发搜索请求。",
        "节流逻辑记录最后执行时间并维护 trailing value，确保接口/埋点调用按固定间隔发送。",
        "分别维护触发日志与状态提示，清晰呈现两种节奏下的执行结果，便于排查问题。",
      ],
      notes: [
        "在 SSR/微前端环境中使用 window、setTimeout 前需判断是否处于浏览器端。",
        "若用户开启 reduced motion，可缩短或移除滚动/动画反馈，保持一致体验。",
      ],
    },
    codeExamples: [
      {
        name: "基础防抖 Hook",
        language: "ts",
        code: `function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}`,
      },
      {
        name: "节流执行器",
        language: "ts",
        code: `const lastRun = useRef(0)
const pending = useRef<ReturnType<typeof setTimeout> | null>(null)

const run = (value: string) => {
  const now = Date.now()
  const remaining = interval - (now - lastRun.current)

  if (remaining <= 0) {
    lastRun.current = now
    callback(value)
  } else {
    if (pending.current) clearTimeout(pending.current)
    pending.current = setTimeout(() => {
      lastRun.current = Date.now()
      callback(value)
      pending.current = null
    }, remaining)
  }
}`,
      },
    ],
    resources: [
      {
        title: "CSS-Tricks: Debouncing and Throttling Explained",
        url: "https://css-tricks.com/debouncing-throttling-explained-examples/",
      },
      {
        title: "MDN: setTimeout",
        url: "https://developer.mozilla.org/zh-CN/docs/Web/API/setTimeout",
      },
      {
        title: "Jake Archibald: In defence of throttling",
        url: "https://jakearchibald.com/2016/throttling-and-debouncing/",
      },
    ],
  },
  {
    id: "countdown-worker",
    title: "Web Worker 倒计时",
    excerpt: "将倒计时逻辑移入 Web Worker，保持主线程繁忙时依然准确的计时体验。",
    keywords: ["倒计时", "Web Worker", "性能"],
    Component: CountdownTimerSnippet,
    detail: {
      overview:
        "倒计时状态完全交由 Web Worker 管理，主线程只负责渲染 UI。当页面执行动画、网络请求或重渲染时，计时仍然精确，适合番茄钟、抢购倒计时等高可靠场景。",
      implementation: [
        "Worker 中以 setInterval 维护剩余秒数，所有状态变化统一通过 postMessage 推送至主线程。",
        "主线程以消息驱动的方式同步倒计时状态、总时长与时间戳，并根据状态变化生成操作日志。",
        "React 组件提供滑块与预设快捷键控制目标时长，并在运行时禁用可修改项防止状态错乱。",
        "控制按钮会向 Worker 发送 start/pause/resume/reset 指令，保持操作与计时逻辑解耦。",
      ],
      notes: [
        "若需要声音提醒或通知，可在收到 Worker 的 finished 状态时触发，避免在 Worker 内直接操作 DOM。",
        "在页面卸载或组件销毁时记得 terminate Worker，避免后台持续计时造成资源浪费。",
      ],
    },
    codeExamples: [
      {
        name: "Worker 端计时循环",
        language: "ts",
        code: `ctx.addEventListener("message", (event) => {
  if (event.data.type === "start") {
    totalSeconds = Math.floor(event.data.payload.duration)
    remainingSeconds = totalSeconds
    status = totalSeconds > 0 ? "running" : "finished"
    ctx.postMessage({ type: "update", payload: { status, total: totalSeconds, remaining: remainingSeconds, timestamp: Date.now() } })
    scheduleTick()
  }
})

const scheduleTick = () => {
  clearInterval(timer)
  if (status !== "running") return

  timer = ctx.setInterval(() => {
    remainingSeconds = Math.max(remainingSeconds - 1, 0)
    const nextStatus = remainingSeconds === 0 ? "finished" : "running"
    if (nextStatus !== status) status = nextStatus
    ctx.postMessage({ type: "update", payload: { status, total: totalSeconds, remaining: remainingSeconds, timestamp: Date.now() } })
    if (remainingSeconds === 0) clearInterval(timer)
  }, 1000)
}`,
      },
      {
        name: "组件内接收 Worker 状态",
        language: "tsx",
        code: `useEffect(() => {
  const worker = new Worker(new URL("./countdown.worker.ts", import.meta.url), { type: "module" })
  workerRef.current = worker

  const handleMessage = (event: MessageEvent<CountdownWorkerMessage>) => {
    if (event.data.type !== "update") return
    const { status, remaining, total } = event.data.payload
    setStatus(status)
    setRemainingSeconds(remaining)
    setTotalSeconds(total)
  }

  worker.addEventListener("message", handleMessage)
  return () => {
    worker.removeEventListener("message", handleMessage)
    worker.terminate()
  }
}, [])

const postCommand = (command: CountdownWorkerCommand) => {
  workerRef.current?.postMessage(command)
}`,
      },
    ],
    resources: [
      {
        title: "MDN: Web Workers API",
        url: "https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers",
      },
      {
        title: "Vite 官方文档：Web Workers",
        url: "https://cn.vitejs.dev/guide/features.html#web-workers",
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
  {
    id: "theme-toggle",
    title: "主题切换",
    excerpt: "全局深浅色切换按钮，自适应系统偏好并持久化用户选择。",
    keywords: ["主题", "暗黑模式", "全局状态"],
    Component: ThemeToggleSnippet,
    detail: {
      overview:
        "封装 useTheme 钩子管理全局主题状态，结合 ThemeToggle 组件完成 color-scheme、document.class 与 localStorage 同步，支持系统偏好变化自动切换。",
      implementation: [
        "useSyncExternalStore 订阅主题变更，确保多组件同时响应且避免 hydration mismatch。",
        "初始渲染根据 localStorage 与 prefers-color-scheme 设定 document.documentElement.className、color-scheme。",
        "ThemeToggle 组件内使用 SVG 动画切换图标，保证无跳闪的过渡体验。",
        "对 Safari 兼容 media query 监听，支持 addListener / addEventListener 双方案。",
      ],
      notes: [
        "需要在 Tailwind 配置启用 dark variant 或使用 CSS 自定义变量适配暗色。",
        "可拓展主题种类，例如添加 dim、system 模式等，只需在 store 扩展枚举并更新 UI。",
      ],
    },
    codeExamples: [
      {
        name: "使用主题 Hook",
        language: "tsx",
        code: `const { theme, toggleTheme } = useTheme()

return (
  <Button onClick={toggleTheme}>
    当前主题: {theme}
  </Button>
)`,
      },
      {
        name: "封装的 useTheme",
        language: "ts",
        code: `const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light")

const toggleTheme = useCallback(() => {
  setThemeValue(theme === "dark" ? "light" : "dark")
}, [theme])`,
      },
    ],
    resources: [
      {
        title: "React Docs: useSyncExternalStore",
        url: "https://react.dev/reference/react/useSyncExternalStore",
      },
      {
        title: "CSS Color Scheme",
        url: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/color-scheme",
      },
    ],
  },
  {
    id: "markdown-preview",
    title: "Markdown 渲染预览",
    excerpt: "自定义解析 Markdown 字符串，实时渲染为 React 组件。",
    keywords: ["markdown", "文本格式", "解析"],
    Component: MarkdownPreviewSnippet,
    detail: {
      overview:
        "结合 react-markdown 和 remark-gfm 构建 Markdown 预览面板，支持 GFM 语法并与设计系统样式保持一致。",
      implementation: [
        "通过受控 textarea 收集 Markdown 文本，并传递给 ReactMarkdown 实时渲染。",
        "接入 remark-gfm 插件以支持表格、删除线、自动链接等 GitHub 风格扩展语法。",
        "在 components 属性中重写标题、列表、引用、表格等节点，复用 Tailwind + shadcn 的视觉规范。",
        "对代码块使用自定义渲染函数，复用 CodeBlock 组件提供的语法高亮与复制功能。",
      ],
      notes: [
        "ReactMarkdown 默认转义 HTML，若需直接渲染 HTML 需谨慎启用 rehype-raw 等插件并做好安全防护。",
        "可以继续链式扩展 remark/rehype 插件（如表情、任务列表勾选处理）以满足更多场景。",
      ],
    },
    codeExamples: [
      {
        name: "定制代码块渲染",
        language: "tsx",
        code: `const components: Components = {
  code({ inline, className, children }) {
    const language = /language-(\\w+)/.exec(className ?? "")?.[1]
    if (inline) {
      return <code className="bg-muted px-1">{children}</code>
    }
    return <CodeBlock code={String(children)} language={language ?? "tsx"} />
  },
}`,
      },
      {
        name: "挂载 ReactMarkdown",
        language: "tsx",
        code: `<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={components}
>
  {markdown}
</ReactMarkdown>`,
      },
    ],
    resources: [
      {
        title: "react-markdown 文档",
        url: "https://github.com/remarkjs/react-markdown",
      },
      {
        title: "remark-gfm",
        url: "https://github.com/remarkjs/remark-gfm",
      },
    ],
  },
  {
    id: "scroll-to-top",
    title: "滚动到顶部按钮",
    excerpt: "滚动一段距离后自动浮现的返回顶部按钮，支持平滑动画与容器适配。",
    keywords: ["滚动", "浮动按钮", "交互反馈"],
    Component: ScrollToTopSnippet,
    detail: {
      overview:
        "封装可复用的 Scroll To Top 控件，自动监听滚动位置高亮入口，点击后以平滑动画将视图带回顶部，同时兼容整页与局部滚动场景。",
      implementation: [
        "监听目标容器的 scrollTop/scrollY，当超过预设阈值时切换按钮的显隐状态。",
        "通过透明度与位移动画处理显隐过渡，避免遮挡内容的同时提供视觉反馈。",
        "点击调用 `scrollTo({ behavior: 'smooth' })` 平滑回到顶部，不支持时退化为直接设置 scrollTop。",
        "暴露阈值、滚动容器与样式配置，使组件可在全局布局或局部面板中复用。",
      ],
      notes: [
        "在 SSR 或微前端场景中使用时需判断 window 是否存在再绑定事件。",
        "如项目已开启 CSS 全局平滑滚动，可适当下调阈值或调整动画，避免重复效果。",
      ],
    },
    codeExamples: [
      {
        name: "页面级使用",
        language: "tsx",
        code: `import { ScrollToTopButton } from "@/components/scroll-to-top-button"

export function Layout() {
  return (
    <div className="min-h-screen">
      {/* 页面内容 */}
      <ScrollToTopButton />
    </div>
  )
}`,
      },
      {
        name: "嵌入滚动容器",
        language: "tsx",
        code: `import { useCallback, useRef } from "react"
import { ScrollToTopButton } from "@/components/scroll-to-top-button"

export function ScrollablePanel() {
  const panelRef = useRef<HTMLDivElement>(null)
  const getContainer = useCallback(() => panelRef.current, [])

  return (
    <div ref={panelRef} className="relative h-[480px] overflow-y-auto">
      {/* 内容 */}
      <ScrollToTopButton
        getScrollContainer={getContainer}
        threshold={160}
        className="absolute bottom-4 right-4"
        buttonClassName="bg-primary text-primary-foreground"
      />
    </div>
  )
}`,
      },
    ],
    resources: [
      {
        title: "MDN: Window.scrollTo",
        url: "https://developer.mozilla.org/zh-CN/docs/Web/API/Window/scrollTo",
      },
      {
        title: "MDN: Element.scrollTo",
        url: "https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollTo",
      },
      {
        title: "CSS Tricks: Smooth Scrolling",
        url: "https://css-tricks.com/snippets/jquery/smooth-scrolling/",
      },
    ],
  },
];
