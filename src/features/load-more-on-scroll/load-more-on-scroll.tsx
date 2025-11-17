import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownCircle, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UpdateType = "campaign" | "experiment" | "release" | "insight" | "ops";

type GrowthUpdate = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  metricLabel: string;
  metricValue: string;
  delta: string;
  type: UpdateType;
  channel: string;
};

const growthUpdates: GrowthUpdate[] = [
  {
    id: "sync-landing",
    title: "FY25 官网落地页改版上线",
    description: "Hero 区块增加动态背景 + 可信 Logo，提升首屏停留。",
    timestamp: "今天 · 09:10",
    metricLabel: "CTR",
    metricValue: "4.2%",
    delta: "+18.3%",
    type: "release",
    channel: "网站 / 自然流量",
  },
  {
    id: "campaign-s2",
    title: "S2 运营活动邀请推送完成",
    description: "分渠道替换 CTA，新增沉默用户唤醒脚本。",
    timestamp: "今天 · 08:45",
    metricLabel: "覆盖",
    metricValue: "128k",
    delta: "+32.6%",
    type: "campaign",
    channel: "EDM · 短信",
  },
  {
    id: "experiment-handoff",
    title: "多触点转化实验（变体 B）",
    description: "实验窗口延长至 14 天，聚焦线索到付款阶段。",
    timestamp: "昨天 · 22:18",
    metricLabel: "首转率",
    metricValue: "12.4%",
    delta: "+7.1%",
    type: "experiment",
    channel: "线索运营",
  },
  {
    id: "release-mobile",
    title: "移动端工作台 2.3.0",
    description: "新增全局搜索 + AI 摘要，提升移动审批效率。",
    timestamp: "昨天 · 19:03",
    metricLabel: "活跃",
    metricValue: "5,820",
    delta: "+15.6%",
    type: "release",
    channel: "APP / iOS · Android",
  },
  {
    id: "insight-creator",
    title: "创作者意向洞察",
    description: "高价值创作者首次响应提升，但签约周期仍偏长。",
    timestamp: "昨天 · 15:27",
    metricLabel: "签约周期",
    metricValue: "11 天",
    delta: "-2.3 天",
    type: "insight",
    channel: "Creator Lab",
  },
  {
    id: "ops-cx",
    title: "客服排班优化",
    description: "夜间在线率提升 21%，SLA 达成率首次超过 96%。",
    timestamp: "昨天 · 10:02",
    metricLabel: "SLA",
    metricValue: "96.2%",
    delta: "+3.8%",
    type: "ops",
    channel: "Contact Center",
  },
  {
    id: "campaign-mini",
    title: "小程序裂变活动",
    description: "任务制玩法配合盲盒激励，沉默用户二次激活显著。",
    timestamp: "2 天前 · 20:41",
    metricLabel: "GMV",
    metricValue: "￥2.7M",
    delta: "+26.4%",
    type: "campaign",
    channel: "小程序 / 社交",
  },
  {
    id: "experiment-pricing",
    title: "阶梯价实验（区域灰度）",
    description: "北美地区选择档位更均衡，折扣依赖下降。",
    timestamp: "2 天前 · 16:20",
    metricLabel: "ARPU",
    metricValue: "￥482",
    delta: "+9.7%",
    type: "experiment",
    channel: "Billing",
  },
  {
    id: "release-data",
    title: "数据中台指标订阅",
    description: "提供跨项目订阅 / 分享能力，减少重复截图。",
    timestamp: "2 天前 · 13:09",
    metricLabel: "订阅数",
    metricValue: "942",
    delta: "+54.1%",
    type: "release",
    channel: "DataOS",
  },
  {
    id: "insight-edu",
    title: "教育客户留存分析",
    description: "寒暑假期间波动极大，需推出长期教研加值方案。",
    timestamp: "2 天前 · 09:17",
    metricLabel: "活跃教研",
    metricValue: "38%",
    delta: "-4.2%",
    type: "insight",
    channel: "Edu Team",
  },
  {
    id: "ops-logistics",
    title: "仓储履约升级",
    description: "补贴自动核销上线，账龄下降 11.8%，库存更健康。",
    timestamp: "3 天前 · 20:22",
    metricLabel: "库存周转",
    metricValue: "18.5 天",
    delta: "-2.4 天",
    type: "ops",
    channel: "Logistics",
  },
  {
    id: "campaign-brand",
    title: "品牌季小红书组合曝光",
    description: "达人共创策略带来更高点击与收藏。",
    timestamp: "3 天前 · 17:03",
    metricLabel: "收藏率",
    metricValue: "8.9%",
    delta: "+3.1%",
    type: "campaign",
    channel: "小红书",
  },
  {
    id: "experiment-ai",
    title: "AI 副驾投放策略实验",
    description: "自动生成创意和落地页 copy，线索单价下降。",
    timestamp: "3 天前 · 11:48",
    metricLabel: "线索成本",
    metricValue: "￥46",
    delta: "-12.6%",
    type: "experiment",
    channel: "Paid Ads",
  },
  {
    id: "release-csat",
    title: "服务评价闭环系统",
    description: "将评分与跟进列表打通，减少人工同步。",
    timestamp: "3 天前 · 09:10",
    metricLabel: "CSAT",
    metricValue: "4.8 / 5",
    delta: "+6.2%",
    type: "release",
    channel: "Service Ops",
  },
  {
    id: "insight-smb",
    title: "SMB 续费洞察",
    description: "智能提示欠费风险，减少 17% 的意外 churn。",
    timestamp: "4 天前 · 19:55",
    metricLabel: "续费率",
    metricValue: "81%",
    delta: "+5.1%",
    type: "insight",
    channel: "Customer Success",
  },
  {
    id: "ops-sec",
    title: "安全巡检自动化",
    description: "夜间巡检自动化覆盖 100% 核心服务。",
    timestamp: "4 天前 · 14:43",
    metricLabel: "告警恢复",
    metricValue: "4m 12s",
    delta: "-36%",
    type: "ops",
    channel: "SRE",
  },
];

