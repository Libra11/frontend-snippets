/**
 * Author: Libra
 * Date: 2025-11-09 00:40:47
 * LastEditors: Libra
 * Description:
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Inbox,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type RequestStatus = "idle" | "loading" | "success" | "empty" | "error";
type RequestMode = "success" | "empty" | "error";

type InsightRecord = {
  id: string;
  label: string;
  value: string;
  delta: string;
};

const MOCK_INSIGHTS: InsightRecord[] = [
  {
    id: "orders",
    label: "今日订单",
    value: "1,248",
    delta: "+12.4%",
  },
  {
    id: "revenue",
    label: "营收金额",
    value: "¥ 382,960",
    delta: "+8.1%",
  },
  {
    id: "conversion",
    label: "转化率",
    value: "4.62%",
    delta: "+0.6%",
  },
  {
    id: "support",
    label: "客服响应",
    value: "98.2%",
    delta: "+2.3%",
  },
];

const STATUS_META: Record<
  RequestStatus,
  { label: string; tone: "neutral" | "accent" | "muted" | "danger" }
> = {
  idle: { label: "等待请求", tone: "muted" },
  loading: { label: "加载中", tone: "neutral" },
  success: { label: "加载成功", tone: "accent" },
  empty: { label: "内容为空", tone: "muted" },
  error: { label: "请求失败", tone: "danger" },
};

const ACTIONS: { id: RequestMode; label: string; helper: string }[] = [
  {
    id: "success",
    label: "加载成功数据",
    helper: "返回指标列表",
  },
  {
    id: "empty",
    label: "加载为空",
    helper: "接口可用但无数据",
  },
  {
    id: "error",
    label: "模拟错误",
    helper: "展示错误兜底",
  },
];

const REQUEST_DELAY = 900;

export function DataRequestStatusSnippet() {
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [mode, setMode] = useState<RequestMode>("success");
  const [records, setRecords] = useState<InsightRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusBadgeClass = useMemo(() => {
    switch (STATUS_META[status].tone) {
      case "accent":
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-200";
      case "neutral":
        return "border-border/60 bg-muted text-foreground";
      case "danger":
        return "border-destructive/40 bg-destructive/10 text-destructive";
      default:
        return "border-border/70 bg-muted/50 text-muted-foreground";
    }
  }, [status]);

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanupTimer();
  }, []);

  const handleRequest = (nextMode: RequestMode) => {
    setMode(nextMode);
    setStatus("loading");
    setErrorMessage(null);
    setRecords([]);
    cleanupTimer();

    timerRef.current = setTimeout(() => {
      if (nextMode === "success") {
        setRecords(MOCK_INSIGHTS);
        setStatus("success");
      } else if (nextMode === "empty") {
        setRecords([]);
        setStatus("empty");
      } else {
        setErrorMessage("服务暂时不可用，请稍后重试或联系值班同学。");
        setStatus("error");
      }
    }, REQUEST_DELAY + Math.random() * 600);
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            正在请求 `{mode}` 场景的数据，请稍候...
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-border/60 bg-muted/40 p-4"
              >
                <Skeleton className="h-3 w-1/3 bg-muted" />
                <Skeleton className="h-7 w-2/3 bg-muted" />
                <Skeleton className="h-3 w-1/2 bg-muted" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-500" />
            已成功获取最新指标，以下数据直接复用同一套状态。
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {records.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border/60 bg-background/95 p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <span>{item.label}</span>
                  <ArrowUpRight className="size-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-2xl font-semibold text-foreground">
                  {item.value}
                </div>
                <div className="mt-1 text-sm text-emerald-500">
                  {item.delta} 相比昨日
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (status === "empty") {
      return (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/30 px-8 py-12 text-center">
          <Inbox className="size-10 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">暂无数据</p>
            <p className="text-xs text-muted-foreground">
              接口调用成功，但未返回可展示的内容。可提示用户调整筛选条件或更换日期范围。
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRequest("success")}
          >
            <Sparkles className="mr-2 size-4" />
            试试加载有数据的场景
          </Button>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">接口请求失败</p>
              <p className="text-destructive/80">{errorMessage}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => handleRequest(mode)}
            >
              <RefreshCw className="mr-2 size-4" />
              重试当前请求
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleRequest("success")}
            >
              加载成功示例
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-border/60 bg-muted/30 px-5 py-4">
        <div className="space-y-1 text-sm">
          <p className="font-medium text-foreground">准备就绪</p>
          <p className="text-xs text-muted-foreground">
            点击上方按钮触发请求，组件会基于相同的状态管理逻辑切换视图。
          </p>
        </div>
        <Sparkles className="size-5 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border/70">
        <CardHeader className="space-y-3 pb-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-2xl">数据请求状态板</CardTitle>
              <CardDescription>
                使用一套状态机逻辑复用请求的加载、成功、为空和错误兜底视图，适合
                Dashboard 或列表页。
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={cn("px-3 py-1 text-xs", statusBadgeClass)}
            >
              {STATUS_META[status].label}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            该示例将接口状态抽象为统一的请求管理：点击不同按钮模拟接口返回，组件会自动切换到对应的占位、成功、空状态或错误视图，实现逻辑复用并保持一致体验。
          </p>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            {ACTIONS.map((action) => {
              const isActive = mode === action.id;
              return (
                <Button
                  key={action.id}
                  type="button"
                  size="default"
                  disabled={status === "loading"}
                  onClick={() => handleRequest(action.id)}
                  className={cn(
                    "group flex-1 min-w-[190px] justify-start gap-4 rounded-xl border border-border/60 bg-background/95 px-4 py-5 text-left shadow-sm transition hover:border-border hover:bg-muted/60 focus-visible:ring-1 focus-visible:ring-ring sm:flex-none",
                    "h-auto min-h-[92px]",
                    status === "loading" ? "opacity-75" : undefined,
                    isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-md dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
                      : "text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground transition group-hover:border-border/80 group-hover:bg-muted/60",
                      isActive &&
                        "border-emerald-200 bg-white text-emerald-500 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300"
                    )}
                  >
                    {action.id === "success" && (
                      <CheckCircle2 className="size-4" />
                    )}
                    {action.id === "empty" && <Inbox className="size-4" />}
                    {action.id === "error" && (
                      <AlertCircle className="size-4" />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span
                      className={cn(
                        "text-sm font-semibold transition",
                        isActive
                          ? "text-emerald-700 dark:text-emerald-200"
                          : "text-foreground"
                      )}
                    >
                      {action.label}
                    </span>
                    <span
                      className={cn(
                        "text-xs text-muted-foreground transition group-hover:text-foreground/80",
                        isActive
                          ? "text-emerald-700/80 dark:text-emerald-200/80"
                          : undefined
                      )}
                    >
                      {action.helper}
                    </span>
                  </div>
                </Button>
              );
            })}
            <Button
              type="button"
              size="sm"
              className="gap-2"
              disabled={status === "loading"}
              onClick={() => handleRequest(mode)}
            >
              <RefreshCw
                className={cn("size-4", status === "loading" && "animate-spin")}
              />
              重新请求
            </Button>
          </div>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
