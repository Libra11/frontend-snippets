/*
 * @Author: Libra
 * @Date: 2025-11-02 20:54:54
 * @LastEditors: Libra
 * @Description:
 */
import type { SnippetDefinition } from "./types";
import { CommandPaletteSnippet } from "./command-palette";
import { CodeEditorSnippet } from "./code-editor";
import { CopyToClipboardSnippet } from "./copy-to-clipboard";
import { DebounceThrottleInputSnippet } from "./debounce-throttle-input";
import { CountdownTimerSnippet } from "./countdown-timer";
import { DraggableSortableListSnippet } from "./draggable-sortable-list";
import { DataRequestStatusSnippet } from "./data-request-status";
import { DynamicFormSnippet } from "./dynamic-form";
import { FileUploadPanelSnippet } from "./file-upload-panel";
import { I18nLanguageSwitcherSnippet } from "./i18n-language-switcher";
import { LazyImageGallerySnippet } from "./image-lazy-load";
import { NotificationToastsSnippet } from "./notification-toasts";
import { QrGeneratorSnippet } from "./qr-generator";
import { RichTextEditorSnippet } from "./rich-text-editor";
import { MarkdownPreviewSnippet } from "./markdown-preview";
import { ScrollToTopSnippet } from "./scroll-to-top";
import { StepperFormSnippet } from "./stepper-form";
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
    id: "command-palette",
    title: "命令面板",
    excerpt: "基于 cmdk + shadcn 构建全局搜索与快捷操作入口，支持模糊检索、快捷键与最近项目。",
    keywords: ["命令面板", "全局搜索", "快捷键", "cmdk"],
    Component: CommandPaletteSnippet,
    detail: {
      overview:
        "借助 cmdk 的高性能列表过滤与 shadcn/ui 命令组件封装，实现类似 Linear、Vercel 的全局命令面板：支持键盘快捷键唤起、路由导航、快捷操作以及最近项目回访，并在选择后提供即时反馈。",
      implementation: [
        "封装 CommandDialog 组件，将 cmdk 与 Radix Dialog 结合，确保命令面板具备键盘可达性与光晕效果。",
        "维护应用路由、快捷操作、最近项目三类数据，分别渲染 CommandGroup 并附带说明文字与快捷键信息。",
        "在 useEffect 中监听 ⌘K / Ctrl+K 快捷键，随时打开或关闭命令面板，保持与桌面应用一致的操作体验。",
        "CommandItem 的 onSelect 中可触发实际的路由跳转或业务逻辑，示例里通过 toast 提示展示导航结果，并动态更新最近项目列表。",
      ],
      notes: [
        "生产环境可以结合路由库（如 react-router、next/navigation）在 onSelect 中执行 push/replace。",
        "可扩展为多级命令、命令输入参数或服务器搜索；若数据量较大，可在输入时触发接口请求。",
      ],
    },
    codeExamples: [
      {
        name: "键盘快捷键唤起",
        language: "ts",
        code: `useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault()
      setOpen((prev) => !prev)
    }
  }
  window.addEventListener("keydown", handleKeyDown)
  return () => window.removeEventListener("keydown", handleKeyDown)
}, [])`,
      },
      {
        name: "命令项选择回调",
        language: "ts",
        code: `const handleRouteSelect = (route: RouteItem) => {
  toast.success(\`已跳转到 \${route.label}\`, {
    description: \`模拟访问 \${route.href}\`,
  })
  setOpen(false)
}`,
      },
    ],
    resources: [
      {
        title: "cmdk 文档",
        url: "https://cmdk.paco.me/",
      },
      {
        title: "shadcn/ui Command 组件",
        url: "https://ui.shadcn.com/docs/components/command",
      },
    ],
  },
  {
    id: "code-editor",
    title: "代码编辑器",
    excerpt: "集成 Monaco Editor，提供语言模板、主题切换、迷你地图、自动换行与格式化等控制，打造类 VS Code 的在线编辑体验。",
    keywords: ["Monaco Editor", "代码编辑器", "在线 IDE", "配置面板"],
    Component: CodeEditorSnippet,
    detail: {
      overview:
        "利用 @monaco-editor/react 封装 VS Code 核心，实现一个具备模板切换、主题联动、字体尺寸调节与常用操作（格式化、复制、重置）的代码编辑面板，适合配置中心、脚本运行台等场景。",
      implementation: [
        "准备多份语言模板示例，通过 useState 维护当前选中的模板以及用户编辑后的内容，实现不同文件的快速切换与独立暂存。",
        "借助 useTheme 获取站点当前主题，并提供“系统/浅色/深色”三种模式，自动映射到 Monaco 的 vs-light / vs-dark 主题。",
        "通过 useMemo 组合自动布局、字体大小、迷你地图、行号和自动换行等配置，传递给 Monaco Editor 的 options 属性以保持性能。",
        "在 onMount 中持有 editor 实例，调用 editor.action.formatDocument 完成格式化，同时结合 Clipboard API 实现一键复制与重置为示例内容。",
      ],
      notes: [
        "如果在 SSR/动态导入环境（如 Next.js）使用 Monaco，需要在客户端渲染时再加载 @monaco-editor/react；本示例基于 Vite 可直接使用。",
        "生产环境可对输入做安全限制，例如只开放允许的语言、限制最大行数或者结合 JSON Schema 校验配置内容。",
      ],
    },
    codeExamples: [
      {
        name: "组合编辑器配置",
        language: "ts",
        code: `const editorOptions = useMemo(
  () => ({
    automaticLayout: true,
    fontSize,
    minimap: { enabled: showMinimap },
    wordWrap: wordWrap ? "on" : "off",
    lineNumbers: showLineNumbers ? "on" : "off",
    padding: { top: 16, bottom: 16 },
  }),
  [fontSize, showLineNumbers, showMinimap, wordWrap],
)`,
      },
      {
        name: "触发 Monaco 格式化命令",
        language: "ts",
        code: `const handleFormat = async () => {
  const action = editorRef.current?.getAction("editor.action.formatDocument")
  if (!action) {
    toast.info("当前语言不支持自动格式化")
    return
  }
  await action.run()
  toast.success("已格式化当前代码")
}`,
      },
    ],
    resources: [
      {
        title: "@monaco-editor/react 文档",
        url: "https://github.com/suren-atoyan/monaco-react",
      },
      {
        title: "Monaco Editor Playground",
        url: "https://microsoft.github.io/monaco-editor/playground.html",
      },
      {
        title: "VS Code 官方语言特性概览",
        url: "https://code.visualstudio.com/docs/languages/overview",
      },
    ],
  },
  {
    id: "i18n-language-switcher",
    title: "国际化语言切换器",
    excerpt: "使用 i18next 搭配 Intl API 构建多语言切换控制台，演示语言包按需加载、日期与货币格式化以及缺失文案回退策略。",
    keywords: ["i18n", "i18next", "Intl", "多语言"],
    Component: I18nLanguageSwitcherSnippet,
    detail: {
      overview:
        "封装独立的 i18next 实例管理语言包，结合 react-i18next 与 Intl 原生 API 构建一个可视化语言切换面板：支持按需加载语言包、展示日期/货币/相对时间的本地化效果，并在缺失翻译时自动回退到英文。",
      implementation: [
        "通过 `createInstance` + `initReactI18next` 创建局部 i18n 实例，避免与应用其它部分冲突，并设置 `fallbackLng` 与 `returnEmptyString: false` 保证回退行为一致。",
        "维护 `LANGUAGE_PACKS` 配置，在用户切换语言时按需调用 `addResourceBundle` 模拟异步加载语言包，再执行 `changeLanguage` 更新界面。",
        "使用 `Intl.DateTimeFormat`、`Intl.NumberFormat` 与 `Intl.RelativeTimeFormat` 同步展示日期、货币、相对时间在不同语言下的格式差异。",
        "通过 `i18n.getResource` 判断是否存在指定文案，实时提示当前语言是否触发英文回退，帮助排查缺失的翻译键值。",
      ],
      notes: [
        "实际项目可改为从远程 JSON/后端接口加载语言包，可结合 i18next-http-backend 或 Suspense 进行懒加载。",
        "在 SSR 或微前端场景下，需要在服务器端与客户端分别初始化 i18n；本示例通过局部实例解决重复初始化问题。",
      ],
    },
    codeExamples: [
      {
        name: "按需加载语言包",
        language: "ts",
        code: `const loadLanguagePack = async (nextLanguage: LanguageCode) => {
  setIsLoading(true)
  if (!i18n.hasResourceBundle(nextLanguage, "translation")) {
    await new Promise((resolve) => setTimeout(resolve, 420))
    i18n.addResourceBundle(
      nextLanguage,
      "translation",
      LANGUAGE_PACKS[nextLanguage].translation,
      true,
      true,
    )
  }
  await i18n.changeLanguage(nextLanguage)
  setIsLoading(false)
}`,
      },
      {
        name: "Intl 日期与货币格式化",
        language: "ts",
        code: `const localizedDate = new Intl.DateTimeFormat(locale, {
  dateStyle: "full",
  timeStyle: "short",
}).format(sampleDate)

const localizedCurrency = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
}).format(sampleRevenue)`,
      },
    ],
    resources: [
      {
        title: "i18next 官方文档",
        url: "https://www.i18next.com/",
      },
      {
        title: "react-i18next 指南",
        url: "https://react.i18next.com/",
      },
      {
        title: "MDN: Intl API",
        url: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl",
      },
    ],
  },
  {
    id: "draggable-sortable-list",
    title: "拖拽排序列表",
    excerpt:
      "使用 @dnd-kit 构建卡片式列表拖拽，支持锁定、禁用与删除状态，用于栏目、菜单或模块配置。",
    keywords: ["拖拽", "排序", "列表", "dnd-kit"],
    Component: DraggableSortableListSnippet,
    detail: {
      overview:
        "基于 @dnd-kit 的 DndContext + SortableContext，实现可拖拽排序的卡片列表。示例展示了如何在同一组件中处理锁定项（不可拖拽/删除）、禁用项（保留但置灰）以及正常项，同时提供重置和轴向限制等实用功能。",
      implementation: [
        "维护包含 state 状态的列表数据，区分 normal / locked / disabled 三种行为，并通过 useState 管理。",
        "使用 useSensors 注册 PointerSensor + KeyboardSensor，配合 activationConstraint、axis lock 等能力优化拖拽体验。",
        "在 SortableListItem 中调用 useSortable 注入排序行为，并根据拖拽中状态动态调整 transform / transition / z-index。",
        "通过 Tooltip + 右侧图标按钮统一提供编辑、禁用与删除操作；当条目处于 locked/disabled 状态时自动屏蔽不合法的交互。",
      ],
      notes: [
        "真实项目可将数据源接入后端接口；拖拽结果可通过 onDragEnd 的 arrayMove 直接同步到服务端。",
        "若需要跨列/网格拖拽，可切换至 rectSortingStrategy 或自定义策略；列表项内部也可作为 Portal 渲染，避免剪裁问题。",
      ],
    },
    codeExamples: [
      {
        name: "拖拽结束处理",
        language: "ts",
        code: `const handleDragEnd = ({ active, over }: DragEndEvent) => {
  if (!over || active.id === over.id) return

  setItems((prev) => {
    const activeIndex = prev.findIndex((item) => item.id === active.id)
    const overIndex = prev.findIndex((item) => item.id === over.id)
    if (activeIndex === -1 || overIndex === -1) return prev
    if (prev[activeIndex].state === "locked" || prev[overIndex].state === "locked") return prev
    return arrayMove(prev, activeIndex, overIndex)
  })
}`,
      },
      {
        name: "SortableListItem 使用 useSortable",
        language: "tsx",
        code: `const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
  id: item.id,
  disabled: item.state === "locked",
  transition: { duration: 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
})

const style = {
  transform: CSS.Transform.toString(transform ?? { x: 0, y: 0, scaleX: 1, scaleY: 1 }),
  transition,
}

return (
  <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
    {/* ...卡片内容... */}
  </div>
)`,
      },
    ],
    resources: [
      {
        title: "dnd-kit 官方文档",
        url: "https://docs.dndkit.com/",
      },
      {
        title: "dnd-kit Sortable 指南",
        url: "https://docs.dndkit.com/presets/sortable",
      },
      {
        title: "shadcn/ui Dropdown Menu 组件",
        url: "https://ui.shadcn.com/docs/components/dropdown-menu",
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
    excerpt:
      "将倒计时逻辑移入 Web Worker，保持主线程繁忙时依然准确的计时体验。",
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
    id: "dynamic-form",
    title: "动态配置表单",
    excerpt:
      "用配置驱动字段与校验逻辑，结合 shadcn/ui 构建可联动的动态表单界面。",
    keywords: ["表单", "动态配置", "shadcn"],
    Component: DynamicFormSnippet,
    detail: {
      overview:
        "通过字段定义数组描述表单结构，每个字段可以携带类型、占位、依赖条件与提示信息。借助 react-hook-form 的 resolver 与 zod superRefine，校验逻辑可以随可见字段即时更新，实现真正可扩展的动态表单。",
      implementation: [
        "使用 DynamicFieldDefinition 描述字段元数据（类型、占位、选项、联动条件、校验规则等），统一驱动渲染与校验。",
        "useWatch 监听表单值变化，实时筛选需要展示的字段，并在右侧面板同步当前结构。",
        "自定义 resolver 在每次校验前生成 schema，隐藏字段自动跳过校验，已显示字段则执行邮箱、正则、长度等约束。",
        "提交时仅收集当前可见字段的值，便于传递给后端或保存配置，同时提供快速重置能力。",
      ],
      notes: [
        "可继续扩展 showIf，支持多条件、范围比较或自定义函数，满足复杂的业务联动需求。",
        "字段定义可由后端或 CMS 下发，实现低代码表单搭建；前端只需渲染与校验。",
      ],
    },
    codeExamples: [
      {
        name: "字段配置示例",
        language: "ts",
        code: `const fieldDefinitions: DynamicFieldDefinition[] = [
  {
    id: "projectName",
    label: "项目名称",
    type: "text",
    required: true,
    minLength: 3,
    maxLength: 48,
  },
  {
    id: "budgetRange",
    label: "预算区间",
    type: "select",
    options: [
      { value: "lt-50k", label: "小于 5 万" },
      { value: "50-100k", label: "5 万 - 10 万" },
    ],
    showIf: { field: "hasBudget", equals: true },
    required: true,
  },
]`,
      },
      {
        name: "动态校验逻辑",
        language: "ts",
        code: `const resolver: Resolver<DynamicFormValues> = (values, ctx, options) => {
  const schema = buildSchema(values)
  return zodResolver(schema)(values, ctx, options)
}

function buildSchema(currentValues: DynamicFormValues) {
  return z.object(schemaShape).superRefine((parsed, ctx) => {
    fieldDefinitions.forEach((field) => {
      if (!shouldShowField(currentValues, field)) return

      const value = (parsed[field.id] as string)?.trim?.() ?? ""
      if (field.required && !value) {
        ctx.addIssue({
          code: "custom",
          path: [field.id],
          message: field.label + " 为必填项",
        })
      }
    })
  })
}`,
      },
    ],
    resources: [
      {
        title: "react-hook-form Resolver",
        url: "https://react-hook-form.com/docs/useform/resolvers",
      },
      {
        title: "Zod 文档",
        url: "https://zod.dev/",
      },
      {
        title: "shadcn/ui Form 组件",
        url: "https://ui.shadcn.com/docs/components/form",
      },
    ],
  },
  {
    id: "stepper-form",
    title: "多步骤向导",
    excerpt:
      "将复杂提交流程拆分成多步骤向导，支持自动保存草稿、进度条、前后导航与总结确认。",
    keywords: ["表单", "向导", "多步骤", "草稿"],
    Component: StepperFormSnippet,
    detail: {
      overview:
        "利用 react-hook-form 管理全局表单状态，结合步骤配置与校验逻辑构建多步骤引导流程。示例展示了项目信息、联系人、上线偏好与最终确认四个阶段，并支持自动保存草稿、跨步骤跳转和摘要预览。",
      implementation: [
        "定义步骤数组（title、description、fields、schema），通过 validateStep 仅校验当前步骤字段，保持每一步的反馈清晰。",
        "使用 Progress + 自定义 Stepper 展示整体进度，状态（完成/当前/未开始）一目了然，可返回之前步骤修正。",
        "表单数据通过 form.watch + localStorage 自动保存草稿，恢复时还原步骤编号与最后更新时间，支持跨页面继续填写。",
        "最终步骤展示摘要面板，调用 FormSchema.safeParse 再次校验所有字段，通过后清理草稿并触发 toast 成功提示。",
      ],
      notes: [
        "真实项目可将草稿持久化到后端或多端同步；向导流程也可根据权限动态增减步骤。",
        "搭配动画/过渡（如 Framer Motion）可提升切换体验；按钮权限可结合审批状态动态控制。",
      ],
    },
    codeExamples: [
      {
        name: "步骤配置",
        language: "ts",
        code: `const STEPS = [
  {
    id: "project",
    title: "项目信息",
    description: "定义项目基础信息",
    fields: ["projectName", "projectUrl", "industry", "teamSize"],
    schema: StepOneSchema,
  },
  {
    id: "contact",
    title: "联系人",
    fields: ["contactName", "contactEmail", "contactRole"],
    schema: StepTwoSchema,
  },
  {
    id: "preferences",
    title: "上线偏好",
    fields: ["usageScenario", "marketingChannels", "enableNotifications", "launchPlan", "acceptTerms"],
    schema: StepThreeSchema,
  },
]`,
      },
      {
        name: "步骤校验逻辑",
        language: "ts",
        code: `function validateStep(step: StepDefinition, values: FormValues) {
  if (!step.schema) return true
  const data = step.fields.reduce((acc, field) => {
    acc[field] = values[field]
    return acc
  }, {} as Record<string, unknown>)
  const result = step.schema.safeParse(data)
  if (!result.success) {
    result.error.issues.forEach((issue) =>
      form.setError(issue.path[0] as StepKey, { message: issue.message })
    )
    return false
  }
  step.fields.forEach((field) => form.clearErrors(field))
  return true
}`,
      },
    ],
    resources: [
      {
        title: "react-hook-form 文档",
        url: "https://react-hook-form.com/",
      },
      {
        title: "Zod Schema",
        url: "https://zod.dev/",
      },
      {
        title: "shadcn/ui Progress 组件",
        url: "https://ui.shadcn.com/docs/components/progress",
      },
    ],
  },
  {
    id: "data-request-status",
    title: "数据请求状态板",
    excerpt:
      "统一处理接口的加载、成功、空状态与错误兜底，让列表或仪表盘的请求体验更加一致。",
    keywords: ["loading", "请求状态", "空状态", "错误处理"],
    Component: DataRequestStatusSnippet,
    detail: {
      overview:
        "通过一个轻量的状态机管理 API 请求结果，并在视图层统一接入 Skeleton、空状态与错误处理。示例使用 mock 数据按钮模拟三种返回场景，展示如何共用一套状态与渲染逻辑。",
      implementation: [
        "定义 RequestStatus 枚举与 STATUS_META 映射，管理加载、成功、空状态、错误四种视图及其文案。",
        "封装 handleRequest 统一处理 setLoading、清理定时器、延迟返回结果，并根据模式设置数据或错误提示。",
        "在 renderContent 中集中判断 status，分别返回 Skeleton 骨架、指标列表、空白提示和错误兜底，避免在主 JSX 中出现大量条件渲染。",
        "在操作区提供“重新请求”与不同场景按钮，方便演示如何复用同一套逻辑驱动不同接口结果。",
      ],
      notes: [
        "真实项目可将请求逻辑抽出为自定义 Hook，统一暴露 status、data、error、refetch 等字段。",
        "骨架屏可以替换为专用 Skeleton 组件或 shimmer 动画；错误兜底可以接入工单系统或联系方式。",
      ],
    },
    codeExamples: [
      {
        name: "状态机定义",
        language: "ts",
        code: `type RequestStatus = "idle" | "loading" | "success" | "empty" | "error"

const STATUS_META: Record<RequestStatus, { label: string }> = {
  idle: { label: "等待请求" },
  loading: { label: "加载中" },
  success: { label: "加载成功" },
  empty: { label: "内容为空" },
  error: { label: "请求失败" },
}`,
      },
      {
        name: "集中渲染四种视图",
        language: "tsx",
        code: `function renderContent(
  status: RequestStatus,
  records: InsightRecord[],
  message?: string,
) {
  if (status === "loading") {
    return <LoadingSkeleton />
  }

  if (status === "success") {
    return <InsightList items={records} />
  }

  if (status === "empty") {
    return <EmptyPlaceholder />
  }

  if (status === "error") {
    return <ErrorFallback message={message ?? "请求失败"} />
  }

  return <PendingBlock />
}`,
      },
    ],
    resources: [
      {
        title: "React 文档：管理多重状态",
        url: "https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state",
      },
      {
        title: "Kent C. Dodds：打造可靠的加载与错误界面",
        url: "https://kentcdodds.com/blog/handling-async-state-in-ui",
      },
      {
        title: "shadcn/ui Button 组件",
        url: "https://ui.shadcn.com/docs/components/button",
      },
    ],
  },
  {
    id: "file-upload-panel",
    title: "文件上传面板",
    excerpt:
      "拖拽 + 多文件上传队列，带进度条、大小/类型校验与 toast 提示，适配后台素材管理场景。",
    keywords: ["上传", "拖拽", "进度条", "toast"],
    Component: FileUploadPanelSnippet,
    detail: {
      overview:
        "基于 react-dropzone 构建现代化上传面板，支持拖拽/点击/粘贴加入文件、实时进度模拟、大小与类型校验，并结合 sonner toast 展示反馈。列表按照素材类别分组展示，可手动重试、取消、清空队列，贴近真实后台的素材管理需求。",
      implementation: [
        "使用 useDropzone 管理拖拽与选择文件，配置 accept、maxSize、maxFiles 实现白名单校验，onDropRejected 中给出错误提示。",
        "为每个文件生成唯一任务（nanoid + File 元信息），通过 setInterval 模拟上传进度；上传完成或失败时清理定时器并调用 toast。",
        "引入任务状态 uploading/success/error，对应展示进度条、错误文案以及重试/取消按钮；支持一次性清理成功任务或清空整个队列。",
        "根据文件类型映射到图片、文档、压缩包等分类 Section，方便在后台中分别查看素材；顶部概览区统计数量与总体积。",
      ],
      notes: [
        "真是接入时可将模拟 interval 替换为真实 API，上报 progress 事件并监听完成/失败；任务状态可同步到服务端实现秒传。",
        "Toast 可改为全局通知或嵌入侧边栏提醒；上传文件较大时建议配合分片/断点续传方案，必要时展示更详细的日志。",
      ],
    },
    codeExamples: [
      {
        name: "Dropzone 配置",
        language: "ts",
        code: `const { getRootProps, getInputProps } = useDropzone({
  accept: {
    "image/jpeg": [],
    "image/png": [],
    "application/pdf": [],
    "application/zip": [],
  },
  maxSize: 15 * 1024 * 1024,
  maxFiles: 12,
  multiple: true,
  onDrop,
  onDropRejected,
})`,
      },
      {
        name: "模拟上传进度",
        language: "ts",
        code: `const startUpload = (taskId: string, file: File) => {
  const timer = setInterval(() => {
    let outcome: UploadStatus | null = null
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId || task.status !== "uploading") return task
        const next = Math.min(task.progress + Math.random() * 18 + 7, 100)
        if (next >= 100) {
          outcome = "success"
          return { ...task, progress: 100, status: "success" }
        }
        return { ...task, progress: next }
      }),
    )
    if (outcome) clearInterval(timer)
  }, 480)
}`,
      },
    ],
    resources: [
      {
        title: "react-dropzone 文档",
        url: "https://react-dropzone.js.org",
      },
      {
        title: "sonner Toast",
        url: "https://sonner.emilkowal.ski/",
      },
      {
        title: "shadcn/ui Progress 组件",
        url: "https://ui.shadcn.com/docs/components/progress",
      },
    ],
  },
  {
    id: "notification-toasts",
    title: "通知提示合集",
    excerpt:
      "基于 sonner 的全局通知组件，涵盖成功、警告、加载等常见场景，并支持自定义图标与动作按钮。",
    keywords: ["toast", "通知", "反馈"],
    Component: NotificationToastsSnippet,
    detail: {
      overview:
        "使用 sonner 构建一致性的全局通知中心。封装多个语义预设，结合 action、duration、promise 等能力，帮助产品在不同场景下提供即时反馈。",
      implementation: [
        "在应用根节点挂载 shadcn 封装的 Toaster，并根据当前主题切换 light/dark 外观。",
        "维护通知预设数组，统一描述标题、图标与描述文字，点击按钮时直接调用 toast API。",
        "利用 toast.loading + toast.dismiss、toast.promise 展示异步任务的起止状态，保证反馈连贯。",
        "示例中展示 action、自定义图标、持续时长等配置，便于拓展成 Notification Center。",
      ],
      notes: [
        "sonner 本身支持队列和分组，可在复杂项目中结合业务 ID 控制去重与更新。",
        "若需要更丰富的布局，可传入 React 节点作为 toast 内容，与 UI 系统保持一致。",
      ],
    },
    codeExamples: [
      {
        name: "基础成功提示",
        language: "ts",
        code: `toast.success("发布成功", {
  description: "内容已同步至所有渠道",
  duration: 3800,
})`,
      },
      {
        name: "异步任务状态",
        language: "ts",
        code: `const toastId = toast.loading("正在同步资源...", { duration: 10000 })

setTimeout(() => {
  toast.success("同步完成", { duration: 3800 })
  toast.dismiss(toastId)
}, 2600)`,
      },
      {
        name: "Promise 语法糖",
        language: "ts",
        code: `toast.promise(fetchReport(), {
  loading: "报告生成中...",
  success: "报告已准备好",
  error: "生成失败，请稍后重试",
})`,
      },
    ],
    resources: [
      {
        title: "sonner 官方文档",
        url: "https://sonner.emilkowal.ski/",
      },
      {
        title: "shadcn/ui Sonner 集成说明",
        url: "https://ui.shadcn.com/docs/components/sonner",
      },
    ],
  },
  {
    id: "qr-generator",
    title: "二维码生成器",
    excerpt: "支持常用预设、容错率与配色调节的二维码生成面板。",
    keywords: ["二维码", "工具", "分享"],
    Component: QrGeneratorSnippet,
    detail: {
      overview:
        "围绕营销推广与办公分享场景，提供网站跳转、Wi-Fi 配网、应用下载与联系人 vCard 等常见场景预设，并允许输入任意文本实时渲染。",
      implementation: [
        "预设场景以配置数组驱动，每项包含内容、尺寸、容错等级与配色，便于扩展更多业务案例。",
        "使用 Tabs 切换“场景预设”和“自定义”两种模式，自定义面板支持文本输入、尺寸快捷按钮、颜色拾取与容错率选择。",
        "基于 react-qr-code 组件实时生成二维码，任何参数调整都会立即更新预览。",
        "附带最佳实践提示，帮助设计/运营在落地物料时控制对比度与留白，提升识别率。",
      ],
      notes: [
        "如需在二维码中央嵌入 LOGO，可选用容错率 Q/H，并在生成后通过 canvas 叠加图像。",
        "可以配合表单生成 Wi-Fi、短信、邮件等格式，进一步实现低代码配置。",
      ],
    },
    codeExamples: [
      {
        name: "基础生成",
        language: "tsx",
        code: `<QRCode value={content} size={192} fgColor={foreground} bgColor={background} level={errorLevel} />`,
      },
      {
        name: "Wi-Fi 配网字符串",
        language: "text",
        code: `WIFI:T:WPA;S:libra-guest;P:welcome123;;`,
      },
      {
        name: "vCard 信息",
        language: "text",
        code: `BEGIN:VCARD\nVERSION:3.0\nFN:Libra 客服\nTEL:+86-400-123-4567\nEMAIL:service@libra.dev\nEND:VCARD`,
      },
    ],
    resources: [
      {
        title: "react-qr-code",
        url: "https://github.com/rosskhanas/react-qr-code",
      },
      {
        title: "二维码设计最佳实践",
        url: "https://design.google/library/qr-code-best-practices/",
      },
    ],
  },
  {
    id: "rich-text-editor",
    title: "富文本编辑器",
    excerpt: "基于 TipTap 实现的富文本编辑器，提供常用排版与链接功能。",
    keywords: ["富文本", "编辑器", "tiptap"],
    Component: RichTextEditorSnippet,
    detail: {
      overview:
        "集成 TipTap Starter Kit，支持标题、加粗、斜体、删除线、列表、引用、代码块、撤销重做等常用编辑功能，并提供工具栏与链接插入示例。",
      implementation: [
        "通过 useEditor 创建 TipTap 实例，配置 Starter Kit 与 Link 扩展，设置编辑区的基础样式。",
        "构建工具栏按钮，调用 editor.chain().focus()...run() 切换不同的文本格式与列表。",
        "添加链接输入框，支持设置/移除链接，并自动扩展选区中的链接范围。",
        "在侧栏介绍快捷键与使用提示，便于二次封装成业务组件。",
      ],
      notes: [
        "可按需接入 Markdown、Image、Table 等额外扩展，实现更完整的编辑体验。",
        "生产环境应考虑内容校验与粘贴过滤，防止不安全的 HTML。",
      ],
    },
    codeExamples: [
      {
        name: "初始化编辑器",
        language: "tsx",
        code: `const editor = useEditor({
  extensions: [StarterKit, Link.configure({ openOnClick: false })],
  content: initialHtml,
})`,
      },
      {
        name: "工具栏示例",
        language: "ts",
        code: `editor.chain().focus().toggleBold().run()
editor.chain().focus().toggleHeading({ level: 2 }).run()`,
      },
      {
        name: "插入链接",
        language: "ts",
        code: `editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()`,
      },
    ],
    resources: [
      {
        title: "TipTap 文档",
        url: "https://tiptap.dev/",
      },
      {
        title: "TipTap Link 扩展",
        url: "https://tiptap.dev/api/extensions/link",
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
