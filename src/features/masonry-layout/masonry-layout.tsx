import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type MasonryCategory =
  | "生活方式"
  | "内容运营"
  | "品牌事件"
  | "SaaS 控制台"
  | "教育活动";

type LayoutDensity = "airy" | "balanced" | "packed";

type MasonryProject = {
  id: string;
  title: string;
  description: string;
  cover: string;
  category: MasonryCategory;
  accent: string;
  deliverable: string;
  team: string;
  metrics: { label: string; value: string }[];
  tags: string[];
};

const masonryProjects: MasonryProject[] = [
  {
    id: "coffee-board",
    title: "冷萃订阅控制台",
    description:
      "围绕咖啡烘焙、库存与门店复购的数据中台，突出跨品牌对比与门店的即时补货提示，适合多门店零售管理。",
    cover:
      "https://images.unsplash.com/photo-1459257868276-5e65389e2722?auto=format&fit=crop&w=1600&q=80",
    category: "SaaS 控制台",
    accent: "#F2A66C",
    deliverable: "B2B SaaS",
    team: "北仓体验组",
    metrics: [
      { label: "屏数", value: "26" },
      { label: "交付周期", value: "2.5 周" },
    ],
    tags: ["深色模式", "多维筛选", "数据追踪"],
  },
  {
    id: "atelier-magazine",
    title: "Atelier 品牌刊",
    description:
      "多语言稿件自动分栏排布，文章组合搭配图文模块，搭配临时性推广页与 CTA，适合内容运营小组快速生成专题页。",
    cover:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    category: "内容运营",
    accent: "#7C9CFF",
    deliverable: "专题站",
    team: "Editorial Lab",
    metrics: [
      { label: "模板变体", value: "9" },
      { label: "复用率", value: "82%" },
    ],
    tags: ["多语言", "渐进增强", "自适应排版"],
  },
  {
    id: "bloom-market",
    title: "Bloom Life 品牌日",
    description:
      "强调灵活的内容分发区块和赞助商位，搭配渐变背景卡片，适合品牌日或电商会场的组件化搭建。",
    cover:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
    category: "品牌事件",
    accent: "#FF9FB2",
    deliverable: "活动 H5",
    team: "Bloom Studio",
    metrics: [
      { label: "场景组件", value: "17" },
      { label: "平均转化", value: "11.4%" },
    ],
    tags: ["互动模块", "渐变背景", "推广位"],
  },
  {
    id: "campus-lecture",
    title: "NEXT 校园创作者计划",
    description:
      "面向大学社团的招募落地页，支持报名、日程、导师介绍等信息以卡片方式自由组合，保证社团可自行拖拽调整。",
    cover:
      "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1600&q=80",
    category: "教育活动",
    accent: "#73E0A9",
    deliverable: "报名落地页",
    team: "Campus Lab",
    metrics: [
      { label: "报名城市", value: "34" },
      { label: "组件数量", value: "12" },
    ],
    tags: ["短表单", "日程模块", "报名流程"],
  },
  {
    id: "living-journal",
    title: "Like Living 生活记",
    description:
      "以住宅改造为主题的故事流，卡片采用插画、色块与文字的比例混排，确保移动端也能保持层次感和节奏。",
    cover:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80",
    category: "生活方式",
    accent: "#F8D57E",
    deliverable: "品牌内容",
    team: "Studio Like",
    metrics: [
      { label: "故事条数", value: "48" },
      { label: "平均阅读", value: "4.8 min" },
    ],
    tags: ["插画融合", "可变卡片", "移动优先"],
  },
  {
    id: "podcast-lab",
    title: "Studio Leap 播客库",
    description:
      "音频节目按照主题与情绪维度双重标签过滤，内容较短的节目会自动收拢说明，长内容则保留吸睛引言。",
    cover:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
    category: "内容运营",
    accent: "#8FD0FF",
    deliverable: "节目库",
    team: "Leap Audio",
    metrics: [
      { label: "播放段", value: "120+" },
      { label: "平均停留", value: "7.3 分钟" },
    ],
    tags: ["多标签过滤", "引言卡片", "音频预览"],
  },
  {
    id: "artisan-club",
    title: "Gestion Artisan 联名派对",
    description:
      "专注线下快闪活动的品牌页，突出“主视觉 + 锁定 CTA”卡片，再穿插沉浸式图文模块以制造节奏差。",
    cover:
      "https://images.unsplash.com/photo-1500534319173-60f99c0f0b9e?auto=format&fit=crop&w=1600&q=80",
    category: "品牌事件",
    accent: "#D4A7FF",
    deliverable: "线下活动页",
    team: "Gestion Lab",
    metrics: [
      { label: "合作品牌", value: "14" },
      { label: "展期", value: "21 天" },
    ],
    tags: ["多赞助商", "滚动 CTA", "锁定导航"],
  },
  {
    id: "aurora-desk",
    title: "Aurora Workstation",
    description:
      "将系统设定、运行时状态与快捷卡片纵向拼接，配合瀑布流保证关键信息永远靠近视线中心。",
    cover:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    category: "SaaS 控制台",
    accent: "#9EF2FF",
    deliverable: "运维面板",
    team: "Aurora Core",
    metrics: [
      { label: "监控卡片", value: "30" },
      { label: "告警指标", value: "12" },
    ],
    tags: ["实时看板", "分段视图", "密集信息"],
  },
  {
    id: "paper-guide",
    title: "Paper Guide 课程拆解",
    description:
      "针对设计教学的多章节拆解页，引入“重点步骤 + 工具引用”结构，结合瀑布流让长文信息以模块化方式呈现。",
    cover:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1600&q=80",
    category: "教育活动",
    accent: "#FFB59D",
    deliverable: "课程详情",
    team: "Paper School",
    metrics: [
      { label: "章节", value: "14" },
      { label: "练习模板", value: "28" },
    ],
    tags: ["长文拆解", "步骤引导", "辅助线索"],
  },
];

