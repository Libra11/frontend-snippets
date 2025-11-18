import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "theme-color-switcher",
  "title": "动态主题色切换",
  "excerpt": "运行时切换品牌主色/强调色，所有组件立即响应，无需刷新页面。",
  "keywords": [
    "主题色",
    "品牌",
    "CSS 变量"
  ],
  "detail": {
    "overview": "useThemeColor 钩子集中管理主题色方案，通过 CSS 自定义变量覆盖 Tailwind token，按钮、渐变背景与 UI 组件可在切换后立刻同步，同时结果持久化到 localStorage。",
    "implementation": [
      "useSyncExternalStore 提供全局订阅能力，保证多个组件共享主题色且避免 SSR Hydration mismatch。",
      "themeColorOptions 描述色板的 label、preview 与 cssVars，新增一组配色仅需追加配置即可生效。",
      "applyThemeColor 写入 document.documentElement.style 上的 --primary / --accent / --ring，并附带 data-theme-accent 方便调试或触发 CSS 动画。"
    ],
    "notes": [
      "SSR 或 Edge 渲染时需要判断 window 是否存在，本示例已在 hook 内进行保护。",
      "如果需要同步图表或营销背景色，可在 cssVars 中扩展更多自定义变量以匹配设计系统。"
    ]
  },
  "codeExamples": [
    {
      "name": "色板选择面板",
      "language": "tsx",
      "code": "const { colorId, options, setThemeColor } = useThemeColor()\n\nreturn (\n  <div className=\"grid gap-2\">\n    {options.map((option) => (\n      <button\n        key={option.id}\n        data-active={option.id === colorId}\n        onClick={() => setThemeColor(option.id)}\n        className=\"rounded-xl border px-4 py-2 transition data-[active=true]:border-primary data-[active=true]:bg-primary/5\"\n      >\n        {option.label}\n      </button>\n    ))}\n  </div>\n)"
    },
    {
      "name": "写入 CSS 变量",
      "language": "ts",
      "code": "const applyThemeColor = (colorId: ThemeColorId) => {\n  const option = getOptionById(colorId)\n  const root = document.documentElement\n\n  Object.entries(option.cssVars).forEach(([variable, value]) => {\n    root.style.setProperty(variable, value)\n  })\n\n  root.dataset.themeAccent = option.id\n}"
    }
  ],
  "resources": [
    {
      "title": "MDN: Using CSS Custom Properties",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties"
    },
    {
      "title": "React Docs: useSyncExternalStore",
      "url": "https://react.dev/reference/react/useSyncExternalStore"
    }
  ]
};
