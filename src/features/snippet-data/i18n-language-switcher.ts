import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "i18n-language-switcher",
  "title": "国际化语言切换器",
  "excerpt": "使用 i18next 搭配 Intl API 构建多语言切换控制台，演示语言包按需加载、日期与货币格式化以及缺失文案回退策略。",
  "keywords": [
    "i18n",
    "i18next",
    "Intl",
    "多语言"
  ],
  "detail": {
    "overview": "封装独立的 i18next 实例管理语言包，结合 react-i18next 与 Intl 原生 API 构建一个可视化语言切换面板：支持按需加载语言包、展示日期/货币/相对时间的本地化效果，并在缺失翻译时自动回退到英文。",
    "implementation": [
      "通过 `createInstance` + `initReactI18next` 创建局部 i18n 实例，避免与应用其它部分冲突，并设置 `fallbackLng` 与 `returnEmptyString: false` 保证回退行为一致。",
      "维护 `LANGUAGE_PACKS` 配置，在用户切换语言时按需调用 `addResourceBundle` 模拟异步加载语言包，再执行 `changeLanguage` 更新界面。",
      "使用 `Intl.DateTimeFormat`、`Intl.NumberFormat` 与 `Intl.RelativeTimeFormat` 同步展示日期、货币、相对时间在不同语言下的格式差异。",
      "通过 `i18n.getResource` 判断是否存在指定文案，实时提示当前语言是否触发英文回退，帮助排查缺失的翻译键值。"
    ],
    "notes": [
      "实际项目可改为从远程 JSON/后端接口加载语言包，可结合 i18next-http-backend 或 Suspense 进行懒加载。",
      "在 SSR 或微前端场景下，需要在服务器端与客户端分别初始化 i18n；本示例通过局部实例解决重复初始化问题。"
    ]
  },
  "codeExamples": [
    {
      "name": "按需加载语言包",
      "language": "ts",
      "code": "const loadLanguagePack = async (nextLanguage: LanguageCode) => {\n  setIsLoading(true)\n  if (!i18n.hasResourceBundle(nextLanguage, \"translation\")) {\n    await new Promise((resolve) => setTimeout(resolve, 420))\n    i18n.addResourceBundle(\n      nextLanguage,\n      \"translation\",\n      LANGUAGE_PACKS[nextLanguage].translation,\n      true,\n      true,\n    )\n  }\n  await i18n.changeLanguage(nextLanguage)\n  setIsLoading(false)\n}"
    },
    {
      "name": "Intl 日期与货币格式化",
      "language": "ts",
      "code": "const localizedDate = new Intl.DateTimeFormat(locale, {\n  dateStyle: \"full\",\n  timeStyle: \"short\",\n}).format(sampleDate)\n\nconst localizedCurrency = new Intl.NumberFormat(locale, {\n  style: \"currency\",\n  currency,\n}).format(sampleRevenue)"
    }
  ],
  "resources": [
    {
      "title": "i18next 官方文档",
      "url": "https://www.i18next.com/"
    },
    {
      "title": "react-i18next 指南",
      "url": "https://react.i18next.com/"
    },
    {
      "title": "MDN: Intl API",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl"
    }
  ]
};
