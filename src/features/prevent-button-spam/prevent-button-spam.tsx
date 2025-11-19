import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, Clock3, Loader2, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type CooldownMode = "per-action" | "global";
type ButtonVariant = {
  id: string;
  label: string;
  description: string;
  cooldown: number;
  mode: CooldownMode;
};

const buttonVariants: ButtonVariant[] = [
  {
    id: "deploy",
    label: "部署生产",
    description: "冷却 8 秒，防止重复点击触发多次 CI/CD",
    cooldown: 8,
    mode: "per-action",
  },
  {
    id: "send-mail",
    label: "发送运营邮件",
    description: "全局冷却，避免重复推送给同一批用户",
    cooldown: 12,
    mode: "global",
  },
  {
    id: "issue-credit",
    label: "发放积分",
    description: "动作独立互不影响，适用于子任务按钮",
    cooldown: 5,
    mode: "per-action",
  },
];

type CooldownState = {
  remaining: number;
  status: "idle" | "cooling" | "success";
};

const defaultCooldownState: CooldownState = {
  remaining: 0,
  status: "idle",
};

export function PreventButtonSpamSnippet() {
  const [cooldowns, setCooldowns] = useState<Record<string, CooldownState>>({});
  const [globalMode, setGlobalMode] = useState(false);
  const [autoReset, setAutoReset] = useState(true);
  const timersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const stopTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearInterval(timer);
      timersRef.current.delete(id);
    }
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearInterval(timer));
      timers.clear();
    };
  }, []);

  const startCooldown = useCallback(
    (variant: ButtonVariant) => {
      const { id, cooldown, mode } = variant;
      const targetId = mode === "global" || globalMode ? "global" : id;

      stopTimer(targetId);

      setCooldowns((prev) => ({
        ...prev,
        [targetId]: {
          remaining: cooldown,
          status: "cooling",
        },
      }));

      const timer = setInterval(() => {
        setCooldowns((prev) => {
          const next = prev[targetId];
          if (!next) {
            return prev;
          }

          const remaining = next.remaining - 1;
          if (remaining <= 0) {
            stopTimer(targetId);
            return {
              ...prev,
              [targetId]: {
                remaining: 0,
                status: autoReset ? "idle" : "success",
              },
            };
          }

          return {
            ...prev,
            [targetId]: {
              remaining,
              status: "cooling",
            },
          };
        });
      }, 1000);

      timersRef.current.set(targetId, timer);
    },
    [autoReset, globalMode, stopTimer],
  );

  const handleClick = useCallback(
    (variant: ButtonVariant) => {
      const mode = globalMode ? "global" : variant.mode;
      const cooldownState =
        cooldowns[mode === "global" ? "global" : variant.id] ?? defaultCooldownState;

      if (cooldownState.status === "cooling") {
        return;
      }

      startCooldown(variant);
    },
    [cooldowns, globalMode, startCooldown],
  );

  const getCooldownState = useCallback(
    (variant: ButtonVariant) => {
      const mode = globalMode ? "global" : variant.mode;
      return cooldowns[mode === "global" ? "global" : variant.id] ?? defaultCooldownState;
    },
    [cooldowns, globalMode],
  );

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-muted/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground/90">
              Button Cooldown Guard
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              通过局部状态 + timer 管理按钮冷却，防止用户重复点击造成多次请求。
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            连击保护
          </Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
            <span>强制启用全局冷却</span>
            <Switch checked={globalMode} onCheckedChange={setGlobalMode} />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
            <span>冷却结束后自动恢复可点击</span>
            <Switch checked={autoReset} onCheckedChange={setAutoReset} />
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {buttonVariants.map((variant) => {
          const cooldownState = getCooldownState(variant);
          const isCooling = cooldownState.status === "cooling";
          const isSuccess = cooldownState.status === "success";
          const mode = globalMode ? "global" : variant.mode;

          return (
            <div
              key={variant.id}
              className="space-y-4 rounded-3xl border border-border/70 bg-card/70 p-5 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.55)]"
            >
              <div className="space-y-2">
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  {mode === "global" ? "全局冷却" : "单次动作"}
                </Badge>
                <h3 className="text-lg font-semibold text-foreground">
                  {variant.label}
                </h3>
                <p className="text-sm text-muted-foreground">{variant.description}</p>
              </div>

              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
                冷却时长：{variant.cooldown}s
              </div>

              <Button
                type="button"
                disabled={isCooling}
                onClick={() => handleClick(variant)}
                className={cn("gap-2", isSuccess && "bg-emerald-600 hover:bg-emerald-600/90")}
              >
                {isCooling ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {cooldownState.remaining}s
                  </>
                ) : isSuccess ? (
                  <>
                    <BadgeCheck className="size-4" />
                    可再次执行
                  </>
                ) : (
                  <>
                    <Rocket className="size-4" />
                    触发操作
                  </>
                )}
              </Button>

              <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground/80">
                  <Clock3 className="size-3.5" />
                  状态：{cooldownState.status}
                </p>
                <p className="mt-1 text-muted-foreground/80">
                  {isCooling
                    ? `剩余 ${cooldownState.remaining}s`
                    : isSuccess && !autoReset
                      ? "需要用户手动再次点击恢复"
                      : "可立即触发"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