type CategoryFilter = MasonryCategory | "all";

const categoryFilters: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "SaaS 控制台", label: "SaaS 控制台" },
  { value: "内容运营", label: "内容运营" },
  { value: "品牌事件", label: "品牌事件" },
  { value: "教育活动", label: "教育活动" },
  { value: "生活方式", label: "生活方式" },
];

const densityPresets: {
  id: LayoutDensity;
  label: string;
  description: string;
  className: string;
}[] = [
  {
    id: "airy",
    label: "宽松",
    description: "强调视觉呼吸与留白",
    className: "sm:columns-2 xl:columns-3 [column-gap:1.75rem] [&>*]:mb-7",
  },
  {
    id: "balanced",
    label: "均衡",
    description: "移动端与桌面一致性最佳",
    className:
      "sm:columns-2 lg:columns-3 2xl:columns-4 [column-gap:1.25rem] [&>*]:mb-5",
  },
  {
    id: "packed",
    label: "致密",
    description: "信息密集的灵感墙",
    className:
      "columns-2 sm:columns-3 lg:columns-4 2xl:columns-5 [column-gap:1rem] [&>*]:mb-4",
  },
];

export function MasonryLayoutSnippet() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [density, setDensity] = useState<LayoutDensity>("balanced");
  const [showMeta, setShowMeta] = useState(true);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") {
      return masonryProjects;
    }
    return masonryProjects.filter(
      (project) => project.category === activeCategory
    );
  }, [activeCategory]);

  const densityMeta = densityPresets.find((preset) => preset.id === density)!;

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.55)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-border/60 pb-4">
          <div>
            <p className="text-sm font-semibold text-foreground/90">
              CSS Columns Masonry
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              基于 `columns` 和 `break-inside: avoid` 构建瀑布流，切换分类或列宽后无需重新计算高度。
            </p>
          </div>
          <label
            htmlFor="masonry-meta-toggle"
            className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground/90"
          >
            <Switch
              id="masonry-meta-toggle"
              checked={showMeta}
              onCheckedChange={(value) => setShowMeta(Boolean(value))}
            />
            展示扩展信息
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground/80">
              筛选结果
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {filteredProjects.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeCategory === "all" ? "全部案例" : activeCategory}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground/80">
              列密度
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {densityMeta.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {densityMeta.description}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground/80">
              布局特性
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              浏览器原生瀑布流
            </p>
            <p className="text-xs text-muted-foreground">
              无需 JS 计算高度，自动填补空隙。
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((filter) => {
            const isActive = activeCategory === filter.value;
            return (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "rounded-full border border-border/60 px-3 text-xs",
                  !isActive &&
                    "bg-background/40 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveCategory(filter.value)}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-border/70 bg-background/80 p-1 text-xs">
          {densityPresets.map((preset) => {
            const isActive = preset.id === density;
            return (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "rounded-full px-3 text-xs",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setDensity(preset.id)}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          "columns-1 [column-fill:balance] gap-x-5 transition-all duration-300 *:break-inside-avoid",
          densityMeta.className
        )}
      >
        {filteredProjects.map((project) => (
          <article
            key={project.id}
            className="group relative mb-0 overflow-hidden rounded-3xl border border-border/70 bg-background/90 shadow-[0_25px_55px_-30px_rgba(15,23,42,0.65)] transition duration-300 hover:-translate-y-1"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={project.cover}
                alt={project.title}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-white/80">
                <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold tracking-[0.35em] text-white">
                  {project.category}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.2em] text-white">
                  <Sparkles className="size-3.5" />
                  {project.team}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className="rounded-full px-2 py-0.5 font-semibold text-foreground"
                  style={{
                    backgroundColor: `${project.accent}1a`,
                    color: project.accent,
                  }}
                >
                  {project.deliverable}
                </span>
                <span className="size-1 rounded-full bg-border/80" />
                <span>灵感卡片</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  {project.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
              </div>

              {showMeta ? (
                <>
                  <dl className="grid gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-xs">
                    {project.metrics.map((metric) => (
                      <div
                        key={`${project.id}-${metric.label}`}
                        className="flex items-center justify-between text-muted-foreground"
                      >
                        <span>{metric.label}</span>
                        <span className="font-semibold text-foreground">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </dl>

                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge
                        key={`${project.id}-${tag}`}
                        variant="secondary"
                        className="rounded-full border border-border/70 bg-background/70 px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
