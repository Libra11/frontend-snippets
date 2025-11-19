import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "theme-toggle",
  "title": "主题切换",
  "excerpt": "全局深浅色切换按钮，自适应系统偏好并持久化用户选择。",
  "keywords": [
    "主题",
    "暗黑模式",
    "全局状态"
  ],
  "detail": {
    "overview": "封装 useTheme 钩子管理全局主题状态，结合 ThemeToggle 组件完成 color-scheme、document.class 与 localStorage 同步，支持系统偏好变化自动切换。",
    "implementation": [
      "useSyncExternalStore 订阅主题变更，确保多组件同时响应且避免 hydration mismatch。",
      "初始渲染根据 localStorage 与 prefers-color-scheme 设定 document.documentElement.className、color-scheme。",
      "ThemeToggle 组件内使用 SVG 动画切换图标，保证无跳闪的过渡体验。",
      "对 Safari 兼容 media query 监听，支持 addListener / addEventListener 双方案。"
    ],
    "notes": [
      "需要在 Tailwind 配置启用 dark variant 或使用 CSS 自定义变量适配暗色。",
      "可拓展主题种类，例如添加 dim、system 模式等，只需在 store 扩展枚举并更新 UI。"
    ]
  },
  "codeExamples": [
    {
      "name": "使用主题 Hook",
      "language": "tsx",
      "code": "const { theme, toggleTheme } = useTheme()\n\nreturn (\n  <Button onClick={toggleTheme}>\n    当前主题: {theme}\n  </Button>\n)"
    },
    {
      "name": "封装的 useTheme",
      "language": "ts",
      "code": "const theme = useSyncExternalStore(subscribe, getSnapshot, () => \"light\")\n\nconst toggleTheme = useCallback(() => {\n  setThemeValue(theme === \"dark\" ? \"light\" : \"dark\")\n}, [theme])"
    }
  ],
  "resources": [
    {
      "title": "React Docs: useSyncExternalStore",
      "url": "https://react.dev/reference/react/useSyncExternalStore"
    },
    {
      "title": "CSS Color Scheme",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/color-scheme"
    }
  ]
};
