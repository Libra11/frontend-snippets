import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type HeroProps = {
  snippetCount: number;
  keywordCount: number;
  freshestSnippet?: string;
};

export function Hero({ snippetCount, keywordCount, freshestSnippet }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-background to-secondary/15 px-8 py-12 shadow-[0_28px_80px_-55px_rgba(59,130,246,0.28)] transition-colors sm:px-10 dark:border-border/40 dark:from-primary/18 dark:via-background/10 dark:to-secondary/20 dark:shadow-[0_18px_60px_-50px_rgba(8,12,24,0.65)]"
    >
      <div className="pointer-events-none absolute -left-10 top-10 size-44 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 -bottom-16 size-52 rounded-full bg-accent/30 blur-3xl" aria-hidden />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
        <div className="space-y-6">
          <Badge
            variant="secondary"
            className="gap-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] dark:bg-foreground/10 dark:text-foreground"
          >
            精选 Snippets
          </Badge>
          <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            快速拼装日常所需的
            <span className="mx-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-primary">
              前端微功能
              <Sparkles className="size-4" />
            </span>
            ，保持交互体验领先一步。
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Libra Snippets 将高频复用的小组件、小动画与工具代码统一整理，随时复制即可投入项目。每一项功能都配备交互示例、实现思路、代码片段与延伸阅读，帮你从灵感到落地一步到位。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button size="lg" asChild>
              <a href="#snippets" className="flex items-center">
                立即浏览
                <ArrowRight className="ml-2 size-4" />
              </a>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <a href="#fresh" className="text-sm text-muted-foreground hover:text-foreground">
                查看最新功能
              </a>
            </Button>
          </div>
        </div>

        <div className="relative hidden h-full rounded-2xl border border-border/60 bg-background/80 p-6 shadow-inner transition-colors sm:flex sm:flex-col sm:justify-between dark:border-border/40 dark:bg-muted/20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              数据速览
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-foreground">{snippetCount}</h2>
            <p className="mt-1 text-sm text-muted-foreground">精选小功能，覆盖常用交互场景</p>
          </div>
          <dl className="mt-8 space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-foreground">
                <span className="size-2 rounded-full bg-primary" aria-hidden />
                专用标签
              </dt>
              <dd className="font-medium text-foreground">{keywordCount}</dd>
            </div>
            {freshestSnippet ? (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-foreground">
                  <span className="size-2 rounded-full bg-secondary" aria-hidden />
                  最新新增
                </dt>
                <dd className="max-w-[160px] truncate text-right font-medium text-foreground">
                  {freshestSnippet}
                </dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            持续扩充中 · 每周维护稳定版本
          </p>
        </div>
      </div>
    </section>
  );
}