const LOAD_STEP = 4;

const typeMeta: Record<
  UpdateType,
  { label: string; badgeClass: string; pillClass: string }
> = {
  campaign: {
    label: "营销活动",
    badgeClass: "bg-amber-500/15 text-amber-600 border-amber-200/60",
    pillClass: "bg-amber-500/10 text-amber-600",
  },
  experiment: {
    label: "实验",
    badgeClass: "bg-sky-500/10 text-sky-600 border-sky-300/60",
    pillClass: "bg-sky-500/15 text-sky-600",
  },
  release: {
    label: "版本发布",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-300/60",
    pillClass: "bg-emerald-500/15 text-emerald-600",
  },
  insight: {
    label: "洞察",
    badgeClass: "bg-purple-500/10 text-purple-600 border-purple-300/60",
    pillClass: "bg-purple-500/15 text-purple-600",
  },
  ops: {
    label: "运营 / 运维",
    badgeClass: "bg-slate-500/15 text-slate-600 border-slate-300/60",
    pillClass: "bg-slate-500/15 text-slate-600",
  },
};

type LoadStatus = "idle" | "loading" | "error";

const statusMeta: Record<
  LoadStatus,
  { label: string; hint: string; className: string }
> = {
  idle: {
    label: "向下滚动加载更多",
    hint: "滑到列表底部自动触发",
    className: "text-muted-foreground",
  },
  loading: {
    label: "努力拉取新内容...",
    hint: "正在同步最新节点",
    className: "text-primary",
  },
  error: {
    label: "网络抖动，请下拉重试",
    hint: "点击按钮或再次滑动即可重试",
    className: "text-destructive",
  },
};

export function LoadMoreOnScrollSnippet() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [visibleCount, setVisibleCount] = useState(LOAD_STEP);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const total = growthUpdates.length;
  const hasMore = visibleCount < total;

  const visibleUpdates = useMemo(
    () => growthUpdates.slice(0, visibleCount),
    [visibleCount],
  );

  useEffect(() => {
    return () => {
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
      }
    };
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || status === "loading") {
      return;
    }
    setStatus("loading");
    setErrorMessage(null);

    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
    }

    loadTimerRef.current = setTimeout(() => {
      const shouldFail = Math.random() < 0.18;

      if (shouldFail) {
        setStatus("error");
        setErrorMessage("请求暂时失败，稍后再试或继续下拉。");
        return;
      }

      setVisibleCount((prev) => {
        const nextCount = Math.min(prev + LOAD_STEP, total);
        return nextCount;
      });
      setStatus("idle");
    }, 900);
  }, [hasMore, status, total]);

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const container = containerRef.current;
    const sentinel = sentinelRef.current;

    if (!container || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      {
        root: container,
        threshold: 0.15,
        rootMargin: "80px",
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, hasMore, visibleUpdates.length]);

  const progress = Math.round((visibleCount / total) * 100);
  const statusInfo = statusMeta[status];

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-muted/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground/90">
              Growth Feed
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              轻量瀑布流，滑到列表底部时触发“下拉加载更多”，无感刷新
              Feed。
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">
              {visibleCount}/{total}
            </p>
            <p>已加载 {progress}%</p>
          </div>
        </div>

        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-border/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative max-h-[420px] overflow-y-auto rounded-[26px] border border-border/70 bg-card/70 p-5 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.55)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-card/95 via-card/30 to-transparent" />
        <ul className="space-y-4">
          {visibleUpdates.map((update) => {
            const meta = typeMeta[update.type];
            return (
              <li
                key={update.id}
                className="rounded-[22px] border border-border/70 bg-background/90 p-4 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.55)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "w-fit border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.28em]",
                        meta.badgeClass,
                      )}
                    >
                      {meta.label}
                    </Badge>
                    <h3 className="text-base font-semibold text-foreground">
                      {update.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {update.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                      {update.metricLabel}
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {update.metricValue}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        update.delta.includes("-")
                          ? "text-rose-500"
                          : "text-emerald-500",
                      )}
                    >
                      {update.delta}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] tracking-[0.2em] text-muted-foreground/80">
                    {update.timestamp}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      meta.pillClass,
                    )}
                  >
                    {update.channel}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <div
          ref={sentinelRef}
          className="mt-5 flex flex-col items-center gap-2 border-t border-dashed border-border/60 pt-4 text-center"
        >
          {hasMore ? (
            <>
              <ArrowDownCircle
                className={cn(
                  "size-6 animate-bounce text-muted-foreground",
                  status === "loading" && "text-primary",
                  status === "error" && "text-destructive",
                )}
              />
              <p className={cn("text-sm font-medium", statusInfo.className)}>
                {statusInfo.label}
              </p>
              <p className="text-xs text-muted-foreground">{statusInfo.hint}</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={status === "loading"}
                  onClick={loadMore}
                  className="gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="size-4" />
                  手动加载
                </Button>
              </div>
              {errorMessage ? (
                <p className="text-xs text-destructive">{errorMessage}</p>
              ) : null}
            </>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                已展示全部 {total} 条动态
              </p>
              <p className="text-xs text-muted-foreground">
                继续关注新的增长节点...
              </p>
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card/95 via-card/30 to-transparent" />
      </div>
    </section>
  );
}
