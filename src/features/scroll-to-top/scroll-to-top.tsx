import { useCallback, useRef } from "react";

import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    title: "浮动入口自动出现",
    description:
      "按钮通过监听滚动距离判断是否需要显示，平时保持隐藏，超过阈值后再渐进式浮现，既保证可见性又不遮挡内容。",
    note: "若页面有吸顶导航，建议适当提高阈值，避免按钮频繁闪现。",
  },
  {
    title: "平滑滚动体验",
    description:
      "点击时调用 `scrollTo({ behavior: 'smooth' })` 将视图平滑带回顶部，没有突兀跳动，符合现代交互体验。",
    note: "可在 prefers-reduced-motion 为 reduce 时退化为瞬间跳转，照顾低动效偏好用户。",
  },
  {
    title: "容器级适配",
    description:
      "通过 `getScrollContainer` 属性可监听任意滚动容器，无论是整页还是对话框、抽屉，都能保持同样的交互逻辑。",
    note: "确保容器开启 overflow-y: auto，并在组件挂载后再传入 DOM 引用。",
  },
  {
    title: "灵活的样式与阈值",
    description:
      "支持自定义按钮外观、浮动位置与触发阈值，可轻松融入不同的设计体系和页面结构。",
    note: "通过 className/buttonClassName 即可套用品牌色或修改形态。",
  },
  {
    title: "无障碍友好",
    description:
      "按钮带有 ARIA 标签并遵循用户的滚动偏好，可结合 `prefers-reduced-motion` 进一步优化动效。",
    note: "别忘了更新 aria-label 或在控件附近提供文字提示。",
  },
];

export function ScrollToTopSnippet() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const getScrollContainer = useCallback(() => scrollContainerRef.current, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/10 px-4 py-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="uppercase tracking-[0.28em]">
          Demo
        </Badge>
        向下滚动容器，观察按钮在合适的距离出现并支持平滑返回顶部。
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="relative max-h-[360px] overflow-y-auto rounded-3xl border border-border/70 bg-background/80 p-6 pr-8 shadow-inner"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background/95 via-background/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  {section.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground/90">
                  {section.description}
                </p>
                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
                  提示：{section.note}
                </div>
              </section>
            ))}
          </div>
        </div>

        <ScrollToTopButton
          getScrollContainer={getScrollContainer}
          threshold={180}
          className="pointer-events-none absolute bottom-6 right-6"
          buttonClassName="bg-primary text-primary-foreground hover:bg-primary/90"
        />
      </div>
    </div>
  );
}
