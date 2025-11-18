import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "masonry-layout",
  "title": "瀑布流布局",
  "excerpt": "基于原生 CSS 多列（columns）与 break-inside: avoid 构建的响应式瀑布流，内置分类筛选、列密度切换与信息块显隐。",
  "keywords": [
    "瀑布流",
    "Masonry",
    "布局",
    "CSS Columns"
  ],
  "detail": {
    "overview": "无需引入第三方 Masonry 库，仅依靠 CSS 多列布局即可拼出灵感墙：卡片内容自然填补空隙，配合分类、列密度与信息显隐的状态切换，可快速验证瀑布流场景的交互。",
    "implementation": [
      "预置 `masonryProjects` 数据集合，包含分类、标签、指标等字段，让每张卡片高度有差异，从而验证瀑布流对不同内容长度的适配。",
      "通过 `columns` + `[&>*]:break-inside-avoid` 保证每张卡片作为整体落入列中，`[column-fill:_balance]` 则让浏览器自动平衡各列高度。",
      "列密度按钮映射到 `densityPresets`，每个预设定义对应断点下的列数与 column-gap，点击后只需拼接 className 即可切换布局。",
      "分类筛选和“展示扩展信息”开关共享一份状态：useMemo 过滤出要渲染的卡片，开关控制 metrics/tags 片段的挂载，从而真实演示内容增减带来的重排。"
    ],
    "notes": [
      "旧版 Safari/WebView 若 columns 支持不佳，可降级为 grid + JS 计算高度或改用 CSS masonry（实验特性）。",
      "瀑布流会打乱竖向阅读顺序，重要信息需额外提供编号/跳转锚点，或在移动端切换成单列列表。"
    ]
  },
  "codeExamples": [
    {
      "name": "列密度预设",
      "language": "ts",
      "code": "const densityPresets = [\n  {\n    id: \"airy\",\n    label: \"宽松\",\n    className: \"sm:columns-2 xl:columns-3 [column-gap:1.75rem] [&>*]:mb-7\",\n  },\n  {\n    id: \"balanced\",\n    label: \"均衡\",\n    className: \"sm:columns-2 lg:columns-3 2xl:columns-4 [column-gap:1.25rem] [&>*]:mb-5\",\n  },\n  {\n    id: \"packed\",\n    label: \"致密\",\n    className: \"columns-2 sm:columns-3 lg:columns-4 [column-gap:1rem] [&>*]:mb-4\",\n  },\n] as const\n\nconst densityMeta = densityPresets.find((preset) => preset.id === density)!"
    },
    {
      "name": "渲染瀑布流容器",
      "language": "tsx",
      "code": "const filteredProjects = useMemo(() => {\n  if (activeCategory === \"all\") return masonryProjects\n  return masonryProjects.filter((project) => project.category === activeCategory)\n}, [activeCategory])\n\nreturn (\n  <div className={cn(\n    \"columns-1 [column-fill:_balance] [&>*]:break-inside-avoid transition-all\",\n    densityMeta.className,\n  )}>\n    {filteredProjects.map((project) => (\n      <article key={project.id} className=\"rounded-3xl border p-5\">\n        <header>\n          <h3 className=\"font-semibold\">{project.title}</h3>\n          <p className=\"text-sm text-muted-foreground\">{project.description}</p>\n        </header>\n\n        {showMeta && (\n          <dl className=\"mt-4 grid gap-3 rounded-2xl border border-dashed px-3 py-2 text-xs\">\n            {project.metrics.map((metric) => (\n              <div key={metric.label} className=\"flex justify-between\">\n                <span>{metric.label}</span>\n                <span className=\"font-semibold text-foreground\">{metric.value}</span>\n              </div>\n            ))}\n          </dl>\n        )}\n      </article>\n    ))}\n  </div>\n)"
    }
  ],
  "resources": [
    {
      "title": "MDN: Using Multi-column Layouts",
      "url": "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_multicol_layout/Using_multicol_elements"
    },
    {
      "title": "CSS-Tricks: Approaches for a CSS Masonry Layout",
      "url": "https://css-tricks.com/piecing-together-approaches-for-a-css-masonry-layout/"
    },
    {
      "title": "web.dev Patterns: Masonry layout",
      "url": "https://web.dev/patterns/layout/masonry"
    }
  ]
};
