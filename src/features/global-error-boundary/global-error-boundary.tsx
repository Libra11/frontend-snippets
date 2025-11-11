import { useState } from "react";
import { AlertTriangle, RefreshCw, ShieldCheck, Undo2 } from "lucide-react";

import { AppErrorBoundary, type ErrorBoundaryFallbackProps } from "@/components/app-error-boundary";
import { Button } from "@/components/ui/button";

function DemoServiceCard({ shouldCrash }: { shouldCrash: boolean }) {
  if (shouldCrash) {
    throw new Error("服务请求失败：500 INTERNAL_ERROR");
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.4)]">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Service Health
        </p>
        <h5 className="text-lg font-semibold">支付风控引擎</h5>
        <p className="text-sm text-muted-foreground">
          最近 15 分钟平均响应 42ms · 错误率 &lt; 0.1%
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "流量", value: "68k rpm" },
          { label: "峰值", value: "95%" },
          { label: "可用性", value: "99.98%" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-sm"
          >
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="font-semibold text-foreground">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoErrorFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-destructive">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/20">
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em]">
            Error captured
          </p>
          <p className="font-medium text-destructive/90">{error.message}</p>
        </div>
      </div>
      <p className="text-sm text-destructive/80">
        ErrorBoundary 捕获了子组件抛出的异常，阻止整页崩溃。你可以记录日志、上报监控或提供兜底提示。
      </p>
      <div className="flex flex-wrap gap-3">
        <Button size="sm" onClick={resetError}>
          <RefreshCw className="size-4" /> 重新挂载
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
          onClick={() => window.open("https://status.dev", "_blank")}
        >
          查看状态面板
        </Button>
      </div>
    </div>
  );
}

export function GlobalErrorBoundarySnippet() {
  const [shouldCrash, setShouldCrash] = useState(false);
  const [boundaryKey, setBoundaryKey] = useState(0);

  const simulateCrash = () => setShouldCrash(true);
  const resetDemo = () => {
    setShouldCrash(false);
    setBoundaryKey((key) => key + 1);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.6)] transition-colors dark:border-border/40 dark:bg-muted/30">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="space-y-4 lg:w-1/3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-primary">
            Safety
            <ShieldCheck className="size-3.5" />
          </div>
          <div>
            <h4 className="text-2xl font-semibold tracking-tight">全局错误捕获</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              通过 ErrorBoundary 拦截 React 渲染阶段的异常，提供兜底 UI、重试按钮以及错误上报钩子，确保业务面板不会整页白屏。
            </p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-primary" aria-hidden />
              <span>捕获同步渲染错误，并在 componentDidCatch 中收集堆栈用于埋点。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-secondary" aria-hidden />
              <span>支持 reset 回调，刷新挂载阶段重新拉取数据。</span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={simulateCrash}>
              <AlertTriangle className="size-4" /> 模拟异常
            </Button>
            <Button size="sm" variant="outline" onClick={resetDemo}>
              <Undo2 className="size-4" /> 恢复渲染
            </Button>
          </div>
        </div>

        <div className="lg:w-2/3">
          <AppErrorBoundary
            key={boundaryKey}
            onReset={resetDemo}
            fallback={DemoErrorFallback}
          >
            <DemoServiceCard shouldCrash={shouldCrash} />
          </AppErrorBoundary>
        </div>
      </div>

      <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-primary/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 bottom-[-140px] size-72 rounded-full bg-secondary/20 blur-3xl" aria-hidden />
    </div>
  );
}
