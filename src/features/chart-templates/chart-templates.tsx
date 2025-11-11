import { useState } from "react";
import { BarChart3, LineChart, PieChart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  UniversalChart,
  type UniversalChartConfig,
  type BarChartConfig,
  type LineChartConfig,
  type PieChartConfig,
} from "@/components/charts/universal-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const barConfig: BarChartConfig = {
  type: "bar",
  title: "渠道 GMV 对比",
  subtitle: "Bar Template",
  unit: "万",
  stacked: true,
  meta: [
    { label: "月增长", value: "+18%" },
    { label: "目标完成", value: "92%" },
  ],
  data: [
    { label: "抖音", value: 680, secondaryValue: 540 },
    { label: "小红书", value: 420, secondaryValue: 380 },
    { label: "天猫", value: 890, secondaryValue: 760 },
    { label: "B 站", value: 300, secondaryValue: 210 },
  ],
};

const lineConfig: LineChartConfig = {
  type: "line",
  title: "活跃用户趋势",
  subtitle: "Line Template",
  unit: "w",
  smooth: true,
  meta: [
    { label: "峰值", value: "52w" },
    { label: "近 7 天", value: "+12%" },
  ],
  data: [
    { label: "Mon", value: 21, secondaryValue: 18 },
    { label: "Tue", value: 24, secondaryValue: 17 },
    { label: "Wed", value: 28, secondaryValue: 20 },
    { label: "Thu", value: 32, secondaryValue: 22 },
    { label: "Fri", value: 35, secondaryValue: 23 },
    { label: "Sat", value: 30, secondaryValue: 21 },
    { label: "Sun", value: 38, secondaryValue: 24 },
  ],
};

const pieConfig: PieChartConfig = {
  type: "pie",
  title: "预算分布",
  subtitle: "Pie Template",
  unit: "%",
  meta: [{ label: "总预算", value: "￥1.2M" }],
  data: [
    { label: "品牌投放", value: 32 },
    { label: "渠道合作", value: 26 },
    { label: "内容生产", value: 22 },
    { label: "技术基础设施", value: 12 },
    { label: "实验创新", value: 8 },
  ],
};

type ChartTemplate = {
  id: "bar" | "line" | "pie";
  label: string;
  icon: LucideIcon;
  config: UniversalChartConfig;
};

const templates: ChartTemplate[] = [
  { id: "bar", label: "柱状图", icon: BarChart3, config: barConfig },
  { id: "line", label: "折线图", icon: LineChart, config: lineConfig },
  { id: "pie", label: "饼图", icon: PieChart, config: pieConfig },
];

export function ChartTemplatesSnippet() {
  const [activeTab, setActiveTab] = useState("bar");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.6)] dark:border-border/40 dark:bg-muted/30">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="space-y-4 lg:w-1/3">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-primary">
            Charts
          </p>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">图表封装模板</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              封装 UniversalChart 组件，统一 Recharts 的常用配置（Tooltip、网格、legend、配色、响应式高度），开箱即用柱状图、折线图、饼图三种模版。
            </p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-primary" aria-hidden />
              <span>chart configs 描述图表文案、单位、meta 指标与数据，UI 一致输出。</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-secondary" aria-hidden />
              <span>内置 color token 映射 Tailwind CSS 变量，自动适配亮/暗色以及主题色切换。</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-accent" aria-hidden />
              <span>可以扩展更多类型，只需新增 config.type 分支并复用 Recharts 图表。</span>
            </li>
          </ul>
          <Button
            size="sm"
            variant="outline"
            className="w-max"
            onClick={() => setActiveTab("bar")}
          >
            重置到柱状图
          </Button>
        </div>

        <div className="lg:w-2/3">
          <Tabs defaultValue="bar" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/60">
              {templates.map((template) => (
                <TabsTrigger key={template.id} value={template.id} className="px-4">
                  <template.icon className="size-4" />
                  {template.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {templates.map((template) => (
              <TabsContent key={template.id} value={template.id} className="mt-4">
                <UniversalChart config={template.config} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <div className="pointer-events-none absolute -left-20 top-0 size-64 rounded-full bg-primary/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-[-120px] size-72 rounded-full bg-muted/30 blur-3xl" aria-hidden />
    </div>
  );
}
