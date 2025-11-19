import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "debounce-throttle-input",
  "title": "防抖/节流输入框",
  "excerpt": "同一输入框分离即时值、防抖值与节流值，兼顾搜索体验与接口防刷。",
  "keywords": [
    "防抖",
    "节流",
    "输入"
  ],
  "detail": {
    "overview": "展示如何在单个输入组件中同时维护即时输入、防抖值与节流值：防抖值触发搜索接口，节流值用于日志/防刷上报，避免重复请求并兼顾体验。",
    "implementation": [
      "受控输入在 onChange 中立即更新本地 state，用于即时 UI 渲染。",
      "防抖逻辑通过 setTimeout + 清理函数延迟同步值，只有用户停顿超过设定毫秒数才触发搜索请求。",
      "节流逻辑记录最后执行时间并维护 trailing value，确保接口/埋点调用按固定间隔发送。",
      "分别维护触发日志与状态提示，清晰呈现两种节奏下的执行结果，便于排查问题。"
    ],
    "notes": [
      "在 SSR/微前端环境中使用 window、setTimeout 前需判断是否处于浏览器端。",
      "若用户开启 reduced motion，可缩短或移除滚动/动画反馈，保持一致体验。"
    ]
  },
  "codeExamples": [
    {
      "name": "基础防抖 Hook",
      "language": "ts",
      "code": "function useDebounce<T>(value: T, delay = 400) {\n  const [debounced, setDebounced] = useState(value)\n\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay)\n    return () => clearTimeout(timer)\n  }, [value, delay])\n\n  return debounced\n}"
    },
    {
      "name": "节流执行器",
      "language": "ts",
      "code": "const lastRun = useRef(0)\nconst pending = useRef<ReturnType<typeof setTimeout> | null>(null)\n\nconst run = (value: string) => {\n  const now = Date.now()\n  const remaining = interval - (now - lastRun.current)\n\n  if (remaining <= 0) {\n    lastRun.current = now\n    callback(value)\n  } else {\n    if (pending.current) clearTimeout(pending.current)\n    pending.current = setTimeout(() => {\n      lastRun.current = Date.now()\n      callback(value)\n      pending.current = null\n    }, remaining)\n  }\n}"
    }
  ],
  "resources": [
    {
      "title": "CSS-Tricks: Debouncing and Throttling Explained",
      "url": "https://css-tricks.com/debouncing-throttling-explained-examples/"
    },
    {
      "title": "MDN: setTimeout",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/API/setTimeout"
    },
    {
      "title": "Jake Archibald: In defence of throttling",
      "url": "https://jakearchibald.com/2016/throttling-and-debouncing/"
    }
  ]
};
