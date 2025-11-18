import type { SnippetMetadata } from "../types";

export const snippet: SnippetMetadata = {
  "id": "chart-templates",
  "title": "图表封装组件",
  "excerpt": "基于 Recharts 的通用柱状/折线/饼图模板，统一主题与交互配置。",
  "keywords": [
    "数据可视化",
    "Recharts",
    "模板"
  ],
  "detail": {
    "overview": "UniversalChart 组件包装 Recharts 常用配置：响应式容器、Tooltip、Legend、色板与单位格式，开发者只需传入 config 描述文案和数据即可输出一致的柱状图、折线图、饼图视图。",
    "implementation": [
      "config.type 决定渲染的 Recharts 组件（BarChart / LineChart / PieChart），并透传 stacked、smooth 等细节。",
      "色板使用主题 CSS 变量（--chart-x），支持动态主题色切换与暗黑模式。",
      "统一的 ChartTooltip 在 payload 中遍历系列，自动拼接单位、颜色点与数据值，可扩展上报。"
    ],
    "notes": [
      "需要先安装 Recharts：`pnpm add recharts`。",
      "可在 config 中扩展 secondaryValue 等字段，映射到第二条折线或堆叠柱。"
    ]
  },
  "codeExamples": [
    {
      "name": "定义通用配置",
      "language": "ts",
      "code": "const channelBarConfig: BarChartConfig = {\n  type: \"bar\",\n  title: \"渠道 GMV\",\n  unit: \"万\",\n  stacked: true,\n  data: [\n    { label: \"抖音\", value: 680, secondaryValue: 540 },\n    { label: \"天猫\", value: 890, secondaryValue: 760 },\n  ],\n}"
    },
    {
      "name": "渲染图表",
      "language": "tsx",
      "code": "<Tabs defaultValue=\"bar\">\n  <TabsContent value=\"bar\">\n    <UniversalChart config={channelBarConfig} />\n  </TabsContent>\n  <TabsContent value=\"line\">\n    <UniversalChart config={trendLineConfig} />\n  </TabsContent>\n</Tabs>"
    }
  ],
  "resources": [
    {
      "title": "Recharts 文档",
      "url": "https://recharts.org/en-US/examples"
    },
    {
      "title": "数据可视化配色指南",
      "url": "https://uxplanet.org/data-visualization-color-best-practices"
    }
  ]
};
